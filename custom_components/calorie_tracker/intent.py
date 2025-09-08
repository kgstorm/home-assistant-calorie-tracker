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


class LogCalories(intent.IntentHandler):
    """Handle LogCalories intent."""

    intent_type = INTENT_LOG_CALORIES
    description = (
        "Log calories. Estimate the calories if not provided. If the name of the person is not given, use 'default'. "
        "If calories are provided without a food item, "
        "create a general term for food_item like 'snack' or 'lunch'. "
        "Always estimate and include carbs, protein, fat, and alcohol in grams (rounded to nearest tenth) for each food item using your knowledge of typical macro profiles. "
        "Respond to the user with them how many calories they have remaining for the day. Do not mention macros in the response."
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

        # Use get_log to fetch today's calories after logging
        log_date = date_str if date_str else dt_util.now().date().isoformat()
        log = sensor.user.get_log(log_date)
        food_cals, exercise_cals = log.get("calories", (0, 0))
        goal = sensor.user.get_goal(log_date) or {}
        goal_type = goal.get("goal_type", "fixed_intake")
        goal_value = goal.get("goal_value", 0)
        weight = sensor.user.get_weight(log_date) or 0.0
        bmr = sensor.user.calculate_bmr(log_date) or 0.0
        neat = sensor.user.get_neat()
        bmr_and_neat = int(round(bmr * neat))
        if goal_type in ("fixed_intake", "fixed_net_calories"):
            daily_calorie_goal = int(round(goal_value))
        elif goal_type == "fixed_deficit":
            # Fixed deficit is stored as kcals below BMR+NEAT
            daily_calorie_goal = int(round(bmr_and_neat - goal_value))
        elif goal_type == "fixed_surplus":
            # Fixed surplus is stored as kcals above BMR+NEAT
            daily_calorie_goal = int(round(bmr_and_neat + goal_value))
        elif goal_type in ("variable_cut", "variable_bulk"):
            percent = goal_value / 100.0
            weight_unit = sensor.user.get_weight_unit()
            cal_per_weight = 7700 if weight_unit == "kg" else 3500
            daily_calorie_goal = int(
                round(bmr_and_neat - (weight * percent / 7.0 * cal_per_weight))
            )
        else:
            daily_calorie_goal = int(round(goal_value))
        # Subtract exercise for all goal types except fixed_intake
        if goal_type == "fixed_intake":
            calories_today = food_cals
        else:
            calories_today = food_cals - exercise_cals
        remaining_calories = daily_calorie_goal - calories_today
        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.user.get_spoken_name(),
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


class LogBodyFat(intent.IntentHandler):
    """Handle LogBodyFat intent."""

    intent_type = INTENT_LOG_BODY_FAT
    description = (
        "Log body fat percentage measurement for the calorie tracker. "
        "If the name of the person is not given, use 'default'. "
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
                    "Multiple users are registered. Please specify which user to log body fat for"
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
        "Respond with how many calories they have remaining or if they have exceeded thier goal. Negative means they have exceeded their goal."
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
        food_cals, exercise_cals = log.get("calories", (0, 0))
        goal = sensor.user.get_goal(today_iso) or {}
        goal_type = goal.get("goal_type", "fixed_intake")
        goal_value = goal.get("goal_value", 0)
        weight = sensor.user.get_weight(today_iso) or 0.0
        bmr = sensor.user.calculate_bmr(today_iso) or 0.0
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
            daily_calorie_goal = int(
                round(bmr_and_neat - (weight * percent / 7.0 * cal_per_weight))
            )
        else:
            daily_calorie_goal = int(round(goal_value))
        # Subtract exercise for all goal types except fixed_intake
        if goal_type == "fixed_intake":
            calories_today = food_cals
        else:
            calories_today = food_cals - exercise_cals
        remaining_calories = daily_calorie_goal - calories_today
        response.async_set_speech(
            {
                "profile": {
                    "spoken_name": sensor.extra_state_attributes.get("spoken_name"),
                    "calories_over_or_under": remaining_calories,
                }
            }
        )
        return response


class GetMacros(intent.IntentHandler):
    """Handle GetMacros intent."""

    intent_type = INTENT_GET_MACROS
    description = (
        "Get today's macro totals (carbs, protein, fat, alcohol) for a user's logged foods. "
        "If the name of the person is not given, use 'default'. "
        "Tell the user their grams of macros and the percentage of calories from fat."
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
                    "Multiple users are registered. Please specify which user to check macros for"
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
