"""Services for the Calorie Tracker integration."""

from __future__ import annotations

import logging

import voluptuous as vol

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

# Try to import SupportsResponse for newer HA versions
try:
    from homeassistant.core import SupportsResponse

    HAS_SUPPORTS_RESPONSE = True
except ImportError:
    # For older HA versions, create a dummy enum
    class SupportsResponse:
        """Dummy SupportsResponse enum for older Home Assistant versions.

        Used to provide compatibility for service response support.
        """

        OPTIONAL = "optional"
        NONE = "none"

    HAS_SUPPORTS_RESPONSE = False

# Try to import ServiceValidationError for newer HA versions, fall back to ValueError
try:
    from homeassistant.exceptions import ServiceValidationError
except ImportError:
    try:
        from homeassistant.core import ServiceValidationError
    except ImportError:
        # For older HA versions, use ValueError as fallback
        ServiceValidationError = ValueError

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    BODY_FAT_PCT,
    CALORIES,
    CALORIES_BURNED,
    DOMAIN,
    DURATION,
    ENTRY_TYPE,
    EXERCISE_TYPE,
    FOOD_ITEM,
    SPOKEN_NAME,
    TIMESTAMP,
    WEIGHT,
)

_LOGGER = logging.getLogger(__name__)

# Service name constants
SERVICE_CREATE_ENTRY = "create_entry"
SERVICE_LOG_FOOD = "log_food"
SERVICE_LOG_EXERCISE = "log_exercise"
SERVICE_LOG_WEIGHT = "log_weight"
SERVICE_LOG_BODY_FAT = "log_body_fat"
SERVICE_FETCH_DATA = "fetch_data"

# Service schemas
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

