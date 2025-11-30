"""Custom intents for the Calorie Tracker integration."""

from __future__ import annotations

import difflib
import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, intent
import homeassistant.util.dt as dt_util

from .const import DOMAIN, NO_USER_SPECIFIED, SPOKEN_NAME
from .storage import get_user_profile_map

_LOGGER = logging.getLogger(__name__)

# Cache for spoken name -> config entry lookups (shared with services.py)
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


async def _async_resolve_intent_user(
    hass: HomeAssistant,
    spoken_name: str,
    response,
    *,
    intent_user_id: str | None,
) -> tuple[str | None, ConfigEntry | None]:
    """Resolve spoken name for intent, handling 'no_user_specified' hierarchy."""
    entries = hass.config_entries.async_entries(DOMAIN)

    if not entries:
        response.async_set_speech("No calorie tracker users are configured")
        return None, None

    if spoken_name == NO_USER_SPECIFIED:
        if len(entries) == 1:
            matching_entry = entries[0]
            if matching_entry.state != ConfigEntryState.LOADED:
                response.async_set_speech(
                    "Calorie tracker is not ready. Please try again later"
                )
                return None, None
            resolved_name = matching_entry.data.get(SPOKEN_NAME)
            if resolved_name:
                _SPOKEN_NAME_CACHE[resolved_name.lower()] = matching_entry.entry_id
            else:
                resolved_name = matching_entry.title or matching_entry.entry_id
            return resolved_name, matching_entry

        if intent_user_id:
            profile_map = get_user_profile_map(hass)
            mapped_entry_id = await profile_map.async_get(intent_user_id)
            if mapped_entry_id:
                matching_entry = hass.config_entries.async_get_entry(mapped_entry_id)
                if matching_entry:
                    if matching_entry.state != ConfigEntryState.LOADED:
                        response.async_set_speech(
                            "Calorie tracker is not ready. Please try again later"
                        )
                        return None, None
                    resolved_name = matching_entry.data.get(SPOKEN_NAME)
                    if resolved_name:
                        _SPOKEN_NAME_CACHE[resolved_name.lower()] = (
                            matching_entry.entry_id
                        )
                    else:
                        resolved_name = matching_entry.title or matching_entry.entry_id
                    return resolved_name, matching_entry

        response.async_set_speech(
            "Multiple users are registered. Please specify which user"
        )
        return None, None

    if matching_entry := _get_entry_for_spoken_name(hass, spoken_name):
        if matching_entry.state != ConfigEntryState.LOADED:
            response.async_set_speech(
                "Calorie tracker is not ready. Please try again later"
            )
            return None, None
        resolved_name = (
            matching_entry.data.get(SPOKEN_NAME)
            or matching_entry.title
            or matching_entry.entry_id
        )
        return resolved_name, matching_entry

    spoken_name_to_entry_id = {
        entry_name: entry.entry_id
        for entry in entries
        if (entry_name := entry.data.get(SPOKEN_NAME))
    }
    matched_name = match_spoken_name(spoken_name, list(spoken_name_to_entry_id.keys()))

    if matched_name:
        matching_entry = hass.config_entries.async_get_entry(
            spoken_name_to_entry_id[matched_name]
        )
        if matching_entry and matching_entry.state == ConfigEntryState.LOADED:
            _SPOKEN_NAME_CACHE[matched_name.lower()] = matching_entry.entry_id
            return matched_name, matching_entry

        response.async_set_speech(
            "Calorie tracker is not ready. Please try again later"
        )
        return None, None

    response.async_set_speech(f"No calorie tracker found for user {spoken_name}")
    return None, None


INTENT_LOG_CALORIES = "LogCalories"
INTENT_LOG_WEIGHT = "LogWeight"
INTENT_LOG_BODY_FAT = "LogBodyFat"
INTENT_LOG_EXERCISE = "LogExercise"
INTENT_GET_REMAINING_CALORIES = "GetRemainingCalories"
INTENT_GET_MACROS = "GetMacros"


async def async_setup_intents(hass: HomeAssistant):
    """Register the calorie tracker intents."""
    intent.async_register(hass, LogCalories())
    intent.async_register(hass, LogWeight())
    intent.async_register(hass, LogBodyFat())
    intent.async_register(hass, LogExercise())
    intent.async_register(hass, GetRemainingCalories())
    intent.async_register(hass, GetMacros())
    return True


def match_spoken_name(
    input_name: str, spoken_names: list[str], cutoff: float = 0.8
) -> str | None:
    """Return the best matching spoken_name (case-insensitive) or None if no good match."""
    lower_map = {name.lower(): name for name in spoken_names}
    matches = difflib.get_close_matches(
        input_name.lower(), list(lower_map.keys()), n=1, cutoff=cutoff
    )
    return lower_map[matches[0]] if matches else None


def _calculate_remaining_calories(
    sensor: Any, log_date: str | None = None
) -> tuple[int, int, int]:
    """Return (remaining_calories, daily_calorie_goal, calories_today)."""
    target_date = log_date or dt_util.now().date().isoformat()
    log = sensor.user.get_log(target_date)
    food_cals, exercise_cals = log.get("calories", (0, 0))
    goal = sensor.user.get_goal(target_date) or {}
    goal_type = goal.get("goal_type", "fixed_intake")
    goal_value = goal.get("goal_value", 0)
    weight = sensor.user.get_weight(target_date) or 0.0
    bmr = sensor.user.calculate_bmr(target_date) or 0.0
    neat = sensor.user.get_neat()
    bmr_and_neat = int(round(bmr * neat))

    if goal_type in ("fixed_intake", "fixed_net_calories"):
        daily_calorie_goal = int(round(goal_value))
    elif goal_type == "fixed_deficit":
        daily_calorie_goal = int(round(bmr_and_neat - goal_value))
    elif goal_type == "fixed_surplus":
        daily_calorie_goal = int(round(bmr_and_neat + goal_value))
    elif goal_type in ("variable_cut", "variable_bulk"):
        percent = goal_value / 100.0
        weight_unit = sensor.user.get_weight_unit()
        cal_per_weight = 7700 if weight_unit == "kg" else 3500
        delta = round(weight * percent / 7.0 * cal_per_weight)
        if goal_type == "variable_cut":
            daily_calorie_goal = int(round(bmr_and_neat - delta))
        else:
            daily_calorie_goal = int(round(bmr_and_neat + delta))
    else:
        daily_calorie_goal = int(round(goal_value))

    if goal_type == "fixed_intake":
        calories_today = food_cals
    else:
        calories_today = food_cals - exercise_cals

    remaining_calories = daily_calorie_goal - calories_today
    return remaining_calories, daily_calorie_goal, calories_today


def _format_remaining_calorie_speech(spoken_name: str, remaining_calories: int) -> str:
    """Return a human-friendly sentence for remaining calories."""
    if spoken_name and spoken_name != NO_USER_SPECIFIED:
        subject = spoken_name
        if remaining_calories >= 0:
            return f"{subject} has {remaining_calories} calories remaining for today."
        return f"{subject} has exceeded their goal by {abs(remaining_calories)} calories today."

    if remaining_calories >= 0:
        return f"You have {remaining_calories} calories remaining for today."
    return f"You have exceeded your goal by {abs(remaining_calories)} calories today."


