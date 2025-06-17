"""Websocket API for Calorie Tracker."""

from __future__ import annotations

from datetime import datetime
import logging

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.const import CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .api import CalorieTrackerAPI
from .const import DAILY_GOAL, DOMAIN, GOAL_WEIGHT, SPOKEN_NAME, STARTING_WEIGHT
from .storage import get_user_profile_map

_LOGGER = logging.getLogger(__name__)


def _get_calorie_tracker_profiles(hass: HomeAssistant) -> list[dict[str, str]]:
    """Return all calorie tracker profiles as a list of dicts with spoken_name, entity_id, and config_entry_id."""
    if DOMAIN not in hass.data or "device_id" not in hass.data[DOMAIN]:
        return []
    device_id = hass.data[DOMAIN]["device_id"]
    entity_registry = er.async_get(hass)
    calorie_tracker_entries = entity_registry.entities.get_entries_for_device_id(
        device_id
    )
    profiles = []
    for entry in calorie_tracker_entries:
        config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
        spoken_name = config_entry.data.get(SPOKEN_NAME, "") if config_entry else ""
        profiles.append(
            {
                "spoken_name": spoken_name,
                "entity_id": entry.entity_id,
                "config_entry_id": entry.config_entry_id,
            }
        )
    return profiles


async def websocket_get_month_data_days(hass: HomeAssistant, connection, msg):
    """Return all days in the given month with data."""
    entity_id = msg["entity_id"]
    year = int(msg["year"])
    month = int(msg["month"])  # 1-based (January=1)

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    # This method should return a set of date strings for the month
    days_with_data = api.get_days_with_data(year, month)
    connection.send_result(msg["id"], {"days": list(days_with_data)})


async def websocket_update_profile(hass: HomeAssistant, connection, msg):
    """Update data in the config_entry or set the default profile for a hass_user."""
    entity_id = msg["entity_id"]
    spoken_name = msg.get(SPOKEN_NAME)
    username = msg.get(CONF_USERNAME)
    daily_goal = msg.get(DAILY_GOAL)
    starting_weight = msg.get(STARTING_WEIGHT)
    goal_weight = msg.get(GOAL_WEIGHT)

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    data = dict(matching_entry.data)
    if spoken_name is not None or daily_goal is not None:
        if spoken_name is not None:
            data[SPOKEN_NAME] = spoken_name
        if daily_goal is not None:
            data[DAILY_GOAL] = daily_goal
        if starting_weight is not None:
            data[STARTING_WEIGHT] = starting_weight
        if goal_weight is not None:
            data[GOAL_WEIGHT] = goal_weight
        hass.config_entries.async_update_entry(
            matching_entry,
            data=data,
            title=spoken_name if spoken_name is not None else matching_entry.title,
        )
        sensor = matching_entry.runtime_data.get("sensor")
        if sensor:
            if spoken_name is not None:
                sensor.update_spoken_name(spoken_name)
            if daily_goal is not None:
                sensor.update_daily_goal(daily_goal)
            if starting_weight is not None:
                sensor.update_starting_weight(starting_weight)
            if goal_weight is not None:
                sensor.update_goal_weight(goal_weight)
    elif username is not None:
        user_profile_map = get_user_profile_map(hass)
        await user_profile_map.async_set(username, matching_entry.entry_id)

    profiles = _get_calorie_tracker_profiles(hass)
    # Remove config_entry_id before sending to frontend
    frontend_profiles = [
        {"entity_id": p["entity_id"], "spoken_name": p["spoken_name"]} for p in profiles
    ]
    connection.send_result(
        msg["id"],
        {
            "success": True,
            "all_profiles": frontend_profiles,
        },
    )


async def websocket_handle_get_user_profile(hass: HomeAssistant, connection, msg):
    """Return the calorie tracker spoken_name for a hass_user."""
    profiles = _get_calorie_tracker_profiles(hass)
    user_id = msg["user_id"]
    user_profile_map = get_user_profile_map(hass)
    default_entry_id = await user_profile_map.async_get(user_id)
    default_profile = None

    if default_entry_id:
        # Find the profile in the profiles list with matching config_entry_id
        for profile in profiles:
            if profile["config_entry_id"] == default_entry_id:
                # Only return entity_id and spoken_name to the frontend
                default_profile = {
                    "entity_id": profile["entity_id"],
                    "spoken_name": profile["spoken_name"],
                }
                break

    # Remove config_entry_id before sending to frontend
    frontend_profiles = [
        {"entity_id": p["entity_id"], "spoken_name": p["spoken_name"]} for p in profiles
    ]

    connection.send_result(
        msg["id"],
        {
            "default_profile": default_profile,
            "all_profiles": frontend_profiles,
        },
    )


async def websocket_update_entry(hass: HomeAssistant, connection, msg):
    """Update a food or exercise log entry by unique ID."""
    entity_id = msg["entity_id"]
    entry_id = msg["entry_id"]
    entry_type = msg["entry_type"]  # "food" or "exercise"
    new_entry = msg["entry"]

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    updated = api.update_entry(entry_type, entry_id, new_entry)
    if updated:
        await api.storage.async_save()
        sensor = matching_entry.runtime_data.get("sensor")
        if sensor:
            await sensor.async_update_calories()
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Entry ID not found")


