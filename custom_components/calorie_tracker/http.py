"""HTTP endpoints for Calorie Tracker."""

from __future__ import annotations

from datetime import UTC, datetime
from io import BytesIO
import json
import logging
import mimetypes
from pathlib import Path
import re
from typing import Any
from uuid import uuid4

from aiohttp import web
from PIL import Image, ImageOps, UnidentifiedImageError

from homeassistant.components import ai_task
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN, PREFERRED_IMAGE_ANALYZER
from .linked_components import discover_image_analyzers

_LOGGER = logging.getLogger(__name__)


def _attempt_recover_json(text: str) -> str:
    """Best-effort attempt to recover truncated JSON strings.

    This will:
    - If the text contains a JSON code fence, extract the inner content first (calling code may already do this).
    - Try to find the last matching closing brace '}' or bracket ']' and trim the text after it.
    - If the text ends with an unterminated quote, try to close it.
    - Return the original text if no obvious recovery is possible.

    This is a best-effort helper to improve resilience against LLM truncation; it is not a
    guarantee of correctness and recovered JSON should be treated cautiously.
    """
    if not isinstance(text, str) or not text:
        return text

    # If there is a fenced code block, prefer its contents (some providers wrap JSON)
    m = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if m:
        text = m.group(1)

    # Try to find the last closing brace or bracket and trim trailing garbage
    last_brace = max(text.rfind("}"), text.rfind("]"))
    if last_brace != -1 and last_brace < len(text) - 1:
        trimmed = text[: last_brace + 1]
        # Quick sanity: must start with { or [ to be JSON
        trimmed_stripped = trimmed.lstrip()
        if trimmed_stripped.startswith(("{", "[")):
            _LOGGER.debug(
                "Attempting to recover truncated JSON by trimming to last brace at pos %s",
                last_brace,
            )
            return trimmed

    # If there are unmatched quotes at the end, try to close them
    # Count unescaped quotes
    def count_unescaped(s, ch='"'):
        cnt = 0
        escaped = False
        for c in s:
            if c == "\\" and not escaped:
                escaped = True
                continue
            if c == '"' and not escaped:
                cnt += 1
            escaped = False
        return cnt

    quote_count = count_unescaped(text, '"')
    if quote_count % 2 == 1:
        # Odd number of quotes - try appending a closing quote and hope for the best
        _LOGGER.debug("Attempting to recover JSON by appending a closing quote")
        return text + '"'

    return text


def guess_mime_type(filename: str, image_data: bytes) -> str | None:
    """Guess the MIME type of an image from its filename or header."""
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type:
        return mime_type
    # Fallback: check for JPEG/PNG/GIF headers
    if image_data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if image_data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    return None


def _shrink_image_to_limit(image_data: bytes, limit_bytes: int) -> tuple[bytes, str]:
    """Re-encode image as JPEG under limit_bytes.

    Returns a tuple of (image_bytes, mime_type).
    """

    try:
        with Image.open(BytesIO(image_data)) as img:
            image = ImageOps.exif_transpose(img)
            image = image.convert("RGB")
    except UnidentifiedImageError as exc:
        raise HomeAssistantError("Uploaded file is not a supported image") from exc

    quality = 92
    min_quality = 50
    resize_factor = 0.9

    while True:
        buffer = BytesIO()
        image.save(buffer, format="JPEG", optimize=True, quality=quality)
        compressed = buffer.getvalue()
        if len(compressed) <= limit_bytes:
            return compressed, "image/jpeg"

        if quality > min_quality:
            quality -= 7
            continue

        new_width = max(1, int(image.width * resize_factor))
        new_height = max(1, int(image.height * resize_factor))
        if new_width == image.width and new_height == image.height:
            break
        if new_width < 64 or new_height < 64:
            break
        image = image.resize((new_width, new_height), _IMAGE_RESAMPLING)

    limit_mb = limit_bytes / (1024 * 1024)
    raise HomeAssistantError(
        f"Image is too large even after resizing. Please upload a smaller photo (<= {limit_mb:.1f} MB)."
    )


def _prepare_image_for_analyzer(
    image_data: bytes,
    mime_type: str,
    limit_bytes: int,
) -> tuple[bytes, str, bool]:
    """Ensure image payload stays under provider size limit."""

    if len(image_data) <= limit_bytes:
        return image_data, mime_type, False

    new_data, enforced_mime = _shrink_image_to_limit(image_data, limit_bytes)
    return new_data, enforced_mime, True


_MEDIA_UPLOAD_SUBDIR = Path("calorie_tracker") / "uploads"
_FALLBACK_MEDIA_SOURCE_ID = "calorie_tracker_local"
_TASK_NAME_FOOD = "Calorie Tracker Food Analysis"
_TASK_NAME_BODY_FAT = "Calorie Tracker Body Fat Analysis"
_MAX_ANALYZER_IMAGE_BYTES = 3 * 1024 * 1024  # 5 MB provider limit (Anthropic)

try:  # Pillow >= 9
    _IMAGE_RESAMPLING = Image.Resampling.LANCZOS
except AttributeError:  # Pillow < 9
    _IMAGE_RESAMPLING = Image.LANCZOS


def _ensure_text(value: Any) -> str:
    """Return string representation for AI Task data payloads."""

    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return str(value)


def _extract_json_dict(content: str) -> dict[str, Any] | None:
    """Extract JSON object from AI response, handling fenced code blocks."""

    if not isinstance(content, str):
        return None

    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", content)
    if match:
        content = match.group(1)

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        recovered = _attempt_recover_json(content)
        if recovered and recovered != content:
            try:
                return json.loads(recovered)
            except json.JSONDecodeError:
                return None
    return None


def _validate_ai_task_entity(
    hass: HomeAssistant, config_entry_id: str, ai_task_entity_id: str
) -> bool:
    """Ensure ai_task entity belongs to the expected config entry."""

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.async_get(ai_task_entity_id)
    return bool(
        entity_entry
        and entity_entry.config_entry_id
        and entity_entry.config_entry_id == config_entry_id
    )


def _resolve_media_directory(hass: HomeAssistant) -> tuple[str, Path]:
    """Return a writable media directory and its source id.

    Prefer configured media directories; fall back to hass.config.path("media") if
    none are writable (common in dev containers where /media is read-only).
    """

    media_dirs = hass.config.media_dirs or {}
    last_error: str | None = None

    for source_id, base_path in media_dirs.items():
        base_dir = Path(base_path)
        dest_dir = base_dir / _MEDIA_UPLOAD_SUBDIR
        try:
            dest_dir.mkdir(parents=True, exist_ok=True)
        except (OSError, PermissionError) as err:
            last_error = f"{base_dir}: {err}"
            continue
        return source_id, base_dir

    fallback_base = Path(hass.config.path("media"))
    fallback_dest = fallback_base / _MEDIA_UPLOAD_SUBDIR
    fallback_dest.mkdir(parents=True, exist_ok=True)

    fallback_source_id = next(
        (
            source_id
            for source_id, base_path in media_dirs.items()
            if Path(base_path) == fallback_base
        ),
        None,
    )
    if fallback_source_id is None:
        fallback_source_id = _FALLBACK_MEDIA_SOURCE_ID
        hass.config.media_dirs[fallback_source_id] = str(fallback_base)

    hass.data.setdefault(DOMAIN, {})
    warn_key = "media_dir_warning_logged"
    if last_error and not hass.data[DOMAIN].get(warn_key):
        _LOGGER.warning(
            "Calorie Tracker is storing uploads in %s because configured media "
            "directories were not writable (%s)",
            fallback_dest,
            last_error,
        )
        hass.data[DOMAIN][warn_key] = True

    return fallback_source_id, fallback_base