class LogCalories(intent.IntentHandler):
    """Handle LogCalories intent."""

    intent_type = INTENT_LOG_CALORIES
    description = (
        "Log food and calories consumed. Log food items and estimated calories; include carbs, protein, fat, and alcohol in grams (rounded to the nearest tenth) for each item. "
        "If an item does not have a certain macro, set it to zero. Make sure total calories match the macros provided by using standard calorie counts per gram (carbs=4, protein=4, fat=9, alcohol=7)."
    )

    food_calorie_pair_schema = vol.Schema(
        {
            vol.Required("food_item"): cv.string,
            vol.Required("calories"): cv.positive_int,
            vol.Required("carbs"): cv.positive_float,
            vol.Required("protein"): cv.positive_float,
            vol.Required("fat"): cv.positive_float,
            vol.Required("alcohol"): cv.positive_float,
        }
    )

    slot_schema = {
        vol.Optional("person"): cv.string,
        vol.Required("food_items"): vol.All(
            vol.Length(min=1), [food_calorie_pair_schema]
        ),
        vol.Optional("date"): cv.string,  # ISO date string (YYYY-MM-DD)
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        # `person` is optional; default to NO_USER_SPECIFIED when missing or empty
        person_slot = slots.get("person") or {}
        spoken_name = person_slot.get("value") or NO_USER_SPECIFIED
        response = intent_obj.create_response()

        # Optimize: use helper function to resolve user and handle errors
        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        food_items = slots["food_items"]["value"]
        date_str = slots.get("date", {}).get("value")

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Check if user tracks macros to decide whether to log them
        tracks_macros = matching_entry.options.get("track_macros", False)

        for item in food_items:
            calories = item.get("calories")
            food_item = item.get("food_item")
            carbs = item.get("carbs")
            protein = item.get("protein")
            fat = item.get("fat")
            alcohol = item.get("alcohol")

            # Create timestamp with current time if only date is provided
            timestamp_param = date_str
            if date_str:
                # If date_str is just a date (YYYY-MM-DD), add current local time
                if len(date_str) == 10 and date_str.count("-") == 2:
                    now = dt_util.now()
                    time_part = now.strftime("%H:%M")
                    timestamp_param = f"{date_str}T{time_part}"

            # Log food with macros only if user tracks them
            if tracks_macros:
                await sensor.user.async_log_food(
                    food_item,
                    calories,
                    timestamp=timestamp_param,
                    c=carbs,
                    p=protein,
                    f=fat,
                    a=alcohol,
                )
            else:
                await sensor.user.async_log_food(
                    food_item, calories, timestamp=timestamp_param
                )

        log_date = date_str if date_str else dt_util.now().date().isoformat()
        remaining_calories, _, _ = _calculate_remaining_calories(sensor, log_date)
        speech = _format_remaining_calorie_speech(spoken_name, remaining_calories)

        response.async_set_speech(speech)
        await sensor.async_update_calories()
        return response


class LogWeight(intent.IntentHandler):
    """Handle LogWeight intent."""

    intent_type = INTENT_LOG_WEIGHT
    description = (
        "Log body weight measurement (in pounds or kilograms) for the calorie tracker. "
        "This intent is ONLY for logging the person's body weight, NOT for logging food. "
        "Use this intent only when the user is clearly referring to their own body weight measurement, "
        "not when they mention the weight of food items they are eating. "
        "If the name of the person is not given, use 'no_user_specified'."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
        vol.Required("weight"): cv.positive_float,
        vol.Optional("date"): cv.string,  # date string (YYYY-MM-DD)
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        weight = slots["weight"]["value"]
        date_str = slots.get("date", {}).get("value")
        response = intent_obj.create_response()

        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Create timestamp with current time if only date is provided
        timestamp_param = date_str
        if date_str:
            if len(date_str) == 10 and date_str.count("-") == 2:
                now = dt_util.now()
                time_part = now.strftime("%H:%M")
                timestamp_param = f"{date_str}T{time_part}"

        await sensor.user.async_log_weight(weight, date_str=timestamp_param)

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "measurement_logged": True,
                }
            }
        )
        return response


class LogBodyFat(intent.IntentHandler):
    """Handle LogBodyFat intent."""

    intent_type = INTENT_LOG_BODY_FAT
    description = (
        "Log body fat percentage measurement for the calorie tracker. "
        "If the name of the person is not given, use 'no_user_specified'. "
        "Body fat percentage should be a number between 3 and 50. "
        "Provide a simple confirmation message."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
        vol.Required("body_fat_pct"): vol.All(
            cv.positive_float, vol.Range(min=3, max=50)
        ),
        vol.Optional("date"): cv.string,  # date string (YYYY-MM-DD)
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        body_fat_pct = slots["body_fat_pct"]["value"]
        date_str = slots.get("date", {}).get("value")
        response = intent_obj.create_response()

        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Log body fat percentage
        await sensor.user.async_log_body_fat_pct(body_fat_pct, date_str=date_str)

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "body_fat_pct": body_fat_pct,
                    "measurement_logged": True,
                }
            }
        )
        return response


