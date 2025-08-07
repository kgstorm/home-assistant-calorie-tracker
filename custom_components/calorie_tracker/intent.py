"""Custom intents for the Calorie Tracker integration."""

from __future__ import annotations

import difflib
import logging

import voluptuous as vol

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, intent
import homeassistant.util.dt as dt_util

from .const import DOMAIN, SPOKEN_NAME

_LOGGER = logging.getLogger(__name__)

INTENT_LOG_CALORIES = "LogCalories"
INTENT_LOG_WEIGHT = "LogWeight"
INTENT_LOG_EXERCISE = "LogExercise"
INTENT_GET_REMAINING_CALORIES = "GetRemainingCalories"


async def async_setup_intents(hass: HomeAssistant):
    """Register the calorie tracker intents."""
    intent.async_register(hass, LogCalories())
    intent.async_register(hass, LogWeight())
    intent.async_register(hass, LogExercise())
    intent.async_register(hass, GetRemainingCalories())
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


class LogCalories(intent.IntentHandler):
    """Handle LogCalories intent."""

    intent_type = INTENT_LOG_CALORIES
    description = (
        "Log calories. If the name of the person is not given, use 'default'. "
        "Calories, food item(s) or both must be provided by the user. If calories are provided without a food item, "
        "create a general term for food_item like 'snack' or 'lunch'. If an item is given without the calories, "
        "then estimate the calories."
        "Use the spoken_name in your response. Tell them how many calories they have remaining for the day. If it's the first item logged that day, provide some motivation or a health tip."
    )

    food_calorie_pair_schema = vol.Schema(
        {
            vol.Required("food_item"): cv.string,
            vol.Required("calories"): cv.positive_int,
        }
    )

    slot_schema = {
        vol.Required("person"): cv.string,
        vol.Required("food_items"): vol.All(
            vol.Length(min=1), [food_calorie_pair_schema]
        ),
        vol.Optional("date"): cv.string,  # ISO date string (YYYY-MM-DD)
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        entries = intent_obj.hass.config_entries.async_entries(DOMAIN)
        spoken_name_to_entry_id = {
            entry.data[SPOKEN_NAME]: entry.entry_id for entry in entries
        }

        response = intent_obj.create_response()

        if spoken_name == "default":
            if len(entries) == 0:
                response.async_set_speech("No calorie tracker users are configured")
                return response
            if len(entries) == 1:
                spoken_name = entries[0].data[SPOKEN_NAME]
            else:
                response.async_set_speech(
                    "Multiple users are registered. Please specify which user to log calories for"
                )
                return response

        matched_name = match_spoken_name(
            spoken_name, list(spoken_name_to_entry_id.keys())
        )
        if matched_name:
            matching_entry = intent_obj.hass.config_entries.async_get_entry(
                spoken_name_to_entry_id[matched_name]
            )
        else:
            response.async_set_speech(
                f"No calorie tracker found for user {spoken_name}"
            )
            return response

        if matching_entry.state != ConfigEntryState.LOADED:
            response.async_set_speech(
                "Calorie tracker is not ready. Please try again later"
            )
            return response

        food_items = slots["food_items"]["value"]
        date_str = slots.get("date", {}).get("value")

        response_speech = f"The following has been logged for {spoken_name}."

        for item in food_items:
            calories = item.get("calories")
            food_item = item.get("food_item")
            sensor = matching_entry.runtime_data.get("sensor")
            if not sensor:
                response.async_set_speech("Calorie tracker sensor is not available")
                return response

            # Create timestamp with current time if only date is provided
            timestamp_param = date_str
            if date_str:
                # If date_str is just a date (YYYY-MM-DD), add current local time
                if len(date_str) == 10 and date_str.count("-") == 2:
                    now = dt_util.now()
                    time_part = now.strftime("%H:%M")
                    timestamp_param = f"{date_str}T{time_part}"

            await sensor.user.async_log_food(
                food_item, calories, timestamp=timestamp_param
            )
            response_speech += f"{calories} calories for {food_item}."

        # Use get_log to fetch today's calories after logging
        log_date = date_str if date_str else dt_util.now().date().isoformat()
        log = sensor.user.get_log(log_date)
        net_calories = log.get("net_calories", 0)
        daily_goal = sensor.get_daily_goal()
        remaining_calories = daily_goal - net_calories

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.user.get_spoken_name(),
                    "daily_goal": daily_goal,
                    "calories_today": net_calories,
                    "remaining_calories": remaining_calories,
                }
            }
        )
        await sensor.async_update_calories()
        return response


