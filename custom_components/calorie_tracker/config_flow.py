"""Config flow for the Calorie Scaffold integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers import config_validation as cv

from .const import (
    DAILY_GOAL,
    DOMAIN,
    GOAL_WEIGHT,
    SPOKEN_NAME,
    STARTING_WEIGHT,
    WEIGHT_UNIT,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): str,
        vol.Optional(DAILY_GOAL, default=2000): int,
        vol.Optional(STARTING_WEIGHT, default=0): int,
        vol.Optional(GOAL_WEIGHT, default=0): int,
        vol.Required(WEIGHT_UNIT, default="lbs"): vol.In(["lbs", "kg"]),
    }
)


class ConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Calorie Tracker."""

    VERSION = 2

    def __init__(self) -> None:
        """Initialize ConfigFlow."""
        self._user_input: dict[str, Any] = {}
        self._component_entries: dict[str, dict[str, str]] = {}

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

            self._user_input = user_input
            # Search for component integrations (start with Peloton)
            peloton_entries = list(self.hass.config_entries.async_entries("peloton"))
            if peloton_entries:
                self._component_entries["peloton"] = {
                    entry.entry_id: entry.title or "Unnamed Peloton Profile"
                    for entry in peloton_entries
                }

            # If component entries found, proceed to link component step
            if len(self._component_entries) > 0:
                return await self.async_step_link_component()

            # No component integrations found, create entry immediately
            return self.async_create_entry(
                title=user_input[SPOKEN_NAME], data=user_input
            )

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    async def async_step_link_component(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Display discovered external component profiles that can be linked."""
        schema_dict = {}

        # Add discovered Peloton profiles
        peloton_options = self._component_entries.get("peloton", {})
        if peloton_options:
            schema_dict[vol.Optional("peloton_entry_ids", default=[])] = (
                cv.multi_select(peloton_options)
            )

        if user_input is not None:
            linked_component_profiles = {}
            peloton_selected = user_input.get("peloton_entry_ids", [])
            if peloton_selected:
                linked_component_profiles["peloton"] = peloton_selected
            return self.async_create_entry(
                title=self._user_input[SPOKEN_NAME],
                data=self._user_input,
                options={"linked_component_profiles": linked_component_profiles},
            )

        return self.async_show_form(
            step_id="link_component",
            data_schema=vol.Schema(schema_dict),
        )