async def _async_save_media_attachment(
    hass: HomeAssistant,
    *,
    filename: str,
    mime_type: str,
    image_data: bytes,
) -> tuple[str, Path]:
    """Persist uploaded image to the media directory and return media source ID."""

    source_id, base_dir = _resolve_media_directory(hass)
    suffix = Path(filename or "").suffix
    if not suffix:
        suffix = mimetypes.guess_extension(mime_type, False) or ".jpg"

    unique_name = (
        f"{datetime.now(tz=UTC).strftime('%Y%m%d_%H%M%S')}_{uuid4().hex}{suffix}"
    )
    dest_dir = base_dir / _MEDIA_UPLOAD_SUBDIR
    dest_dir.mkdir(parents=True, exist_ok=True)

    def _write_file() -> Path:
        file_path = dest_dir / unique_name
        file_path.write_bytes(image_data)
        return file_path

    file_path = await hass.async_add_executor_job(_write_file)
    relative_path = file_path.relative_to(base_dir).as_posix()
    media_content_id = f"media-source://media_source/{source_id}/{relative_path}"
    return media_content_id, file_path


async def _async_cleanup_media_attachment(hass: HomeAssistant, path: Path) -> None:
    """Delete a temporary media attachment from disk."""

    def _remove() -> None:
        path.unlink(missing_ok=True)

    await hass.async_add_executor_job(_remove)


async def _async_run_image_analysis(
    hass: HomeAssistant,
    *,
    ai_task_entity_id: str,
    instructions: str,
    filename: str,
    mime_type: str,
    image_data: bytes,
    task_name: str,
) -> Any:
    """Store attachment, run AI Task analysis, and return raw data."""

    media_content_id, file_path = await _async_save_media_attachment(
        hass,
        filename=filename,
        mime_type=mime_type,
        image_data=image_data,
    )
    try:
        result = await ai_task.async_generate_data(
            hass,
            task_name=task_name,
            entity_id=ai_task_entity_id,
            instructions=instructions,
            attachments=[{"media_content_id": media_content_id}],
        )
        return result.data
    finally:
        await _async_cleanup_media_attachment(hass, file_path)