class LogWeight(intent.IntentHandler):
    """Handle LogWeight intent."""

    intent_type = INTENT_LOG_WEIGHT
    description = (
        "Log body mass measurement for the calorie tracker. "
        "If the name of the person is not given, use 'default'. "
        "Provide a simple confirmation message."
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
        entries = intent_obj.hass.config_entries.async_entries(DOMAIN)
        spoken_name_to_entry_id = {
            entry.data[SPOKEN_NAME]: entry.entry_id for entry in entries
        }

        response = intent_obj.create_response()

        if spoken_name == "default":
            if len(entries) == 0:
                response.async_set_speech("No calorie tracker users are configured")
                return response
            if len(entries) == 1:
                spoken_name = entries[0].data[SPOKEN_NAME]
            else:
                response.async_set_speech(
                    "Multiple users are registered. Please specify which user to log weight for"
                )
                return response

        matched_name = match_spoken_name(
            spoken_name, list(spoken_name_to_entry_id.keys())
        )
        if matched_name:
            matching_entry = intent_obj.hass.config_entries.async_get_entry(
                spoken_name_to_entry_id[matched_name]
            )
        else:
            response.async_set_speech(
                f"No calorie tracker found for user {spoken_name}"
            )
            return response

        if matching_entry.state != ConfigEntryState.LOADED:
            response.async_set_speech(
                "Calorie tracker is not ready. Please try again later"
            )
            return response

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


class LogExercise(intent.IntentHandler):
    """Handle LogExercise intent."""

    intent_type = INTENT_LOG_EXERCISE
    description = (
        "Log an exercise activity for the calorie tracker. "
        "If the name of the person is not given, use 'default'."
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
        entries = intent_obj.hass.config_entries.async_entries(DOMAIN)
        spoken_name_to_entry_id = {
            entry.data[SPOKEN_NAME]: entry.entry_id for entry in entries
        }

        response = intent_obj.create_response()

        if spoken_name == "default":
            if len(entries) == 0:
                response.async_set_speech("No calorie tracker users are configured")
                return response
            if len(entries) == 1:
                spoken_name = entries[0].data[SPOKEN_NAME]
            else:
                response.async_set_speech(
                    "Multiple users are registered. Please specify which user to log exercise for"
                )
                return response

        matched_name = match_spoken_name(
            spoken_name, list(spoken_name_to_entry_id.keys())
        )
        if matched_name:
            matching_entry = intent_obj.hass.config_entries.async_get_entry(
                spoken_name_to_entry_id[matched_name]
            )
        else:
            response.async_set_speech(
                f"No calorie tracker found for user {spoken_name}"
            )
            return response

        if matching_entry.state != ConfigEntryState.LOADED:
            response.async_set_speech(
                "Calorie tracker is not ready. Please try again later"
            )
            return response

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

        response.async_set_speech(
            f"Logged exercise '{exercise_type}'"
            + (f" for {duration} minutes" if duration else "")
            + (f", {calories_burned} calories burned" if calories_burned else "")
            + f" for {spoken_name}"
        )
        return response


class GetRemainingCalories(intent.IntentHandler):
    """Handle GetRemainingCalories intent."""

    intent_type = INTENT_GET_REMAINING_CALORIES
    description = (
        "Get the remaining calories for a user's daily goal. "
        "If the name of the person is not given, use 'default'. "
        "Respond with how many calories they have left for the day and provide encouragement."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        entries = intent_obj.hass.config_entries.async_entries(DOMAIN)
        spoken_name_to_entry_id = {
            entry.data[SPOKEN_NAME]: entry.entry_id for entry in entries
        }

        response = intent_obj.create_response()

        if spoken_name == "default":
            if len(entries) == 0:
                response.async_set_speech("No calorie tracker users are configured")
                return response
            if len(entries) == 1:
                spoken_name = entries[0].data[SPOKEN_NAME]
            else:
                response.async_set_speech(
                    "Multiple users are registered. Please specify which user to check calories for"
                )
                return response

        matched_name = match_spoken_name(
            spoken_name, list(spoken_name_to_entry_id.keys())
        )
        if matched_name:
            matching_entry = intent_obj.hass.config_entries.async_get_entry(
                spoken_name_to_entry_id[matched_name]
            )
        else:
            response.async_set_speech(
                f"No calorie tracker found for user {spoken_name}"
            )
            return response

        if matching_entry.state != ConfigEntryState.LOADED:
            response.async_set_speech(
                "Calorie tracker is not ready. Please try again later"
            )
            return response

        sensor = matching_entry.runtime_data.get("sensor")
        if not sensor:
            response.async_set_speech("Calorie tracker sensor is not available")
            return response

        # Use today's date for log lookup
        today_iso = dt_util.now().date().isoformat()
        log = sensor.user.get_log(today_iso)
        net_calories = log.get("net_calories", 0)
        daily_goal = sensor.get_daily_goal()
        remaining_calories = daily_goal - net_calories

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "daily_goal": daily_goal,
                    "calories_today": net_calories,
                    "remaining_calories": remaining_calories,
                }
            }
        )
        return response
