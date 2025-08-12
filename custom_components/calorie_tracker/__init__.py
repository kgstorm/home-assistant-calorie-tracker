"""The Calorie Tracker integration."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState, ConfigType
from homeassistant.const import Platform
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceValidationError,
    SupportsResponse,
)
from homeassistant.helpers import config_validation as cv, device_registry as dr

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    BIRTH_YEAR,
    BODY_FAT_PCT,
    CALORIES,
    CALORIES_BURNED,
    DAILY_GOAL,
    DEFAULT_CALORIE_LIMIT,
    DEFAULT_WEIGHT_UNIT,
    DOMAIN,
    DURATION,
    ENTRY_TYPE,
    EXERCISE_TYPE,
    FOOD_ITEM,
    GOAL_WEIGHT,
    HEIGHT,
    HEIGHT_UNIT,
    INCLUDE_EXERCISE_IN_NET,
    PREFERRED_IMAGE_ANALYZER,
    SEX,
    SPOKEN_NAME,
    STARTING_WEIGHT,
    TIMESTAMP,
    WEIGHT,
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

SERVICE_CREATE_ENTRY = "create_entry"
SERVICE_CREATE_ENTRY_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(ENTRY_TYPE): vol.In(["food", "exercise", "weight"]),
        vol.Optional(FOOD_ITEM): cv.string,
        vol.Optional(CALORIES): cv.positive_int,
        vol.Optional(EXERCISE_TYPE): cv.string,
        vol.Optional(DURATION): cv.positive_int,
        vol.Optional(CALORIES_BURNED): cv.positive_int,
        vol.Optional(WEIGHT): vol.Coerce(float),
        vol.Optional(TIMESTAMP): cv.string,
    }
)

SERVICE_LOG_FOOD = "log_food"
SERVICE_LOG_EXERCISE = "log_exercise"
SERVICE_LOG_WEIGHT = "log_weight"
SERVICE_LOG_BODY_FAT = "log_body_fat"
SERVICE_FETCH_DATA = "fetch_data"

SERVICE_LOG_FOOD_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(FOOD_ITEM): cv.string,
        vol.Required(CALORIES): cv.positive_int,
        vol.Optional(TIMESTAMP): cv.string,
    }
)

SERVICE_LOG_EXERCISE_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(EXERCISE_TYPE): cv.string,
        vol.Optional(DURATION): cv.positive_int,
        vol.Required(CALORIES_BURNED): cv.positive_int,
        vol.Optional(TIMESTAMP): cv.string,
    }
)

SERVICE_LOG_WEIGHT_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(WEIGHT): vol.Coerce(float),
        vol.Optional(TIMESTAMP): cv.string,  # Interpreted as date or datetime
    }
)

SERVICE_LOG_BODY_FAT_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(BODY_FAT_PCT): vol.Coerce(float),
        vol.Optional(TIMESTAMP): cv.string,  # Interpreted as date or datetime
    }
)

SERVICE_FETCH_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Optional(
            TIMESTAMP
        ): cv.string,  # Date string (YYYY-MM-DD), defaults to today
    }
)


async def async_migrate_entry(hass: HomeAssistant, config_entry):
    """Migrate old config entries to include weight_unit, include_exercise_in_net, BMR fields, and preferred_image_analyzer."""

    if config_entry.version > 4:
        _LOGGER.debug("Migration check > 4")
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

    # Add preferred_image_analyzer to data if it doesn't exist
    if PREFERRED_IMAGE_ANALYZER not in new_data:
        new_data[PREFERRED_IMAGE_ANALYZER] = None

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
    async def async_log_food(call: ServiceCall) -> None:
        """Log a food entry for a user."""
        spoken_name = call.data[SPOKEN_NAME]
        food_item = call.data[FOOD_ITEM]
        calories = call.data[CALORIES]
        timestamp = call.data.get(TIMESTAMP)

        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError(
                f"No loaded entry found for user: '{spoken_name}'"
            )

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            _LOGGER.warning(
                "Sensor not available for username %s; skipping update", spoken_name
            )
            return

        await sensor.user.async_log_food(food_item, calories, timestamp=timestamp)
        await sensor.async_update_calories()
        _LOGGER.debug(
            "Logged %s calories for user %s (item: %s, timestamp: %s)",
            calories,
            spoken_name,
            food_item,
            timestamp,
        )

    async def async_log_exercise(call: ServiceCall) -> None:
        """Log an exercise entry for a user."""
        spoken_name = call.data[SPOKEN_NAME]
        exercise_type = call.data[EXERCISE_TYPE]
        duration = call.data.get(DURATION)
        calories_burned = call.data[CALORIES_BURNED]
        timestamp = call.data.get(TIMESTAMP)

        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError(
                f"No loaded entry found for user: '{spoken_name}'"
            )

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            _LOGGER.warning(
                "Sensor not available for username %s; skipping update", spoken_name
            )
            return

        await sensor.user.async_log_exercise(
            exercise_type=exercise_type,
            duration=duration,
            calories_burned=calories_burned,
            timestamp=timestamp,
        )
        await sensor.async_update_calories()
        _LOGGER.debug(
            "Logged exercise for user %s (type: %s, duration: %s, calories_burned: %s, timestamp: %s)",
            spoken_name,
            exercise_type,
            duration,
            calories_burned,
            timestamp,
        )

    async def async_log_weight(call: ServiceCall) -> None:
        """Log a weight entry for a user."""
        spoken_name = call.data[SPOKEN_NAME]
        weight = call.data[WEIGHT]
        timestamp = call.data.get(TIMESTAMP)

        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError(
                f"No loaded entry found for user: '{spoken_name}'"
            )

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            _LOGGER.warning(
                "Sensor not available for username %s; skipping update", spoken_name
            )
            return

        await sensor.user.async_log_weight(weight, date_str=timestamp)
        await sensor.async_update_calories()
        _LOGGER.debug(
            "Logged weight for user %s (weight: %s, date: %s)",
            spoken_name,
            weight,
            timestamp,
        )

    async def async_log_body_fat(call: ServiceCall) -> None:
        """Log a body fat percentage entry for a user."""
        spoken_name = call.data[SPOKEN_NAME]
        body_fat_pct = call.data[BODY_FAT_PCT]
        timestamp = call.data.get(TIMESTAMP)

        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError(
                f"No loaded entry found for user: '{spoken_name}'"
            )

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            _LOGGER.warning(
                "Sensor not available for username %s; skipping update", spoken_name
            )
            return

        await sensor.user.async_log_body_fat_pct(body_fat_pct, date_str=timestamp)
        await sensor.async_update_calories()
        _LOGGER.debug(
            "Logged body fat for user %s (body_fat_pct: %s%%, date: %s)",
            spoken_name,
            body_fat_pct,
            timestamp,
        )

    async def async_fetch_data(call: ServiceCall) -> None:
        """Fetch all entries for a user on a given day."""
        spoken_name = call.data[SPOKEN_NAME]
        date_str = call.data.get(TIMESTAMP)  # Optional date, defaults to today

        matching_entry = next(
            (
                entry
                for entry in hass.config_entries.async_entries(DOMAIN)
                if entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
            ),
            None,
        )

        if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
            raise ServiceValidationError(
                f"No loaded entry found for user: '{spoken_name}'"
            )

        user: CalorieTrackerUser = matching_entry.runtime_data["user"]

        # Get the log data for the specified date
        log_data = user.get_log(date_str)
        weight = user.get_weight(date_str)
        body_fat_pct = user.get_body_fat_pct(date_str)
        bmr = user.calculate_bmr(date_str)

        # Prepare the response data
        response_data = {
            "user": spoken_name,
            "date": date_str or "today",
            "food_entries": log_data["food_entries"],
            "exercise_entries": log_data["exercise_entries"],
            "weight": weight,
            "body_fat_pct": body_fat_pct,
            "bmr": bmr,
        }

        _LOGGER.debug(
            "Fetched data for user %s on date %s: %d food entries, %d exercise entries, weight: %s, body_fat: %s%%, bmr: %s",
            spoken_name,
            date_str or "today",
            len(log_data["food_entries"]),
            len(log_data["exercise_entries"]),
            weight,
            body_fat_pct,
            bmr,
        )

        return response_data

    # Register the services
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_FOOD,
        async_log_food,
        schema=SERVICE_LOG_FOOD_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_EXERCISE,
        async_log_exercise,
        schema=SERVICE_LOG_EXERCISE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_WEIGHT,
        async_log_weight,
        schema=SERVICE_LOG_WEIGHT_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_BODY_FAT,
        async_log_body_fat,
        schema=SERVICE_LOG_BODY_FAT_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_FETCH_DATA,
        async_fetch_data,
        schema=SERVICE_FETCH_DATA_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
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
    daily_goal = entry.data.get(DAILY_GOAL, DEFAULT_CALORIE_LIMIT)
    starting_weight = entry.data.get(STARTING_WEIGHT, 0)
    goal_weight = entry.data.get(GOAL_WEIGHT, 0)
    weight_unit = entry.data.get(WEIGHT_UNIT, DEFAULT_WEIGHT_UNIT)
    include_exercise_in_net = entry.data.get(INCLUDE_EXERCISE_IN_NET, True)
    birth_year = entry.data.get(BIRTH_YEAR)
    sex = entry.data.get(SEX)
    height = entry.data.get(HEIGHT)
    height_unit = entry.data.get(HEIGHT_UNIT, "cm")
    body_fat_pct = entry.data.get(BODY_FAT_PCT)

    storage = CalorieStorageManager(hass, entry.entry_id)

    user = CalorieTrackerUser(
        spoken_name=spoken_name,
        daily_goal=daily_goal,
        storage=storage,
        starting_weight=starting_weight,
        goal_weight=goal_weight,
        weight_unit=weight_unit,
        include_exercise_in_net=include_exercise_in_net,
        birth_year=birth_year,
        sex=sex,
        height=height,
        height_unit=height_unit,
        body_fat_pct=body_fat_pct,
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

        if hass.services.has_service(DOMAIN, SERVICE_LOG_FOOD):
            hass.services.async_remove(DOMAIN, SERVICE_LOG_FOOD)
            _LOGGER.info("Removed log_food service since no entries remain")
        if hass.services.has_service(DOMAIN, SERVICE_LOG_EXERCISE):
            hass.services.async_remove(DOMAIN, SERVICE_LOG_EXERCISE)
            _LOGGER.info("Removed log_exercise service since no entries remain")
        if hass.services.has_service(DOMAIN, SERVICE_LOG_WEIGHT):
            hass.services.async_remove(DOMAIN, SERVICE_LOG_WEIGHT)
            _LOGGER.info("Removed log_weight service since no entries remain")
        if hass.services.has_service(DOMAIN, SERVICE_LOG_BODY_FAT):
            hass.services.async_remove(DOMAIN, SERVICE_LOG_BODY_FAT)
            _LOGGER.info("Removed log_body_fat service since no entries remain")
        if hass.services.has_service(DOMAIN, SERVICE_FETCH_DATA):
            hass.services.async_remove(DOMAIN, SERVICE_FETCH_DATA)
            _LOGGER.info("Removed fetch_data service since no entries remain")
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("Removed calorie tracker panel since no entries remain")
