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

# Cache for spoken name -> config entry lookups (reset on integration reload)
_SPOKEN_NAME_CACHE: dict[str, str] = {}  # spoken_name.lower() -> entry_id


def _get_entry_for_spoken_name(hass: HomeAssistant, spoken_name: str):
    """Get config entry for spoken name with caching for performance."""
    spoken_lower = spoken_name.lower()

    # Check cache first
    if spoken_lower in _SPOKEN_NAME_CACHE:
        entry_id = _SPOKEN_NAME_CACHE[spoken_lower]
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry and entry.state == ConfigEntryState.LOADED:
            return entry
        # Entry no longer valid, remove from cache
        _SPOKEN_NAME_CACHE.pop(spoken_lower, None)

    # Cache miss or invalid entry - do full search and update cache
    for entry in hass.config_entries.async_entries(DOMAIN):
        entry_spoken_name = entry.data.get(SPOKEN_NAME)
        if entry_spoken_name and entry_spoken_name.lower() == spoken_lower:
            if entry.state == ConfigEntryState.LOADED:
                _SPOKEN_NAME_CACHE[spoken_lower] = entry.entry_id
                return entry
            # Found but not loaded
            return entry

    return None


def _clear_spoken_name_cache() -> None:
    """Clear the spoken name cache (called on integration setup/unload)."""
    _SPOKEN_NAME_CACHE.clear()


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
        # Optional macronutrient grams (accept both short and spelled-out names)
        # Short keys used by storage: c (carbs), p (protein), f (fat), a (alcohol)
        vol.Optional("c"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("p"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("f"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("a"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        # Plain English keys accepted from service callers
        vol.Optional("carbs"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("protein"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("fat"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        # Accept both 'alcohol' and common misspelling 'alchohol'
        vol.Optional("alcohol"): vol.All(vol.Coerce(float), vol.Range(min=0)),
        vol.Optional("alchohol"): vol.All(vol.Coerce(float), vol.Range(min=0)),
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

    # Optimize: extract macros with single lookup per macro type
    def _get_macro_value(keys: tuple[str, ...]) -> float | None:
        """Get first non-None value from list of possible keys."""
        for key in keys:
            value = call.data.get(key)
            if value is not None:
                return value
        return None

    p = _get_macro_value(("protein", "p"))
    c = _get_macro_value(("carbs", "carb", "carbohydrate", "carbohydrates", "c"))
    f = _get_macro_value(("fat", "f"))
    a = _get_macro_value(("alcohol", "alchohol", "a"))

    # Don't log unnecessary zeros: treat explicit 0 values as "no value" so
    # storage does not create empty/zero macro entries. Use explicit float
    # comparison to avoid falsey checks.
    try:
        if p is not None and float(p) == 0:
            p = None
    except (ValueError, TypeError):
        pass
    try:
        if c is not None and float(c) == 0:
            c = None
    except (ValueError, TypeError):
        pass
    try:
        if f is not None and float(f) == 0:
            f = None
    except (ValueError, TypeError):
        pass
    try:
        if a is not None and float(a) == 0:
            a = None
    except (ValueError, TypeError):
        pass

    matching_entry = _get_entry_for_spoken_name(hass, spoken_name)
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

    matching_entry = _get_entry_for_spoken_name(hass, spoken_name)
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

    matching_entry = _get_entry_for_spoken_name(hass, spoken_name)
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

    matching_entry = _get_entry_for_spoken_name(hass, spoken_name)
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

    matching_entry = _get_entry_for_spoken_name(hass, spoken_name)
    if not matching_entry or matching_entry.state != ConfigEntryState.LOADED:
        raise ServiceValidationError(f"No loaded entry found for user: '{spoken_name}'")

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]

    # Get the log data for the specified date
    log_data = user.get_log(date_str)

    # Convert short macro keys (p,c,f,a) in each food entry to spelled-out names
    def _convert_macros_in_food_entries(entries: list[dict]) -> list[dict]:
        converted: list[dict] = []
        for entry in entries:
            e = dict(entry)  # copy to avoid mutating storage objects
            # Map and remove short keys if present
            if "p" in e:
                e["protein"] = e.pop("p")
            if "c" in e:
                e["carbs"] = e.pop("c")
            if "f" in e:
                e["fat"] = e.pop("f")
            if "a" in e:
                e["alcohol"] = e.pop("a")
            converted.append(e)
        return converted

    # Apply conversion so service consumers get spelled-out macro names
    log_data["food_entries"] = _convert_macros_in_food_entries(
        log_data.get("food_entries", [])
    )
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
    # Clear cache on setup to ensure fresh state
    _clear_spoken_name_cache()

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
    # Clear cache on unload
    _clear_spoken_name_cache()

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