class LogExercise(intent.IntentHandler):
    """Handle LogExercise intent."""

    intent_type = INTENT_LOG_EXERCISE
    description = (
        "Log an exercise activity for the calorie tracker. "
        "If the name of the person is not given, use 'no_user_specified'."
        "If calories is not given, then estimate the calories from exercise type."
        "If exercise type is not given, use 'exercise'."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
        vol.Required("exercise_type"): cv.string,
        vol.Optional("duration"): cv.positive_int,
        vol.Required("calories_burned"): cv.positive_int,
        vol.Optional("date"): cv.string,  # date string (YYYY-MM-DD)
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        exercise_type = slots["exercise_type"]["value"]
        duration = slots.get("duration", {}).get("value")
        calories_burned = slots.get("calories_burned", {}).get("value")
        date_str = slots.get("date", {}).get("value")
        response = intent_obj.create_response()

        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Create timestamp with current time if only date is provided
        timestamp_param = date_str
        if date_str:
            if len(date_str) == 10 and date_str.count("-") == 2:
                now = dt_util.now()
                time_part = now.strftime("%H:%M")
                timestamp_param = f"{date_str}T{time_part}"

        await sensor.user.async_log_exercise(
            exercise_type=exercise_type,
            duration=duration,
            calories_burned=calories_burned,
            timestamp=timestamp_param,
        )

        response.async_set_speech(f"Logged '{exercise_type}'" + f" for {spoken_name}")
        return response


class GetRemainingCalories(intent.IntentHandler):
    """Handle GetRemainingCalories intent."""

    intent_type = INTENT_GET_REMAINING_CALORIES
    description = (
        "Get the remaining calories for a user's daily goal. "
        "If the name of the person is not given, use 'no_user_specified'. "
        "Respond with how many calories they have remaining or if they have exceeded their goal. Negative means they have exceeded their goal."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        response = intent_obj.create_response()

        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        remaining_calories, _, _ = _calculate_remaining_calories(sensor)
        speech = _format_remaining_calorie_speech(spoken_name, remaining_calories)
        response.async_set_speech(speech)
        return response


class GetMacros(intent.IntentHandler):
    """Handle GetMacros intent."""

    intent_type = INTENT_GET_MACROS
    description = (
        "Get today's macro totals (carbs, protein, fat, alcohol) for a user's logged foods. "
        "If the name of the person is not given, use 'no_user_specified'. "
        "Tell the user their grams of macros and the percentage of calories from fat."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        response = intent_obj.create_response()

        resolved_name, matching_entry = await _async_resolve_intent_user(
            intent_obj.hass,
            spoken_name,
            response,
            intent_user_id=getattr(intent_obj.context, "user_id", None),
        )
        if not resolved_name or not matching_entry:
            return response

        spoken_name = resolved_name

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Use today's date for macro lookup
        today_iso = dt_util.now().date().isoformat()
        macros = sensor.user.get_daily_macros(today_iso) or {}

        # Ensure keys exist and map to readable names
        carbs = int(macros.get("c", 0))
        protein = int(macros.get("p", 0))
        fat = int(macros.get("f", 0))
        alcohol = int(macros.get("a", 0))

        # Calculate fat percent as percentage of calories from fat
        # calories per gram: carbs=4, protein=4, fat=9, alcohol=7
        total_macro_calories = carbs * 4 + protein * 4 + fat * 9 + alcohol * 7
        fat_percent = (
            int(round((fat * 9 / total_macro_calories) * 100))
            if total_macro_calories > 0
            else 0
        )

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "macros": {
                        "carbs_g": carbs,
                        "protein_g": protein,
                        "fat_g": fat,
                        "fat_percent": fat_percent,
                    },
                }
            }
        )
        return response
