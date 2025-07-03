"""Linked component listeners for Calorie Tracker."""

import asyncio
import datetime
import logging

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event
import homeassistant.util.dt as dt_util

from .calorie_tracker_user import CalorieTrackerUser

_LOGGER = logging.getLogger(__name__)


def _setup_linked_component_listeners_sync(hass: HomeAssistant, entry, user):
    remove_callbacks = []
    options = entry.options or {}
    linked_profiles = options.get("linked_component_profiles") or options.get(
        "linked_exercise_profiles", {}
    )
    for domain, entry_ids in linked_profiles.items():
        if domain == "peloton":
            for linked_entry_id in entry_ids:
                remove_cb = setup_peloton_listener(hass, linked_entry_id, user)
                if remove_cb:
                    remove_callbacks.append(remove_cb)
    return remove_callbacks


def setup_linked_component_listeners(
    hass: HomeAssistant, entry, user, startup: bool = True
):
    """Set up all linked component listeners for this Calorie Tracker entry.

    If startup is True, register listeners for homeassistant_started.
    If startup is False, immediately set up listeners and return remove_callbacks.
    """

    def _on_ha_started(event=None):
        _LOGGER.debug(
            "Setting up Peloton listeners for all linked entries on homeassistant_started"
        )
        remove_callbacks = _setup_linked_component_listeners_sync(hass, entry, user)
        entry.runtime_data["remove_callbacks"] = remove_callbacks

    if startup:
        hass.bus.async_listen_once("homeassistant_started", _on_ha_started)
        return None

    # Remove old callbacks if they exist
    old_callbacks = entry.runtime_data.get("remove_callbacks", [])
    for callback in old_callbacks:
        if callable(callback):
            callback()
    # Immediately set up listeners
    remove_callbacks = _setup_linked_component_listeners_sync(hass, entry, user)
    entry.runtime_data["remove_callbacks"] = remove_callbacks
    return remove_callbacks


