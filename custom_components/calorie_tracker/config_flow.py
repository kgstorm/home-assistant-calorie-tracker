"""Config flow for the Calorie Scaffold integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_USERNAME

from .const import DAILY_GOAL, DOMAIN, GOAL_WEIGHT, SPOKEN_NAME, STARTING_WEIGHT

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): str,
        vol.Optional(DAILY_GOAL, default=2000): int,
        vol.Optional(STARTING_WEIGHT, default=0): int,
        vol.Optional(GOAL_WEIGHT, default=0): int,
    }
)


class ConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Calorie Tracker."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the user and calorie limit input."""

        errors: dict[str, str] = {}
        if user_input is not None:
            friendly_name = user_input[SPOKEN_NAME].strip().lower()

            # Prevent duplicate trackers for the same friendly name
            for entry in self._async_current_entries():
                if entry.data.get(SPOKEN_NAME, "").strip().lower() == friendly_name:
                    return self.async_abort(reason="friendly_name_configured")

            user_input[CONF_USERNAME] = None

            return self.async_create_entry(
                title=user_input[SPOKEN_NAME], data=user_input
            )

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )
