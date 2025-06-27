"""Linked component listeners for Calorie Tracker."""

from datetime import datetime
import logging

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event

from .api import CalorieTrackerAPI

_LOGGER = logging.getLogger(__name__)


def setup_linked_component_listeners(hass: HomeAssistant, entry, api):
    """Set up all linked component listeners for this Calorie Tracker entry."""

    remove_callbacks = []
    options = entry.options or {}
    linked_profiles = options.get("linked_component_profiles") or options.get(
        "linked_exercise_profiles", {}
    )

    # Setup component listeners and discover new components after Home Assistant is fully started
    # TODO: add the new comonent discovery here
    def _on_ha_started(event):
        _LOGGER.debug(
            "Setting up Peloton listeners for all linked entries on homeassistant_started"
        )
        for domain, entry_ids in linked_profiles.items():
            if domain == "peloton":
                for linked_entry_id in entry_ids:
                    remove_cb = setup_peloton_listener(hass, linked_entry_id, api)
                    remove_callbacks.append(remove_cb)

    hass.bus.async_listen_once("homeassistant_started", _on_ha_started)
    return remove_callbacks


def setup_peloton_listener(
    hass: HomeAssistant, linked_entry_id, api: CalorieTrackerAPI
):
    """Set up a listener for Peloton workout completion."""

    peloton_coordinators = hass.data.get("peloton", {})
    coordinator = peloton_coordinators.get(linked_entry_id)
    if not coordinator:
        _LOGGER.warning(
            "Peloton coordinator for entry %s not found, will retry when available",
            linked_entry_id,
        )
        return False
    user_id = coordinator.data.get("workout_stats_summary", {}).get("user_id")
    if not user_id:
        _LOGGER.warning(
            "Peloton user_id not available in coordinator for entry %s, will retry when available",
            linked_entry_id,
        )
        return False

    first_name = coordinator.data["user_profile"]["first_name"]
    slug = first_name.lower().replace(" ", "_")
    workout_entity_id = f"binary_sensor.{slug}_on_peloton_workout"
    calories_entity_id = f"sensor.{slug}_on_peloton_total_calories"
    start_time_entity_id = f"sensor.{slug}_on_peloton_start_time"
    end_time_entity_id = f"sensor.{slug}_on_peloton_end_time"

    async def _async_peloton_state_change(event: Event) -> None:
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state is not None and new_state is not None:
            if old_state.state == "on" and new_state.state == "off":
                workout_data = dict(new_state.attributes)
                exercise_type = workout_data.get("Workout Type")
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
                # Calculate duration from start and end time sensors
                start_time_state = hass.states.get(start_time_entity_id)
                end_time_state = hass.states.get(end_time_entity_id)
                duration = None
                if (
                    start_time_state
                    and start_time_state.state not in (None, "unknown", "unavailable")
                    and end_time_state
                    and end_time_state.state not in (None, "unknown", "unavailable")
                ):
                    try:
                        start_dt = datetime.fromisoformat(start_time_state.state)
                        end_dt = datetime.fromisoformat(end_time_state.state)
                        duration = int(
                            (end_dt - start_dt).total_seconds() // 60
                        )  # minutes
                    except (ValueError, TypeError):
                        duration = None
                await api.async_log_exercise(
                    exercise_type=exercise_type or "Peloton Workout",
                    duration=duration,
                    calories_burned=calories_burned,
                )

    _LOGGER.warning("Peloton listener set up for: %s", workout_entity_id)
    return async_track_state_change_event(
        hass, [workout_entity_id], _async_peloton_state_change
    )