class CalorieTrackerPhotoUploadView(HomeAssistantView):
    """Handle photo uploads for calorie analysis."""

    url = "/api/calorie_tracker/upload_photo"
    name = "api:calorie_tracker:upload_photo"
    requires_auth = True

    async def post(self, request) -> web.Response:
        """Handle photo upload and analysis."""
        hass: HomeAssistant = request.app["hass"]

        # Get multipart data
        reader = await request.multipart()
        config_entry_id = None
        ai_task_entity_id = None
        image_data = None
        description = None
        filename = ""

        async for field in reader:
            if field.name == "config_entry":
                config_entry_id = await field.text()
            elif field.name == "ai_task_entity_id":
                ai_task_entity_id = await field.text()
            elif field.name == "image":
                image_data = await field.read()
                filename = getattr(field, "filename", "")
            elif field.name == "model":
                await field.text()  # Legacy field, no longer used
            elif field.name == "description":
                description = await field.text()

        if not config_entry_id or not ai_task_entity_id or not image_data:
            return web.json_response(
                {"error": "config_entry, ai_task_entity_id, and image are required"},
                status=400,
            )

        mime_type = guess_mime_type(filename, image_data)
        if mime_type not in ("image/jpeg", "image/png", "image/gif"):
            return web.json_response(
                {
                    "error": f"Unsupported image type: {mime_type}. Only JPEG, PNG, and GIF are supported."
                },
                status=400,
            )

        # Find the analyzer config entry
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry:
            return web.json_response(
                {"error": "Analyzer config entry not found"}, status=404
            )

        if not _validate_ai_task_entity(hass, config_entry_id, ai_task_entity_id):
            return web.json_response(
                {"error": "Selected analyzer does not match config entry"},
                status=400,
            )

        original_size = len(image_data)
        try:
            image_data, mime_type, resized = await hass.async_add_executor_job(
                _prepare_image_for_analyzer,
                image_data,
                mime_type,
                _MAX_ANALYZER_IMAGE_BYTES,
            )
        except HomeAssistantError as exc:
            return web.json_response({"error": str(exc)}, status=400)

        if resized:
            _LOGGER.debug(
                "Resized uploaded food photo from %s bytes to %s bytes",
                original_size,
                len(image_data),
            )

        # Check if macros are enabled for this user
        calorie_tracker_entries = [
            entry
            for entry in hass.config_entries.async_entries("calorie_tracker")
            if entry.state == ConfigEntryState.LOADED
        ]

        macros_enabled = False
        if calorie_tracker_entries:
            # Get the first (and typically only) calorie tracker config entry
            tracker_entry = calorie_tracker_entries[0]
            macros_enabled = tracker_entry.options.get("track_macros", False)

        if macros_enabled:
            prompt = (
                "For each distinct food item present in the image, estimate: (1) total calories, and (2) grams of protein, fat, carbs, and alcohol. "
                "Round each macro gram value to the nearest tenth (e.g., 7.3). "
                "Return ONLY a JSON object with a single top-level key 'food_items' whose value is an array. "
                "Each array element must be an object with these exact keys: 'name' (string), 'calories' (integer), 'protein' (number), 'fat' (number), 'carbs' (number), 'alcohol' (number). "
                "Respond ONLY with that JSON object. No narration, no markdown fences."
            )
        else:
            prompt = (
                "For each distinct food item present in the image, estimate total calories. "
                "Return ONLY a JSON object with key 'food_items' whose value is an array of objects each with 'name' (string) and 'calories' (integer). "
                "Respond ONLY with that JSON object. No narration, no markdown fences."
            )

        if description:
            prompt = (
                f"The user provided this description of the food: '{description}'. "
                + prompt
            )

        try:
            ai_result = await _async_run_image_analysis(
                hass,
                ai_task_entity_id=ai_task_entity_id,
                instructions=prompt,
                filename=filename,
                mime_type=mime_type,
                image_data=image_data,
                task_name=_TASK_NAME_FOOD,
            )
            raw_content = _ensure_text(ai_result)
        except (HomeAssistantError, ValueError) as exc:
            _LOGGER.error("Error analyzing food photo: %s", exc)
            return web.json_response(
                {"error": f"Failed to analyze image: {exc}"}, status=500
            )
        parsed_content = _extract_json_dict(raw_content)
        if not parsed_content:
            _LOGGER.error("Could not parse AI response as JSON: %s", raw_content)
            return web.json_response(
                {
                    "success": False,
                    "error": "Could not parse AI response as JSON",
                    "raw_result": raw_content,
                }
            )

        try:
            food_items_array = parsed_content.get("food_items", [])
            food_items_list: list[dict] = []
            for item in food_items_array:
                base = {
                    "food_item": item.get("name"),
                    "calories": item.get("calories"),
                }
                for src_key in ("protein", "fat", "carbs", "alcohol"):
                    if src_key in item and isinstance(item[src_key], (int, float)):
                        val = float(item[src_key])
                        base[src_key] = round(val * 10) / 10.0
                food_items_list.append(base)
        except (AttributeError, TypeError) as exc:
            _LOGGER.error("Malformed AI response payload: %s", exc)
            return web.json_response(
                {
                    "success": False,
                    "error": "Could not parse AI response as JSON",
                    "raw_result": raw_content,
                }
            )

        return web.json_response(
            {
                "success": True,
                "food_items": food_items_list,
                "raw_result": raw_content,
            }
        )