async def websocket_delete_entry(hass: HomeAssistant, connection, msg):
    """Delete a food or exercise log entry by unique ID."""
    entity_id = msg["entity_id"]
    entry_id = msg["entry_id"]
    entry_type = msg["entry_type"]  # "food" or "exercise"

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    deleted = api.delete_entry(entry_type, entry_id)
    if deleted:
        await api.storage.async_save()
        sensor = matching_entry.runtime_data.get("sensor")
        if sensor:
            await sensor.async_update_calories()
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Entry ID not found")


async def websocket_get_daily_data(hass: HomeAssistant, connection, msg):
    """Return the log and weight for the specified date."""
    entity_id = msg["entity_id"]
    date_str = msg.get("date")
    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return
    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return
    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    log = api.get_log(date_str)
    weight = api.get_weight(date_str)
    connection.send_result(
        msg["id"],
        {
            "food_entries": log["food_entries"],
            "exercise_entries": log["exercise_entries"],
            "weight": weight,
        },
    )


async def websocket_get_weekly_summary(hass: HomeAssistant, connection, msg):
    """Return the weekly summary for the specified date (or today)."""
    entity_id = msg["entity_id"]
    date_str = msg.get("date")
    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return
    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return
    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    summary = api.get_weekly_summary(date_str)
    connection.send_result(msg["id"], {"weekly_summary": summary})


async def websocket_create_entry(hass: HomeAssistant, connection, msg):
    """Create a new food or exercise entry."""
    entity_id = msg["entity_id"]
    entry_type = msg["entry_type"]  # "food" or "exercise"
    entry = msg["entry"]

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    if entry_type == "food":
        await api.async_log_food(
            entry["food_item"],
            entry["calories"],
            datetime.fromisoformat(entry["timestamp"])
            if "timestamp" in entry
            else None,
        )
    elif entry_type == "exercise":
        await api.async_log_exercise(
            exercise_type=entry["exercise_type"],
            duration=entry.get("duration_minutes"),
            calories_burned=entry.get("calories_burned"),
            timestamp=datetime.fromisoformat(entry["timestamp"])
            if "timestamp" in entry
            else None,
        )
    else:
        connection.send_error(msg["id"], "invalid_entry_type", "Invalid entry_type")
        return

    sensor = matching_entry.runtime_data.get("sensor")
    if sensor:
        await sensor.async_update_calories()
    connection.send_result(msg["id"], {"success": True})


async def websocket_log_weight(hass: HomeAssistant, connection, msg):
    """Log or update weight for a specific date (default today)."""
    entity_id = msg["entity_id"]
    weight = msg["weight"]
    date_str = msg.get("date")

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(msg["id"], "not_found", "Entity not found for entity_id")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(
            msg["id"], "not_found", "Config entry not found for entity_id"
        )
        return

    api: CalorieTrackerAPI = matching_entry.runtime_data["api"]
    await api.async_log_weight(weight, date_str)
    sensor = matching_entry.runtime_data.get("sensor")
    if sensor:
        await sensor.async_update_calories()
    connection.send_result(msg["id"], {"success": True})


def register_websockets(hass: HomeAssistant) -> None:
    """Register Calorie Tracker websocket commands."""
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/update_profile",
                "entity_id": str,
                vol.Optional("spoken_name"): str,
                vol.Optional("daily_goal"): int,
                vol.Optional("username"): str,
                vol.Optional("starting_weight"): int,
                vol.Optional("goal_weight"): int,
            }
        )(websocket_api.async_response(websocket_update_profile)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_user_profile",
                "user_id": str,
            }
        )(websocket_api.async_response(websocket_handle_get_user_profile)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/update_entry",
                "entity_id": str,
                "entry_id": str,
                "entry_type": str,
                "entry": dict,
            }
        )(websocket_api.async_response(websocket_update_entry)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/delete_entry",
                "entity_id": str,
                "entry_id": str,
                "entry_type": str,
            }
        )(websocket_api.async_response(websocket_delete_entry)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_daily_data",
                "entity_id": str,
                vol.Optional("date"): str,
            }
        )(websocket_api.async_response(websocket_get_daily_data)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_weekly_summary",
                "entity_id": str,
                vol.Optional("date"): str,
            }
        )(websocket_api.async_response(websocket_get_weekly_summary)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_month_data_days",
                "entity_id": str,
                "year": int,
                "month": int,
            }
        )(websocket_api.async_response(websocket_get_month_data_days)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/create_entry",
                "entity_id": str,
                "entry_type": str,
                "entry": dict,
            }
        )(websocket_api.async_response(websocket_create_entry)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/log_weight",
                "entity_id": str,
                "weight": vol.Coerce(float),
                vol.Optional("date"): str,
            }
        )(websocket_api.async_response(websocket_log_weight)),
    )