def setup_peloton_listener(
    hass: HomeAssistant, linked_entry_id, user: CalorieTrackerUser
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

    # Filter out short exercises that don't get saved (skip if end time > 1 min ago)
    async def _async_peloton_state_change(event: Event) -> None:
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state is not None and new_state is not None:
            if old_state.state == "on" and new_state.state == "off":
                # Wait 45 seconds to allow Peloton integration to sync
                await asyncio.sleep(45)
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
                # Fetch start and end time sensors again after waiting
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
                        start_dt = datetime.datetime.fromisoformat(
                            start_time_state.state
                        )
                        end_dt = datetime.datetime.fromisoformat(end_time_state.state)
                        _LOGGER.debug(
                            "Peloton workout start_time: %s, end_time: %s",
                            start_time_state.state,
                            end_time_state.state,
                        )
                        # If end_time is more than 135 seconds ago (UTC), skip logging
                        now = datetime.datetime.now(datetime.UTC)
                        if (now - end_dt).total_seconds() > 135:
                            _LOGGER.debug(
                                "Skipping Peloton workout: end_time %s is more than 135 seconds ago (now: %s)",
                                end_dt,
                                now,
                            )
                            return
                        duration = int(
                            (end_dt - start_dt).total_seconds() // 60
                        )  # minutes
                        _LOGGER.debug(
                            "Peloton workout duration calculated: %s minutes",
                            duration,
                        )
                    except (ValueError, TypeError) as err:
                        _LOGGER.warning(
                            "Failed to parse Peloton workout times: start=%s, end=%s, error=%s",
                            getattr(start_time_state, "state", None),
                            getattr(end_time_state, "state", None),
                            err,
                        )
                        duration = None
                _LOGGER.debug(
                    "Logging Peloton workout: exercise_type=%s, duration=%s, calories_burned=%s",
                    exercise_type or "Peloton Workout",
                    duration,
                    calories_burned,
                )
                if duration is None:
                    _LOGGER.warning(
                        "Attempting to log Peloton workout with duration=None: start_time=%s, end_time=%s",
                        getattr(start_time_state, "state", None),
                        getattr(end_time_state, "state", None),
                    )
                await user.async_log_exercise(
                    exercise_type=exercise_type or "Peloton Workout",
                    tzinfo=dt_util.get_time_zone(hass.config.time_zone),
                    duration=duration,
                    calories_burned=calories_burned,
                )

    _LOGGER.info("Peloton listener set up for: %s", workout_entity_id)
    return async_track_state_change_event(
        hass, [workout_entity_id], _async_peloton_state_change
    )


async def discover_unlinked_peloton_profiles(hass: HomeAssistant):
    """Discovers unlinked peloton entries."""
    peloton_entries = hass.config_entries.async_entries("peloton")
    calorie_tracker_entries = hass.config_entries.async_entries("calorie_tracker")

    # Collect all linked Peloton entry IDs from all Calorie Tracker profiles
    linked_peloton_entry_ids = set()
    for ct_entry in calorie_tracker_entries:
        linked_profiles = ct_entry.options.get("linked_component_profiles", {})
        peloton_links = linked_profiles.get("peloton", [])
        linked_peloton_entry_ids.update(peloton_links)

    _LOGGER.debug("Found linked Peloton entry IDs: %s", linked_peloton_entry_ids)

    # Find unlinked Peloton entries
    unlinked = [
        {
            "domain": "peloton",
            "entry_id": entry.entry_id,
            "title": entry.title,
            "unique_id": entry.unique_id,
        }
        for entry in peloton_entries
        if entry.entry_id not in linked_peloton_entry_ids
    ]

    _LOGGER.debug(
        "Found %d unlinked Peloton profiles: %s",
        len(unlinked),
        [u["entry_id"] for u in unlinked],
    )

    # Save or expose this list for the UI
    hass.data.setdefault("calorie_tracker", {})["unlinked_peloton_profiles"] = unlinked


def get_linked_component_profiles_display(
    hass: HomeAssistant, linked_profiles: dict
) -> dict:
    """Return a dict mapping domain to list of {linked_domain, linked_component_entry_id, ...} for display."""
    result = {}
    for domain, entry_ids in (linked_profiles or {}).items():
        result[domain] = []
        for entry_id in entry_ids:
            if domain == "peloton":
                peloton_entries = hass.config_entries.async_entries("peloton")
                peloton_entry = next(
                    (e for e in peloton_entries if e.entry_id == entry_id), None
                )
                user_id = None
                title = None
                if peloton_entry:
                    coordinator = hass.data.get("peloton", {}).get(entry_id)
                    if coordinator:
                        user_id = coordinator.data.get("workout_stats_summary", {}).get(
                            "user_id"
                        )
                    title = peloton_entry.title
                result[domain].append(
                    {
                        "linked_domain": "peloton",
                        "linked_component_entry_id": entry_id,
                        "user_id": user_id,
                        "title": title,
                    }
                )
            else:
                entries = hass.config_entries.async_entries(domain)
                entry = next((e for e in entries if e.entry_id == entry_id), None)
                title = entry.title if entry else None
                result[domain].append(
                    {
                        "linked_domain": domain,
                        "linked_component_entry_id": entry_id,
                        "title": title,
                    }
                )
    return result


def remove_linked_component_profile(
    hass: HomeAssistant,
    entry,
    user: CalorieTrackerUser,
    linked_domain: str,
    linked_component_entry_id: str,
) -> bool:
    """Remove a linked component profile from config entry options and reset listeners."""
    options = dict(entry.options or {})
    linked_profiles = dict(options.get("linked_component_profiles", {}))
    entry_ids = list(linked_profiles.get(linked_domain, []))
    if linked_component_entry_id not in entry_ids:
        return False  # Not linked
    entry_ids.remove(linked_component_entry_id)
    if entry_ids:
        linked_profiles[linked_domain] = entry_ids
    else:
        linked_profiles.pop(linked_domain, None)
    options["linked_component_profiles"] = linked_profiles
    hass.config_entries.async_update_entry(entry, options=options)
    # Reset listeners
    setup_linked_component_listeners(hass, entry, user, startup=False)
    return True
