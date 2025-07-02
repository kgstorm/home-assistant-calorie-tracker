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


async def async_setup_intents(hass: HomeAssistant):
    """Register the calorie tracker intents."""
    intent.async_register(hass, LogCalories())
    intent.async_register(hass, LogWeight())
    intent.async_register(hass, LogExercise())
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
        "then estimate the calories. Returns some user attributes if logged correctly and returns an error if failed. "
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

        response_speech = f"The following has been logged for {spoken_name}."

        for item in food_items:
            calories = item.get("calories")
            food_item = item.get("food_item")
            sensor = matching_entry.runtime_data.get("sensor")
            if not sensor:
                response.async_set_speech("Calorie tracker sensor is not available")
                return response

            tzinfo = dt_util.get_time_zone(intent_obj.hass.config.time_zone)
            await sensor.user.async_log_food(food_item, calories, tzinfo)
            response_speech += f"{calories} calories for {food_item}."

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.user.get_spoken_name(),
                    "daily_goal": sensor.get_daily_goal(),
                    "calories_today": sensor.get_calories_today(),
                }
            }
        )
        await sensor.async_update_calories()
        return response


class LogWeight(intent.IntentHandler):
    """Handle LogWeight intent."""

    intent_type = INTENT_LOG_WEIGHT
    description = (
        "Log a weight measurement for the calorie tracker. "
        "If the name of the person is not given, use 'default'."
        "Provide motivation on achieving their goal weight."
    )

    slot_schema = {
        vol.Required("person"): cv.string,
        vol.Required("weight"): cv.positive_float,
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        weight = slots["weight"]["value"]
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

        tzinfo = dt_util.get_time_zone(intent_obj.hass.config.time_zone)
        await sensor.user.async_log_weight(weight, tzinfo)

        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "starting_weight": sensor.extra_state_attributes.get(
                        "starting_weight"
                    ),
                    "goal_weight": sensor.extra_state_attributes.get("goal_weight"),
                    "weight_today": sensor.extra_state_attributes.get("weight_today"),
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
    }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Handle the intent."""
        slots = self.async_validate_slots(intent_obj.slots)
        spoken_name = slots["person"]["value"]
        exercise_type = slots["exercise_type"]["value"]
        duration = slots.get("duration", {}).get("value")
        calories_burned = slots.get("calories_burned", {}).get("value")
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

        tzinfo = dt_util.get_time_zone(intent_obj.hass.config.time_zone)
        await sensor.user.async_log_exercise(
            exercise_type=exercise_type,
            tzinfo=tzinfo,
            duration=duration,
            calories_burned=calories_burned,
        )

        response.async_set_speech(
            f"Logged exercise '{exercise_type}'"
            + (f" for {duration} minutes" if duration else "")
            + (f", {calories_burned} calories burned" if calories_burned else "")
            + f" for {spoken_name}"
        )
        return response
