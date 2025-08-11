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

        async for field in reader:
            if field.name == "config_entry":
                config_entry_id = await field.text()
            elif field.name == "image":
                image_data = await field.read()
                filename = getattr(field, "filename", "")
            elif field.name == "model":
                model = await field.text()

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

        prompt = (
            "For each food item present, estimate the calories. "
            "Return ONLY a JSON object with a 'food_items' array containing objects with 'name' and 'calories' fields. "
            "Respond ONLY with a valid JSON object. Do not include any explanation or extra text."
        )

        try:
            result = await self._analyze_with_provider(
                entry, image_b64, prompt, mime_type, model
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
                                            "properties": {
                                                "name": {"type": "string"},
                                                "calories": {
                                                    "type": "integer",
                                                    "minimum": 0,
                                                },
                                            },
                                            "required": ["name", "calories"],
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
                                            "properties": {
                                                "name": {"type": "string"},
                                                "calories": {
                                                    "type": "integer",
                                                    "minimum": 0,
                                                },
                                            },
                                            "required": ["name", "calories"],
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
            food_items_list = [
                {"food_item": item["name"], "calories": item["calories"]}
                for item in food_items_array
            ]
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
        """Set the preferred image analyzer for a config entry."""
        hass: HomeAssistant = request.app["hass"]

        try:
            data = await request.json()
        except (ValueError, TypeError):
            return web.json_response(
                {"error": "Invalid JSON data"}, status=400
            )

        config_entry_id = data.get("config_entry_id")
        analyzer_data = data.get("analyzer_data")

        if not config_entry_id:
            return web.json_response(
                {"error": "config_entry_id is required"}, status=400
            )

        if not analyzer_data:
            return web.json_response(
                {"error": "analyzer_data is required"}, status=400
            )

        # Find the config entry
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if not entry or entry.domain != "calorie_tracker":
            return web.json_response(
                {"error": "Calorie tracker config entry not found"}, status=404
            )

        # Update the data with the preferred analyzer
        current_data = dict(entry.data or {})
        current_data[PREFERRED_IMAGE_ANALYZER] = analyzer_data

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
            return web.json_response(
                {"error": "Invalid JSON data"}, status=400
            )

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
