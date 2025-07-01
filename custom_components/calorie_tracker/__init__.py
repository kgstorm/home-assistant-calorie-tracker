"""The Calorie Tracker integration."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState, ConfigType
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    CALORIES,
    DAILY_GOAL,
    DEFAULT_CALORIE_LIMIT,
    DOMAIN,
    GOAL_WEIGHT,
    ITEM_NAME,
    SPOKEN_NAME,
    STARTING_WEIGHT,
)
from .linked_components import (
    discover_unlinked_peloton_profiles,
    setup_linked_component_listeners,
)
from .storage import STORAGE_KEY, CalorieStorageManager, get_user_profile_map
from .websockets import register_websockets

_PLATFORMS: list[Platform] = [Platform.SENSOR]

_LOGGER = logging.getLogger(__name__)

type CalorieTrackerConfigEntry = ConfigEntry[CalorieTrackerUser]

CALORIE_TRACKER_DEVICE_INFO = {
    "identifiers": {(DOMAIN, "manager")},
    "name": "Calorie Tracker Manager",
    "manufacturer": "Calorie Tracker",
    "model": "Profile Manager",
    "entry_type": "service",
}

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

SERVICE_LOG_CALORIES = "log_calories"
SERVICE_LOG_CALORIES_SCHEMA = vol.Schema(
    {
        vol.Required(CALORIES): cv.positive_int,
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Optional(ITEM_NAME): cv.string,
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Calorie Tracker integration."""

    # Ensure singleton for user profile map
    get_user_profile_map(hass)

    # Register services
    async def async_log_calories(call: ServiceCall) -> None:
        """Handle the log_calories service call."""
        spoken_name = call.data[SPOKEN_NAME]
        item_name = call.data.get(ITEM_NAME)
        calories = call.data[CALORIES]

        # Look for the matching config entry
        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry:
            raise ServiceValidationError(f"No entry found for user: '{spoken_name}'")
        if matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError("Entry not loaded")

        # Get the sensor from runtime_data
        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            _LOGGER.warning(
                "Sensor not available for username %s; skipping update", spoken_name
            )
            return

        # Log food using the API
        await sensor.api.async_log_food(item_name, calories)

        # Trigger UI/state update
        await sensor.async_update_calories()

        _LOGGER.debug(
            "Logged %s calories for user %s (item: %s)",
            calories,
            spoken_name,
            item_name,
        )

    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_CALORIES,
        async_log_calories,
        schema=SERVICE_LOG_CALORIES_SCHEMA,
    )

    # Register Calorie Tracker panel
    frontend_path = Path(__file__).parent / "frontend"

    _LOGGER.info("Frontend path is: %s", frontend_path)

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=f"/{DOMAIN}_frontend",
                path=frontend_path,
            )
        ]
    )

    _LOGGER.info("Registered static path /%s -> %s", DOMAIN, frontend_path)

    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=DOMAIN,
        webcomponent_name="calorie-tracker-panel",
        module_url=f"/{DOMAIN}_frontend/calorie-tracker-panel.js",
        sidebar_title="Calorie Tracker",
        sidebar_icon="mdi:scale-bathroom",
        embed_iframe=False,
    )

    # Register frontend websockets
    register_websockets(hass)

    # Search for unlinked components
    async def _on_ha_started(event):
        await discover_unlinked_peloton_profiles(hass)

    hass.bus.async_listen_once("homeassistant_started", _on_ha_started)

    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: CalorieTrackerConfigEntry
) -> bool:
    """Set up Calorie Tracker from a config entry."""

    hass.data.setdefault(DOMAIN, {})

    spoken_name = entry.data[SPOKEN_NAME]
    daily_goal = entry.data.get(DAILY_GOAL, DEFAULT_CALORIE_LIMIT)
    starting_weight = entry.data.get(STARTING_WEIGHT, 0)
    goal_weight = entry.data.get(GOAL_WEIGHT, 0)

    storage = CalorieStorageManager(hass, entry.entry_id)

    user = CalorieTrackerUser(
        spoken_name=spoken_name,
        daily_goal=daily_goal,
        storage=storage,
        starting_weight=starting_weight,
        goal_weight=goal_weight,
    )

    await user.async_initialize()

    entry.runtime_data = {
        "user": user,
    }

    if STORAGE_KEY not in hass.data:
        hass.data[STORAGE_KEY] = {}
    hass.data[STORAGE_KEY][entry.entry_id] = storage

    # Register the device for this config entry
    device_registry = dr.async_get(hass)
    device = device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers=CALORIE_TRACKER_DEVICE_INFO["identifiers"],
        name=CALORIE_TRACKER_DEVICE_INFO["name"],
        manufacturer=CALORIE_TRACKER_DEVICE_INFO["manufacturer"],
        model=CALORIE_TRACKER_DEVICE_INFO["model"],
        entry_type=CALORIE_TRACKER_DEVICE_INFO["entry_type"],
    )

    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    hass.data[DOMAIN]["device_id"] = device.id

    # Setup linked component listeners
    remove_callbacks = setup_linked_component_listeners(hass, entry, user)
    entry.runtime_data["remove_callbacks"] = remove_callbacks

    await hass.config_entries.async_forward_entry_setups(entry, _PLATFORMS)

    _LOGGER.info("Finished async_setup_entry for entry: %s", entry.entry_id)

    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: CalorieTrackerConfigEntry
) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, _PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up after deleting an entry."""

    storage_map = hass.data.get(STORAGE_KEY, {})
    storage = storage_map.get(entry.entry_id)
    if storage:
        await storage.async_delete_store()
    else:
        _LOGGER.info("Storage not found")
    storage_map.pop(entry.entry_id, None)

    remaining_entries = hass.config_entries.async_entries(DOMAIN)
    if len(remaining_entries) == 0:
        # Remove the user profile map file if it exists
        user_profile_map = get_user_profile_map(hass)
        await user_profile_map.async_remove()

        if hass.services.has_service(DOMAIN, SERVICE_LOG_CALORIES):
            hass.services.async_remove(DOMAIN, SERVICE_LOG_CALORIES)
            _LOGGER.info("Removed log_calories service since no entries remain")
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("Removed calorie tracker panel since no entries remain")
