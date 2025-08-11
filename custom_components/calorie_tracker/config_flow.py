"""Config flow for the Calorie Scaffold integration."""

from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, selector
from homeassistant.util.unit_system import US_CUSTOMARY_SYSTEM

from .const import (
    BIRTH_YEAR,
    BODY_FAT_PCT,
    DAILY_GOAL,
    DEFAULT_WEIGHT_UNIT,
    DOMAIN,
    GOAL_WEIGHT,
    HEIGHT,
    HEIGHT_UNIT,
    INCLUDE_EXERCISE_IN_NET,
    SEX,
    SPOKEN_NAME,
    STARTING_WEIGHT,
    WEIGHT_UNIT,
)

_LOGGER = logging.getLogger(__name__)

# Height input field names
HEIGHT_FT = "height_ft"
HEIGHT_IN = "height_in"


def _convert_height_to_storage_format(
    height_ft: int | None,
    height_in: int | None,
    height_cm: int | None,
    height_unit: str,
) -> tuple[int | None, str]:
    """Convert height input to storage format: (value, unit).

    Returns:
        - For imperial: (total_inches, "in")
        - For metric: (centimeters, "cm")

    """
    if height_unit == "imperial":
        if height_ft is not None or height_in is not None:
            total_inches = (height_ft or 0) * 12 + (height_in or 0)
            return (total_inches if total_inches > 0 else None, "in")
        return (None, "in")

    # metric
    return (height_cm, "cm")


def _get_height_schema_for_unit_preference(
    height_unit: str, current_height_cm: int | None = None
) -> dict:
    """Get height schema based on the user's chosen height unit preference.

    Uses number selectors (mode=box) for better UX instead of simple coerced ints.
    """
    if height_unit == "imperial":
        height_ft_default: int | None = None
        height_in_default: int | None = None
        if current_height_cm:
            total_inches = round(current_height_cm / 2.54)
            height_ft_default = total_inches // 12
            height_in_default = total_inches % 12

        return {
            vol.Required(
                HEIGHT_FT,
                default=height_ft_default if height_ft_default is not None else 5,
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=1, max=8, mode="box", step=1)
            ),
            vol.Required(
                HEIGHT_IN,
                default=height_in_default if height_in_default is not None else 8,
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0, max=11, mode="box", step=1)
            ),
        }

    # metric
    default_cm: int | None = current_height_cm if current_height_cm else None
    return {
        vol.Required(
            HEIGHT, default=default_cm if default_cm is not None else 170
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(min=50, max=300, mode="box", step=1)
        )
    }


def _get_user_data_schema(hass: HomeAssistant) -> vol.Schema:
    """Get basic user data schema for the first step including height unit preference."""
    default_height_unit = (
        "imperial" if hass.config.units is US_CUSTOMARY_SYSTEM else "metric"
    )
    return vol.Schema(
        {
            vol.Required(SPOKEN_NAME): str,
            vol.Required(HEIGHT_UNIT, default=default_height_unit): vol.In(
                ["imperial", "metric"]
            ),
            vol.Optional(DAILY_GOAL, default=2000): int,
            vol.Optional(STARTING_WEIGHT, default=0): int,
            vol.Optional(GOAL_WEIGHT, default=0): int,
            vol.Required(WEIGHT_UNIT, default=DEFAULT_WEIGHT_UNIT): vol.In(
                ["lbs", "kg"]
            ),
            vol.Optional(INCLUDE_EXERCISE_IN_NET, default=True): bool,
        }
    )


def _get_bmr_data_schema(hass: HomeAssistant, height_unit: str) -> vol.Schema:
    """Get BMR data schema; height fields depend on user-selected unit preference."""
    current_year = datetime.now().year
    base_schema: dict[Any, Any] = {
        vol.Required(BIRTH_YEAR, default=current_year - 30): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1900, max=current_year, mode="box", step=1
            )
        ),
        vol.Required(SEX): selector.SelectSelector(
            selector.SelectSelectorConfig(options=["male", "female"], mode="dropdown")
        ),
        # Body fat optional: allow blank by using a plain optional float validator
        vol.Optional(BODY_FAT_PCT): vol.All(
            vol.Coerce(float), vol.Range(min=3, max=50)
        ),
    }

    # Add height fields based on user-selected unit system
    height_schema = _get_height_schema_for_unit_preference(height_unit)
    base_schema.update(height_schema)

    return vol.Schema(base_schema)


class ConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Calorie Tracker."""

    VERSION = 4

    def __init__(self) -> None:
        """Initialize ConfigFlow."""
        self._user_input: dict[str, Any] = {}
        self._component_entries: dict[str, dict[str, str]] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the basic profile setup including height unit selection."""

        errors: dict[str, str] = {}
        if user_input is not None:
            friendly_name = user_input[SPOKEN_NAME].strip().lower()

            # Prevent duplicate trackers for the same friendly name
            for entry in self._async_current_entries():
                if entry.data.get(SPOKEN_NAME, "").strip().lower() == friendly_name:
                    return self.async_abort(reason="friendly_name_configured")

            self._user_input = user_input
            # Move to BMR data collection step
            return await self.async_step_bmr()

        schema = _get_user_data_schema(self.hass)
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_bmr(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle BMR (Basal Metabolic Rate) data collection with dynamic height fields."""

        errors: dict[str, str] = {}
        if user_input is not None:
            # Convert height to storage format
            height_value, height_unit = _convert_height_to_storage_format(
                user_input.get(HEIGHT_FT),
                user_input.get(HEIGHT_IN),
                user_input.get(HEIGHT),
                self._user_input.get(HEIGHT_UNIT, "metric"),
            )
            if height_value is not None:
                user_input[HEIGHT] = height_value
                user_input["height_unit"] = height_unit

            # Remove imperial height fields if they exist
            user_input.pop(HEIGHT_FT, None)
            user_input.pop(HEIGHT_IN, None)

            # Merge BMR data with basic profile data
            self._user_input.update(user_input)

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
                title=self._user_input[SPOKEN_NAME], data=self._user_input
            )

        height_unit = self._user_input.get(HEIGHT_UNIT, "metric")
        schema = _get_bmr_data_schema(self.hass, height_unit)
        return self.async_show_form(
            step_id="bmr",
            data_schema=schema,
            errors=errors,
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
