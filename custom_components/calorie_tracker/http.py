"""HTTP endpoints for Calorie Tracker."""

from __future__ import annotations

import base64
import json
import logging
import mimetypes

import aiohttp
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

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

        async for field in reader:
            if field.name == "config_entry":
                config_entry_id = await field.text()
            elif field.name == "image":
                image_data = await field.read()
                filename = getattr(field, "filename", "")

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

        domain = entry.domain
        if domain not in (
            "openai_conversation",
            "google_generative_ai_conversation",
            "azure_openai_conversation",
        ):
            return web.json_response(
                {"error": f"Domain {domain} not supported"}, status=400
            )

        # Convert to base64 for API calls
        image_b64 = base64.b64encode(image_data).decode("utf-8")

        prompt = (
            "For each food item present, estimate the calories. "
            "Return ONLY a JSON object with a 'food_items' array containing objects with 'name' and 'calories' fields."
        )

        try:
            if domain == "openai_conversation":
                result = await self._analyze_with_openai(
                    entry, image_b64, prompt, mime_type
                )
            elif domain == "google_generative_ai_conversation":
                result = await self._analyze_with_gemini(
                    entry, image_b64, prompt, mime_type
                )
            elif domain == "azure_openai_conversation":
                result = await self._analyze_with_azure(
                    entry, image_b64, prompt, mime_type
                )

            return web.json_response(result)

        except (aiohttp.ClientResponseError, json.JSONDecodeError, ValueError) as exc:
            _LOGGER.error("Error analyzing food photo: %s", exc)
            return web.json_response(
                {"error": f"Failed to analyze image: {exc}"}, status=500
            )

    async def _analyze_with_openai(
        self, entry, image_b64: str, prompt: str, mime_type: str
    ) -> dict:
        """Analyze image using OpenAI API."""
        api_key = entry.data.get("api_key")
        if not api_key:
            raise ValueError("No API key found in OpenAI config")

        # Model selection
        user_model = entry.options.get("chat_model")
        allowed_models = {"gpt-4o", "gpt-4-vision-preview"}
        chat_model = user_model if user_model in allowed_models else "gpt-4o"

        max_tokens = entry.options.get("max_tokens") or 300

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

        async with (
            aiohttp.ClientSession() as session,
            session.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response,
        ):
            if not response.ok:
                error_text = await response.text()
                _LOGGER.error("OpenAI API error: %s", error_text)
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"OpenAI API error: {error_text}",
                )

            result_data = await response.json()

        content = result_data["choices"][0]["message"]["content"]
        parsed_content = json.loads(content)
        food_items_array = parsed_content.get("food_items", [])

        food_items_list = [
            {"food_item": item["name"], "calories": item["calories"]}
            for item in food_items_array
        ]

        return {
            "success": True,
            "food_items": food_items_list,
            "raw_result": content,
        }

    async def _analyze_with_gemini(
        self, entry, image_b64: str, prompt: str, mime_type: str
    ) -> dict:
        """Analyze image using Google Gemini API."""
        api_key = entry.data.get("api_key")
        if not api_key:
            raise ValueError("No API key found in Google Gemini config")

        # Model selection
        user_model = entry.options.get("chat_model")
        allowed_models = {
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite-preview-06-17",
            "gemini-2.0-flash",
            "gemini-2.0-flash-preview-image-generation",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
        }
        chat_model = user_model if user_model in allowed_models else "gemini-2.5-flash"

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
                        {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                    ]
                }
            ],
            "generation_config": {"response_mime_type": "application/json"},
        }

        async with (
            aiohttp.ClientSession() as session,
            session.post(endpoint, headers=headers, json=payload) as response,
        ):
            if not response.ok:
                error_text = await response.text()
                _LOGGER.error("Gemini API error: %s", error_text)
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"Gemini API error: {error_text}",
                )
            result_data = await response.json()

        # Gemini returns candidates[0].content.parts[0].text as the response
        try:
            content = result_data["candidates"][0]["content"]["parts"][0]["text"]
            parsed_content = json.loads(content)
            food_items_array = parsed_content.get("food_items", [])
            food_items_list = [
                {"food_item": item["name"], "calories": item["calories"]}
                for item in food_items_array
            ]
        except (KeyError, json.JSONDecodeError) as exc:
            _LOGGER.error("Error parsing Gemini response: %s", exc)
            return {
                "success": False,
                "error": "Could not parse Gemini response as JSON",
            }
        else:
            return {
                "success": True,
                "food_items": food_items_list,
                "raw_result": content,
            }

    async def _analyze_with_azure(
        self, entry, image_b64: str, prompt: str, mime_type: str
    ) -> dict:
        """Analyze image using Azure OpenAI API."""
        api_key = entry.data.get("api_key")
        api_base = entry.data.get("api_base")
        if not api_key or not api_base:
            raise ValueError("No API key or base URL found in Azure OpenAI config")

        # Use the deployment name from chat_model, default to "gpt-4o-mini" if not specified
        deployment_name = entry.options.get("chat_model") or "gpt-4o-mini"
        max_tokens = entry.options.get("max_tokens") or 300

        # Use a stable API version that supports vision and structured output
        api_version = "2024-08-01-preview"

        endpoint_url = (
            f"{api_base.rstrip('/')}/openai/deployments/{deployment_name}/"
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

        async with (
            aiohttp.ClientSession() as session,
            session.post(endpoint_url, headers=headers, json=payload) as response,
        ):
            if not response.ok:
                error_text = await response.text()
                _LOGGER.error("Azure OpenAI API error: %s", error_text)
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"Azure OpenAI API error: {error_text}",
                )

            result_data = await response.json()

        try:
            content = result_data["choices"][0]["message"]["content"]
            parsed_content = json.loads(content)
            food_items_array = parsed_content.get("food_items", [])
            food_items_list = [
                {"food_item": item["name"], "calories": item["calories"]}
                for item in food_items_array
            ]
        except (KeyError, json.JSONDecodeError) as exc:
            _LOGGER.error("Error parsing Azure response: %s", exc)
            return {
                "success": False,
                "error": "Could not parse Azure response as JSON",
            }
        else:
            return {
                "success": True,
                "food_items": food_items_list,
                "raw_result": content,
            }

    # TODO: Create function for Ollama