class CalorieTrackerFetchAnalyzersView(HomeAssistantView):
    """HTTP endpoint to fetch available image analyzers."""

    url = "/api/calorie_tracker/fetch_analyzers"
    name = "api:calorie_tracker:fetch_analyzers"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Return the current list of available image analyzers."""
        hass: HomeAssistant = request.app["hass"]

        analyzers = await discover_image_analyzers(hass)
        return web.json_response({"analyzers": analyzers})


class CalorieTrackerSetPreferredAnalyzerView(HomeAssistantView):
    """HTTP endpoint to set preferred image analyzer for a user."""

    url = "/api/calorie_tracker/set_preferred_analyzer"
    name = "api:calorie_tracker:set_preferred_analyzer"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        """Set or clear the preferred image analyzer for a config entry."""
        hass: HomeAssistant = request.app["hass"]

        try:
            data = await request.json()
        except (ValueError, TypeError):
            return web.json_response({"error": "Invalid JSON data"}, status=400)

        config_entry_id = data.get("config_entry_id")
        analyzer_data = data.get("analyzer_data")

        # Validate input
        if not config_entry_id:
            return web.json_response(
                {"error": "config_entry_id is required"}, status=400
            )

        # Find the config entry
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry or entry.domain != "calorie_tracker":
            return web.json_response(
                {"error": "Calorie tracker config entry not found"}, status=404
            )

        # Update or remove the preferred analyzer
        current_data = dict(entry.data or {})
        if analyzer_data:
            current_data[PREFERRED_IMAGE_ANALYZER] = analyzer_data
        else:
            # Remove the preferred analyzer key if present
            current_data.pop(PREFERRED_IMAGE_ANALYZER, None)

        hass.config_entries.async_update_entry(entry, data=current_data)

        return web.json_response({"success": True})


class CalorieTrackerGetPreferredAnalyzerView(HomeAssistantView):
    """HTTP endpoint to get preferred image analyzer for a user."""

    url = "/api/calorie_tracker/get_preferred_analyzer"
    name = "api:calorie_tracker:get_preferred_analyzer"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        """Get the preferred image analyzer for a config entry."""
        hass: HomeAssistant = request.app["hass"]

        try:
            data = await request.json()
        except (ValueError, TypeError):
            return web.json_response({"error": "Invalid JSON data"}, status=400)

        config_entry_id = data.get("config_entry_id")

        if not config_entry_id:
            return web.json_response(
                {"error": "config_entry_id is required"}, status=400
            )

        # Find the config entry
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry or entry.domain != "calorie_tracker":
            return web.json_response(
                {"error": "Calorie tracker config entry not found"}, status=404
            )

        preferred_analyzer = entry.data.get(PREFERRED_IMAGE_ANALYZER)
        return web.json_response({"preferred_analyzer": preferred_analyzer})


class CalorieTrackerBodyFatAnalysisView(HomeAssistantView):
    """Handle body fat analysis from photos."""

    url = "/api/calorie_tracker/analyze_body_fat"
    name = "api:calorie_tracker:analyze_body_fat"
    requires_auth = True

    async def post(self, request) -> web.Response:
        """Handle body fat analysis from photo."""
        hass: HomeAssistant = request.app["hass"]

        # Get multipart data
        reader = await request.multipart()
        config_entry_id = None
        ai_task_entity_id = None
        image_data = None
        filename = None

        while True:
            part = await reader.next()
            if part is None:
                break

            if part.name == "config_entry":
                config_entry_id = await part.text()
            elif part.name == "ai_task_entity_id":
                ai_task_entity_id = await part.text()
            elif part.name == "model":
                await part.text()  # Legacy field, ignored
            elif part.name == "image":
                filename = part.filename
                image_data = await part.read()

        if not config_entry_id or not ai_task_entity_id or not image_data:
            return web.json_response(
                {
                    "error": "Missing required fields: config_entry, ai_task_entity_id, image",
                },
                status=400,
            )

        # Find the config entry for the LLM integration
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry:
            return web.json_response({"error": "Config entry not found"}, status=404)

        if not _validate_ai_task_entity(hass, config_entry_id, ai_task_entity_id):
            return web.json_response(
                {"error": "Selected analyzer does not match config entry"},
                status=400,
            )

        try:
            # Determine MIME type
            mime_type = guess_mime_type(filename or "image", image_data)
            if not mime_type:
                return web.json_response(
                    {"error": "Could not determine image MIME type"}, status=400
                )

            original_size = len(image_data)
            try:
                image_data, mime_type, resized = await hass.async_add_executor_job(
                    _prepare_image_for_analyzer,
                    image_data,
                    mime_type,
                    _MAX_ANALYZER_IMAGE_BYTES,
                )
            except HomeAssistantError as exc:
                return web.json_response({"error": str(exc)}, status=400)

            if resized:
                _LOGGER.debug(
                    "Resized body fat photo from %s bytes to %s bytes",
                    original_size,
                    len(image_data),
                )

            prompt = (
                "Analyze this image to estimate body fat percentage. Look at the torso area and provide your analysis. "
                "Be realistic and professional - only analyze what you can clearly see in the image. "
                "Return ONLY a JSON object with 'body_fat_percentage' (number) field. "
                "Respond ONLY with a valid JSON object. Do not include any explanation or extra text."
            )

            ai_result = await _async_run_image_analysis(
                hass,
                ai_task_entity_id=ai_task_entity_id,
                instructions=prompt,
                filename=filename or "body-fat.jpg",
                mime_type=mime_type,
                image_data=image_data,
                task_name=_TASK_NAME_BODY_FAT,
            )
            raw_result = _ensure_text(ai_result)
            _LOGGER.debug("Body fat analysis raw result: %s", raw_result)

            parsed_content = _extract_json_dict(raw_result)
            if parsed_content and "body_fat_percentage" in parsed_content:
                body_fat_percentage = parsed_content.get("body_fat_percentage")
                if (
                    isinstance(body_fat_percentage, (int, float))
                    and 3 <= body_fat_percentage <= 50
                ):
                    body_fat_data = {
                        "measurement_type": "body_fat",
                        "percentage": float(body_fat_percentage),
                    }
                    return web.json_response(
                        {
                            "success": True,
                            "body_fat_data": body_fat_data,
                            "raw_result": raw_result,
                        }
                    )
                _LOGGER.debug(
                    "Rejected percentage %s%% (out of range 3-50%%)",
                    body_fat_percentage,
                )

            # Fallback: try regex parsing if structured JSON not usable
            body_fat_percentage = None
            patterns = [
                r"body_fat_percentage[\"']?\s*:\s*(\d+(?:\.\d+)?)",
                r"(\d+(?:\.\d+)?)%?\s*body\s*fat",
                r"(\d+(?:\.\d+)?)%",
            ]

            for pattern in patterns:
                percentage_match = re.search(pattern, raw_result, re.IGNORECASE)
                if percentage_match:
                    try:
                        body_fat_percentage = float(percentage_match.group(1))
                        if 3 <= body_fat_percentage <= 50:
                            _LOGGER.debug(
                                "Extracted body fat percentage via regex: %s%%",
                                body_fat_percentage,
                            )
                            body_fat_data = {
                                "measurement_type": "body_fat",
                                "percentage": body_fat_percentage,
                            }

                            return web.json_response(
                                {
                                    "success": True,
                                    "body_fat_data": body_fat_data,
                                    "raw_result": raw_result,
                                }
                            )
                    except ValueError:
                        continue

            return web.json_response(
                {
                    "success": False,
                    "error": "Could not extract body fat percentage from analysis",
                    "raw_result": raw_result,
                }
            )

        except Exception as e:
            _LOGGER.exception("Error during body fat analysis")
            return web.json_response({"error": f"Analysis failed: {e!s}"}, status=500)
