"""HTTP endpoints for Calorie Tracker."""

from __future__ import annotations

import base64
import json
import logging
import mimetypes
import re

import aiohttp
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from .const import PREFERRED_IMAGE_ANALYZER
from .linked_components import discover_image_analyzers

_LOGGER = logging.getLogger(__name__)


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
        image_data = None
        model = None
        description = None

        async for field in reader:
            if field.name == "config_entry":
                config_entry_id = await field.text()
            elif field.name == "image":
                image_data = await field.read()
                filename = getattr(field, "filename", "")
            elif field.name == "model":
                model = await field.text()
            elif field.name == "description":
                description = await field.text()

        if not config_entry_id or not image_data:
            return web.json_response(
                {"error": "config_entry and image are required"}, status=400
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

        # Convert to base64
        image_b64 = base64.b64encode(image_data).decode("utf-8")

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
            result = await self._analyze_with_provider(
                entry, image_b64, prompt, mime_type, model, macros_enabled
            )
            return web.json_response(result)
        except (aiohttp.ClientResponseError, json.JSONDecodeError, ValueError) as exc:
            _LOGGER.error("Error analyzing food photo: %s", exc)
            return web.json_response(
                {"error": f"Failed to analyze image: {exc}"}, status=500
            )

    async def _analyze_with_provider(
        self,
        entry,
        image_b64: str,
        prompt: str,
        mime_type: str,
        model: str | None = None,
        macros_enabled: bool = False,
    ) -> dict:
        """Analyze image using the selected provider."""
        domain = entry.domain
        chat_model = model

        match domain:
            case "openai_conversation":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in OpenAI config")
                max_tokens = entry.options.get("max_tokens") or 300
                endpoint = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                }

                # Define base schema for food items
                base_food_item_properties = {
                    "name": {"type": "string"},
                    "calories": {"type": "integer", "minimum": 0},
                }
                base_required_fields = ["name", "calories"]

                # Add macro fields if macros are enabled
                if macros_enabled:
                    base_food_item_properties.update(
                        {
                            "protein": {"type": "number", "minimum": 0},
                            "fat": {"type": "number", "minimum": 0},
                            "carbs": {"type": "number", "minimum": 0},
                            "alcohol": {"type": "number", "minimum": 0},
                        }
                    )
                    base_required_fields.extend(["protein", "fat", "carbs", "alcohol"])

                payload = {
                    "model": chat_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{image_b64}"
                                    },
                                },
                            ],
                        }
                    ],
                    "max_tokens": max_tokens,
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "food_calorie_analysis",
                            "strict": True,
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "food_items": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": base_food_item_properties,
                                            "required": base_required_fields,
                                            "additionalProperties": False,
                                        },
                                    },
                                },
                                "required": ["food_items"],
                                "additionalProperties": False,
                            },
                        },
                    },
                }
                response_key = ("choices", 0, "message", "content")

            case "google_generative_ai_conversation":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in Google Gemini config")
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{chat_model}:generateContent"
                headers = {
                    "x-goog-api-key": f"{api_key}",
                    "Content-Type": "application/json",
                }
                json_example = (
                    '{\n  "food_items": [\n    {\n      "name": "example item", \n      "calories": 123'
                    + (
                        ', \n      "protein": 7.3, \n      "fat": 5.1, \n      "carbs": 18.4, \n      "alcohol": 0.0'
                        if macros_enabled
                        else ""
                    )
                    + "\n    }\n  ]\n}"
                )
                gemini_instruction = (
                    prompt
                    + "\nStrictly output valid JSON matching this example structure (values should be your estimates):\n"
                    + json_example
                )
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": gemini_instruction},
                                {
                                    "inline_data": {
                                        "mime_type": mime_type,
                                        "data": image_b64,
                                    }
                                },
                            ]
                        }
                    ],
                    "generation_config": {"response_mime_type": "application/json"},
                }
                response_key = ("candidates", 0, "content", "parts", 0, "text")

            case "azure_openai_conversation":
                api_key = entry.data.get("api_key")
                api_base = entry.data.get("api_base")
                if not api_key or not api_base:
                    raise ValueError(
                        "No API key or base URL found in Azure OpenAI config"
                    )
                max_tokens = entry.options.get("max_tokens") or 300
                api_version = "2024-08-01-preview"
                endpoint = (
                    f"{api_base.rstrip('/')}/openai/deployments/{chat_model}/"
                    f"chat/completions?api-version={api_version}"
                )
                headers = {
                    "api-key": api_key,
                    "Content-Type": "application/json",
                }

                # Define base schema for food items (same as OpenAI)
                base_food_item_properties = {
                    "name": {"type": "string"},
                    "calories": {"type": "integer", "minimum": 0},
                }
                base_required_fields = ["name", "calories"]

                # Add macro fields if macros are enabled
                if macros_enabled:
                    base_food_item_properties.update(
                        {
                            "protein": {"type": "number", "minimum": 0},
                            "fat": {"type": "number", "minimum": 0},
                            "carbs": {"type": "number", "minimum": 0},
                            "alcohol": {"type": "number", "minimum": 0},
                        }
                    )
                    base_required_fields.extend(["protein", "fat", "carbs", "alcohol"])

                payload = {
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{image_b64}"
                                    },
                                },
                            ],
                        }
                    ],
                    "max_tokens": max_tokens,
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "food_calorie_analysis",
                            "strict": True,
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "food_items": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": base_food_item_properties,
                                            "required": base_required_fields,
                                            "additionalProperties": False,
                                        },
                                    },
                                },
                                "required": ["food_items"],
                                "additionalProperties": False,
                            },
                        },
                    },
                }
                response_key = ("choices", 0, "message", "content")

            case "ollama":
                base_url = entry.data.get("url")
                if not model:
                    raise ValueError("No model specified in Ollama config")
                if base_url and not base_url.startswith(("http://", "https://")):
                    base_url = f"http://{base_url}"
                endpoint = f"{base_url.rstrip('/')}/api/generate"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "model": chat_model,
                    "prompt": prompt,
                    "images": [image_b64],
                    "stream": False,
                }
                response_key = ("response",)

            case "anthropic":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in Anthropic config")
                endpoint = "https://api.anthropic.com/v1/messages"
                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                }
                # Anthropic expects base64 images in the content blocks
                payload = {
                    "model": chat_model,
                    "max_tokens": 1024,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": mime_type,
                                        "data": image_b64,
                                    },
                                },
                            ],
                        }
                    ],
                }
                response_key = ("content", 0, "text")

            case _:
                raise ValueError(f"Unsupported domain: {domain}")

        # Make the request
        async with (
            aiohttp.ClientSession() as session,
            session.post(endpoint, headers=headers, json=payload) as response,
        ):
            if not response.ok:
                error_text = await response.text()
                _LOGGER.error("%s API error: %s", domain, error_text)
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"{domain} API error: {error_text}",
                )
            result_data = await response.json()

        # Extract the content using the response_key path
        content = result_data
        for key in response_key:
            content = content[key]

        # Extract JSON from Markdown code block if present (shared for all providers)
        match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", content)
        if match:
            content = match.group(1)

        try:
            parsed_content = json.loads(content)
            food_items_array = parsed_content.get("food_items", [])
            food_items_list: list[dict] = []
            for item in food_items_array:
                base = {
                    "food_item": item.get("name"),
                    "calories": item.get("calories"),
                }
                # Include macro fields if present; round to nearest tenth
                for src_key, out_key in (
                    ("protein", "protein"),
                    ("fat", "fat"),
                    ("carbs", "carbs"),
                    ("alcohol", "alcohol"),
                ):
                    if src_key in item and isinstance(item[src_key], (int, float)):
                        val = float(item[src_key])
                        base[out_key] = round(val * 10) / 10.0
                food_items_list.append(base)
        except (KeyError, json.JSONDecodeError) as exc:
            _LOGGER.error(
                "Error parsing %s response: %s. Raw content: %s", domain, exc, content
            )
            return {
                "success": False,
                "error": f"Could not parse {domain} response as JSON",
                "raw_result": content,
            }
        else:
            return {
                "success": True,
                "food_items": food_items_list,
                "raw_result": content,
            }


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
        image_data = None
        filename = None
        model = None

        while True:
            part = await reader.next()
            if part is None:
                break

            if part.name == "config_entry":
                config_entry_id = await part.text()
            elif part.name == "model":
                model = await part.text()
            elif part.name == "image":
                filename = part.filename
                image_data = await part.read()

        if not config_entry_id or not image_data or not model:
            return web.json_response(
                {"error": "Missing required fields: config_entry, image, model"},
                status=400,
            )

        # Find the config entry for the LLM integration
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry:
            return web.json_response({"error": "Config entry not found"}, status=404)

        try:
            # Determine MIME type
            mime_type = guess_mime_type(filename or "image", image_data)
            if not mime_type:
                return web.json_response(
                    {"error": "Could not determine image MIME type"}, status=400
                )

            # Convert to base64
            image_b64 = base64.b64encode(image_data).decode("utf-8")

            prompt = (
                "Analyze this image to estimate body fat percentage. Look at the torso area and provide your analysis. "
                "Be realistic and professional - only analyze what you can clearly see in the image. "
                "Return ONLY a JSON object with 'body_fat_percentage' (number) field. "
                "Respond ONLY with a valid JSON object. Do not include any explanation or extra text."
            )

            # Use the same provider analysis method as food analysis
            result = await self._analyze_with_provider(
                entry, image_b64, prompt, mime_type, model
            )

            # Extract body fat data from the result
            if result.get("success"):
                raw_result = result.get("raw_result", "")
                _LOGGER.debug("Body fat analysis raw result: %s", raw_result)

                # Try to parse JSON response (similar to food analysis)
                try:
                    # Extract JSON from Markdown code block if present
                    content = raw_result
                    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", content)
                    if match:
                        content = match.group(1)

                    parsed_content = json.loads(content)
                    body_fat_percentage = parsed_content.get("body_fat_percentage")

                    if body_fat_percentage is not None:
                        # Sanity check: body fat percentage should be between 3-50%
                        if 3 <= body_fat_percentage <= 50:
                            # Return structured data
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

                except (json.JSONDecodeError, KeyError) as exc:
                    _LOGGER.error(
                        "Error parsing body fat JSON response: %s. Raw content: %s",
                        exc,
                        raw_result,
                    )
                    # Fallback to regex parsing if JSON fails

                # Fallback: try regex parsing if JSON parsing failed
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

            return web.json_response(
                {
                    "success": False,
                    "error": result.get("error", "Analysis failed"),
                    "raw_result": result.get("raw_result", ""),
                }
            )

        except Exception as e:
            _LOGGER.exception("Error during body fat analysis")
            return web.json_response({"error": f"Analysis failed: {e!s}"}, status=500)

    async def _analyze_with_provider(
        self,
        entry,
        image_b64: str,
        prompt: str,
        mime_type: str,
        model: str | None = None,
    ) -> dict:
        """Analyze image using the selected provider."""
        domain = entry.domain
        chat_model = model

        match domain:
            case "openai_conversation":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in OpenAI config")
                max_tokens = entry.options.get("max_tokens") or 1000
                endpoint = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": chat_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{image_b64}"
                                    },
                                },
                            ],
                        }
                    ],
                    "max_tokens": max_tokens,
                }
                response_key = ("choices", 0, "message", "content")

            case "google_generative_ai_conversation":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in Google Gemini config")
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{chat_model}:generateContent"
                headers = {
                    "x-goog-api-key": f"{api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt},
                                {
                                    "inline_data": {
                                        "mime_type": mime_type,
                                        "data": image_b64,
                                    }
                                },
                            ]
                        }
                    ],
                }
                response_key = ("candidates", 0, "content", "parts", 0, "text")

            case "azure_openai_conversation":
                api_key = entry.data.get("api_key")
                api_base = entry.data.get("api_base")
                if not api_key or not api_base:
                    raise ValueError(
                        "No API key or base URL found in Azure OpenAI config"
                    )
                max_tokens = entry.options.get("max_tokens") or 1000
                api_version = "2024-08-01-preview"
                endpoint = (
                    f"{api_base.rstrip('/')}/openai/deployments/{chat_model}/"
                    f"chat/completions?api-version={api_version}"
                )
                headers = {
                    "api-key": api_key,
                    "Content-Type": "application/json",
                }
                payload = {
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{image_b64}"
                                    },
                                },
                            ],
                        }
                    ],
                    "max_tokens": max_tokens,
                }
                response_key = ("choices", 0, "message", "content")

            case "ollama":
                base_url = entry.data.get("url")
                if not model:
                    raise ValueError("No model specified in Ollama config")
                if base_url and not base_url.startswith(("http://", "https://")):
                    base_url = f"http://{base_url}"
                endpoint = f"{base_url.rstrip('/')}/api/generate"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "model": chat_model,
                    "prompt": prompt,
                    "images": [image_b64],
                    "stream": False,
                }
                response_key = ("response",)

            case "anthropic":
                api_key = entry.data.get("api_key")
                if not api_key:
                    raise ValueError("No API key found in Anthropic config")
                endpoint = "https://api.anthropic.com/v1/messages"
                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                }
                payload = {
                    "model": chat_model,
                    "max_tokens": 1024,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": mime_type,
                                        "data": image_b64,
                                    },
                                },
                            ],
                        }
                    ],
                }
                response_key = ("content", 0, "text")

            case _:
                raise ValueError(f"Unsupported domain: {domain}")

        # Make the request
        async with (
            aiohttp.ClientSession() as session,
            session.post(endpoint, headers=headers, json=payload) as response,
        ):
            if not response.ok:
                error_text = await response.text()
                _LOGGER.error("%s API error: %s", domain, error_text)
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"{domain} API error: {error_text}",
                )
            result_data = await response.json()

        # Extract the content using the response_key path
        content = result_data
        for key in response_key:
            content = content[key]

        # For body fat analysis, we don't expect JSON - just return the raw text
        return {
            "success": True,
            "raw_result": content,
        }
