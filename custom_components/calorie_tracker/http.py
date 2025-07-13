"""HTTP endpoints for Calorie Tracker."""

from __future__ import annotations

import base64
import json
import logging
import tempfile
from pathlib import Path

import aiohttp
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

_LOGGER = logging.getLogger(__name__)


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

        if not config_entry_id or not image_data:
            return web.json_response(
                {"error": "config_entry and image are required"}, status=400
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
                result = await self._analyze_with_openai(entry, image_b64, prompt)
            else:
                result = await self._analyze_with_service(
                    hass, entry, image_b64, prompt
                )

            return web.json_response(result)

        except (aiohttp.ClientResponseError, json.JSONDecodeError, ValueError) as exc:
            _LOGGER.error("Error analyzing food photo: %s", exc)
            return web.json_response(
                {"error": f"Failed to analyze image: {exc}"}, status=500
            )

    async def _analyze_with_openai(self, entry, image_b64: str, prompt: str) -> dict:
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
                            "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
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

    # TODO: Rewrite this for the other services. filenames likely wont work.
    async def _analyze_with_service(
        self, hass: HomeAssistant, entry, image_b64: str, prompt: str
    ) -> dict:
        """Analyze image using Home Assistant service."""
        # Save image to www directory for other services
        with tempfile.NamedTemporaryFile(
            dir=Path(__file__).parent, suffix=".jpg", delete=False
        ) as tmp_file:
            tmp_file.write(base64.b64decode(image_b64))
            image_path = tmp_file.name

        try:
            # Call the service
            result = await hass.services.async_call(
                entry.domain,
                "generate_content",
                {
                    "prompt": prompt,
                    "config_entry": entry.entry_id,
                    "filenames": str(image_path),
                },
                blocking=True,
                return_response=True,
            )

            # Parse response
            response_text = result.get("response", {}).get("text", "")
            try:
                parsed_content = json.loads(response_text)
                food_items = parsed_content.get("food_items", [])

                food_items_list = [
                    {
                        "food_item": item.get("name", "Unknown"),
                        "calories": item.get("calories", 0),
                    }
                    for item in food_items
                ]
            except json.JSONDecodeError:
                return {"success": False, "error": "Could not parse response as JSON"}
            else:
                return {
                    "success": True,
                    "food_items": food_items_list,
                    "raw_result": response_text,
                }

        except HomeAssistantError as exc:
            if "allowlist_external_dirs" in str(exc):
                return {
                    "success": False,
                    "error": "Add /config/www to allowlist_external_dirs in configuration.yaml",
                }
            _LOGGER.error("Error calling Home Assistant service: %s", exc)
            return {"success": False, "error": f"Service call failed: {exc}"}
        finally:
            # Clean up temporary file
            Path(image_path).unlink(missing_ok=True)
