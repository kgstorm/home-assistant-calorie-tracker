"""The Calorie Tracker integration."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigType
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, device_registry as dr
import homeassistant.util.dt as dt_util

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    BIRTH_YEAR,
    BODY_FAT_PCT,
    DEFAULT_CALORIE_LIMIT,
    DEFAULT_WEIGHT_UNIT,
    DOMAIN,
    GOAL_TYPE,
    GOAL_VALUE,
    GOAL_WEIGHT,
    HEIGHT,
    HEIGHT_UNIT,
    INCLUDE_EXERCISE_IN_NET,
    NEAT,
    PREFERRED_IMAGE_ANALYZER,
    SEX,
    SPOKEN_NAME,
    STARTING_WEIGHT,
    WEIGHT_UNIT,
)
from .http import (
    CalorieTrackerBodyFatAnalysisView,
    CalorieTrackerFetchAnalyzersView,
    CalorieTrackerGetPreferredAnalyzerView,
    CalorieTrackerPhotoUploadView,
    CalorieTrackerSetPreferredAnalyzerView,
)
from .linked_components import (
    discover_image_analyzers,
    discover_unlinked_peloton_profiles,
    setup_linked_component_listeners,
)
from .services import async_setup_services, async_unload_services
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


async def async_migrate_entry(hass: HomeAssistant, config_entry):
    """Migrate old config entries to include weight_unit, include_exercise_in_net, BMR fields, NEAT, and preferred_image_analyzer."""

    if config_entry.version > 6:
        _LOGGER.debug("Migration check > 6")
        return False

    new_data = {**config_entry.data}
    target_version = config_entry.version

    if config_entry.version == 1:
        if WEIGHT_UNIT not in new_data:
            new_data[WEIGHT_UNIT] = DEFAULT_WEIGHT_UNIT
        if INCLUDE_EXERCISE_IN_NET not in new_data:
            new_data[INCLUDE_EXERCISE_IN_NET] = True
        target_version = 2

    if config_entry.version <= 2:
        if INCLUDE_EXERCISE_IN_NET not in new_data:
            new_data[INCLUDE_EXERCISE_IN_NET] = True
        target_version = 3

    if config_entry.version <= 3:
        # Add BMR fields with None defaults
        if BIRTH_YEAR not in new_data:
            new_data[BIRTH_YEAR] = None
        if SEX not in new_data:
            new_data[SEX] = None
        if HEIGHT not in new_data:
            new_data[HEIGHT] = None
        if HEIGHT_UNIT not in new_data:
            new_data[HEIGHT_UNIT] = "cm"
        if BODY_FAT_PCT not in new_data:
            new_data[BODY_FAT_PCT] = None
        target_version = 4

    if config_entry.version <= 4:
        # Add NEAT field with default value
        if NEAT not in new_data:
            new_data[NEAT] = 1.2
        target_version = 5

    # Add preferred_image_analyzer to data if it doesn't exist
    if PREFERRED_IMAGE_ANALYZER not in new_data:
        new_data[PREFERRED_IMAGE_ANALYZER] = None

    # Migrate include_exercise_in_net to goal_type for version <= 5
    if config_entry.version <= 5:
        if GOAL_TYPE not in new_data:
            if INCLUDE_EXERCISE_IN_NET in new_data:
                if new_data[INCLUDE_EXERCISE_IN_NET]:
                    new_data[GOAL_TYPE] = "fixed_net_calories"
                else:
                    new_data[GOAL_TYPE] = "fixed_intake"
                new_data.pop(INCLUDE_EXERCISE_IN_NET, None)
            else:
                new_data[GOAL_TYPE] = "fixed_net_calories"  # default
        target_version = 6

    if target_version != config_entry.version or new_data != config_entry.data:
        hass.config_entries.async_update_entry(
            config_entry, data=new_data, version=target_version
        )

    _LOGGER.debug(
        "Migration to configuration version %s.%s successful",
        config_entry.version,
        config_entry.minor_version,
    )

    return True


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Calorie Tracker integration."""

    # Ensure singleton for user profile map
    get_user_profile_map(hass)

    # Register services
    await async_setup_services(hass)

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

    # Register HTTP endpoints
    hass.http.register_view(CalorieTrackerPhotoUploadView())
    hass.http.register_view(CalorieTrackerBodyFatAnalysisView())
    hass.http.register_view(CalorieTrackerFetchAnalyzersView())
    hass.http.register_view(CalorieTrackerSetPreferredAnalyzerView())
    hass.http.register_view(CalorieTrackerGetPreferredAnalyzerView())

    # Register frontend websockets
    register_websockets(hass)

    # Search for unlinked components and discover image analyzers
    async def _on_ha_started(event):
        await discover_unlinked_peloton_profiles(hass)
        await discover_image_analyzers(hass)

    hass.bus.async_listen_once("homeassistant_started", _on_ha_started)

    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: CalorieTrackerConfigEntry
) -> bool:
    """Set up Calorie Tracker from a config entry."""

    hass.data.setdefault(DOMAIN, {})

    spoken_name = entry.data[SPOKEN_NAME]
    goal_value = entry.data.get(GOAL_VALUE, DEFAULT_CALORIE_LIMIT)
    starting_weight = entry.data.get(STARTING_WEIGHT, 0)
    goal_weight = entry.data.get(GOAL_WEIGHT, 0)
    weight_unit = entry.data.get(WEIGHT_UNIT, DEFAULT_WEIGHT_UNIT)
    goal_type = entry.data.get("goal_type")
    birth_year = entry.data.get(BIRTH_YEAR)
    sex = entry.data.get(SEX)
    height = entry.data.get(HEIGHT)
    height_unit = entry.data.get(HEIGHT_UNIT, "cm")
    body_fat_pct = entry.data.get(BODY_FAT_PCT)
    neat = entry.data.get(NEAT, 1.2)

    storage = CalorieStorageManager(hass, entry.entry_id)

    user = CalorieTrackerUser(
        spoken_name=spoken_name,
        goal_value=goal_value,
        storage=storage,
        starting_weight=starting_weight,
        goal_weight=goal_weight,
        weight_unit=weight_unit,
        goal_type=goal_type,
        birth_year=birth_year,
        sex=sex,
        height=height,
        height_unit=height_unit,
        body_fat_pct=body_fat_pct,
        neat=neat,
    )

    await user.async_initialize()

    # Migrate goal_type, goal_value, and body_fat_pct from config to storage if present
    today = dt_util.now().date().isoformat()
    migrated = False
    new_data = dict(entry.data)
    if goal_type is not None and goal_value is not None:
        await user.add_goal(goal_type, goal_value, today)
        new_data.pop("goal_type", None)
        new_data.pop("goal_value", None)
        migrated = True
    if body_fat_pct is not None:
        await user.set_body_fat_pct(body_fat_pct, today)
        new_data.pop("body_fat_pct", None)
        migrated = True
    if migrated:
        hass.config_entries.async_update_entry(entry, data=new_data)

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
    remove_callbacks = await setup_linked_component_listeners(hass, entry, user)
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

        # Unregister services
        await async_unload_services(hass)
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("Removed calorie tracker panel since no entries remain")
