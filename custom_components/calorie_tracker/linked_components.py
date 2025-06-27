"""Linked component listeners for Calorie Tracker."""

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event

from .api import CalorieTrackerAPI


def setup_peloton_listener(
    hass: HomeAssistant,
    user_id: str,
    api: CalorieTrackerAPI,
) -> CALLBACK_TYPE:
    """Set up a listener for Peloton workout completion.

    On workout completion, logs the exercise directly using the CalorieTrackerAPI.
    """

    workout_entity_id = f"binary_sensor.{user_id}_workout"
    calories_entity_id = f"sensor.{user_id}_calories"
    duration_entity_id = f"sensor.{user_id}_duration"

    async def _async_peloton_state_change(event: Event) -> None:
        """Handle Peloton workout state changes."""
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state is not None and new_state is not None:
            if old_state.state == "on" and new_state.state == "off":
                # Gather workout data from new_state.attributes
                workout_data = dict(new_state.attributes)
                exercise_type = workout_data.get("Workout Type")

                # Get calories burned from the calories sensor
                calories_state = hass.states.get(calories_entity_id)
                calories_burned = None
                if calories_state and calories_state.state not in (
                    None,
                    "unknown",
                    "unavailable",
                ):
                    try:
                        calories_burned = int(float(calories_state.state))
                    except (ValueError, TypeError):
                        calories_burned = None

                # Get duration from the duration sensor
                duration_state = hass.states.get(duration_entity_id)
                duration = None
                if duration_state and duration_state.state not in (
                    None,
                    "unknown",
                    "unavailable",
                ):
                    try:
                        duration = int(float(duration_state.state))
                    except (ValueError, TypeError):
                        duration = None

                # Log the exercise
                await api.async_log_exercise(
                    exercise_type=exercise_type or "Peloton Workout",
                    duration=duration,
                    calories_burned=calories_burned,
                )

    return async_track_state_change_event(
        hass, [workout_entity_id], _async_peloton_state_change
    )