SERVICE_LOG_FOOD_SCHEMA = vol.Schema(
    {
        vol.Required(SPOKEN_NAME): cv.string,
        vol.Required(FOOD_ITEM): cv.string,
        vol.Required(CALORIES): cv.positive_int,
        vol.Optional(TIMESTAMP): cv.string,
        # Optional macronutrient grams (carbs/protein/fat/alcohol)
        vol.Optional("c"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("p"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("f"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("a"): vol.All(vol.Coerce(float), vol.Range(min=0)),
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


async def async_log_food(hass: HomeAssistant, call: ServiceCall) -> None:
    """Log a food entry for a user."""
    spoken_name = call.data[SPOKEN_NAME]
    food_item = call.data[FOOD_ITEM]
    calories = call.data[CALORIES]
    timestamp = call.data.get(TIMESTAMP)
    # Optional macro fields
    c = call.data.get("c")
    p = call.data.get("p")
    f = call.data.get("f")
    a = call.data.get("a")

    matching_entry = next(
        (
            entry
            for entry in hass.config_entries.async_entries(DOMAIN)
            if entry.data.get(SPOKEN_NAME)
            and entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()  # pyright: ignore[reportOptionalMemberAccess]
        ),
        None,
    )

    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

    sensor = matching_entry.runtime_data.get("sensor")
    if not sensor:
        _LOGGER.warning(
            "Sensor not available for username %s; skipping update", spoken_name
        )
        return

    # Forward optional macro values to storage (storage will ignore None values)
    await sensor.user.async_log_food(
        food_item, calories, timestamp=timestamp, c=c, p=p, f=f, a=a
    )
    await sensor.async_update_calories()
    _LOGGER.debug(
        "Logged %s calories for user %s (item: %s, timestamp: %s, macros: c=%s p=%s f=%s a=%s)",
        calories,
        spoken_name,
        food_item,
        timestamp,
        c,
        p,
        f,
        a,
    )


async def async_log_exercise(hass: HomeAssistant, call: ServiceCall) -> None:
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
            if entry.data.get(SPOKEN_NAME)
            and entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()  # pyright: ignore[reportOptionalMemberAccess]
        ),
        None,
    )

    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

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


async def async_log_weight(hass: HomeAssistant, call: ServiceCall) -> None:
    """Log a weight entry for a user."""
    spoken_name = call.data[SPOKEN_NAME]
    weight = call.data[WEIGHT]
    timestamp = call.data.get(TIMESTAMP)

    matching_entry = next(
        (
            entry
            for entry in hass.config_entries.async_entries(DOMAIN)
            if entry.data.get(SPOKEN_NAME)
            and entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
        ),
        None,
    )

    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

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


async def async_log_body_fat(hass: HomeAssistant, call: ServiceCall) -> None:
    """Log a body fat percentage entry for a user."""
    spoken_name = call.data[SPOKEN_NAME]
    body_fat_pct = call.data[BODY_FAT_PCT]
    timestamp = call.data.get(TIMESTAMP)

    matching_entry = next(
        (
            entry
            for entry in hass.config_entries.async_entries(DOMAIN)
            if entry.data.get(SPOKEN_NAME)
            and entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
        ),
        None,
    )

    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

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


async def async_fetch_data(hass: HomeAssistant, call: ServiceCall) -> None:
    """Fetch all entries for a user on a given day."""
    spoken_name = call.data[SPOKEN_NAME]
    date_str = call.data.get(TIMESTAMP)  # Optional date, defaults to today

    matching_entry = next(
        (
            entry
            for entry in hass.config_entries.async_entries(DOMAIN)
            if entry.data.get(SPOKEN_NAME)
            and entry.data.get(SPOKEN_NAME).lower() == spoken_name.lower()
        ),
        None,
    )

    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]

    # Get the log data for the specified date
    log_data = user.get_log(date_str)
    weight = user.get_weight(date_str)
    body_fat_pct = user.get_body_fat_pct(date_str)
    bmr = user.calculate_bmr(date_str)
    activity_multiplier = user.get_neat()
    bmr_and_neat = (bmr * activity_multiplier) if bmr else None

    # Prepare the response data
    response_data = {
        "user": spoken_name,
        "date": date_str or "today",
        "food_entries": log_data["food_entries"],
        "exercise_entries": log_data["exercise_entries"],
        "weight": weight,
        "body_fat_pct": body_fat_pct,
        "baseline_calorie_burn": bmr_and_neat,
        "activity_multiplier": activity_multiplier,
    }

    _LOGGER.debug(
        "Fetched data for user %s on date %s: %d food entries, %d exercise entries, weight: %s, body_fat: %s%%, baseline_calorie_burn: %s, activity_multiplier: %s",
        spoken_name,
        date_str or "today",
        len(log_data["food_entries"]),
        len(log_data["exercise_entries"]),
        weight,
        body_fat_pct,
        bmr_and_neat,
        activity_multiplier,
    )

    return response_data


async def async_setup_services(hass: HomeAssistant) -> None:
    """Register all services for the Calorie Tracker integration."""

    async def _log_food_service(call: ServiceCall) -> None:
        await async_log_food(hass, call)

    async def _log_exercise_service(call: ServiceCall) -> None:
        await async_log_exercise(hass, call)

    async def _log_weight_service(call: ServiceCall) -> None:
        await async_log_weight(hass, call)

    async def _log_body_fat_service(call: ServiceCall) -> None:
        await async_log_body_fat(hass, call)

    async def _fetch_data_service(call: ServiceCall) -> dict:
        return await async_fetch_data(hass, call)

    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_FOOD,
        _log_food_service,
        schema=SERVICE_LOG_FOOD_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_EXERCISE,
        _log_exercise_service,
        schema=SERVICE_LOG_EXERCISE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_WEIGHT,
        _log_weight_service,
        schema=SERVICE_LOG_WEIGHT_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_BODY_FAT,
        _log_body_fat_service,
        schema=SERVICE_LOG_BODY_FAT_SCHEMA,
    )
    # Register fetch data service with supports_response if available
    service_kwargs = {
        "domain": DOMAIN,
        "service": SERVICE_FETCH_DATA,
        "service_func": _fetch_data_service,
        "schema": SERVICE_FETCH_DATA_SCHEMA,
    }
    if HAS_SUPPORTS_RESPONSE:
        service_kwargs["supports_response"] = SupportsResponse.OPTIONAL

    hass.services.async_register(**service_kwargs)

    _LOGGER.info("Calorie Tracker services registered successfully")


async def async_unload_services(hass: HomeAssistant) -> None:
    """Unregister all services for the Calorie Tracker integration."""

    # Remove services if they exist
    if hass.services.has_service(DOMAIN, SERVICE_LOG_FOOD):
        hass.services.async_remove(DOMAIN, SERVICE_LOG_FOOD)

    if hass.services.has_service(DOMAIN, SERVICE_LOG_EXERCISE):
        hass.services.async_remove(DOMAIN, SERVICE_LOG_EXERCISE)

    if hass.services.has_service(DOMAIN, SERVICE_LOG_WEIGHT):
        hass.services.async_remove(DOMAIN, SERVICE_LOG_WEIGHT)

    if hass.services.has_service(DOMAIN, SERVICE_LOG_BODY_FAT):
        hass.services.async_remove(DOMAIN, SERVICE_LOG_BODY_FAT)

    if hass.services.has_service(DOMAIN, SERVICE_FETCH_DATA):
        hass.services.async_remove(DOMAIN, SERVICE_FETCH_DATA)

    _LOGGER.info("Calorie Tracker services unregistered successfully")
