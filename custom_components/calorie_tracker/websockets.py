"""Websocket API for Calorie Tracker."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.const import CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    BIRTH_YEAR,
    BODY_FAT_PCT,
    DAILY_GOAL,
    DOMAIN,
    GOAL_WEIGHT,
    HEIGHT,
    HEIGHT_UNIT,
    INCLUDE_EXERCISE_IN_NET,
    SEX,
    SPOKEN_NAME,
    STARTING_WEIGHT,
    WEIGHT_UNIT,
)
from .linked_components import (
    discover_unlinked_peloton_profiles,
    get_linked_component_profiles_display,
    remove_linked_component_profile,
    setup_linked_component_listeners,
)
from .storage import get_user_profile_map

_LOGGER = logging.getLogger(__name__)

STORAGE_DIR = Path.home() / ".homeassistant" / ".storage"


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

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    # This method should return a set of date strings for the month
    days_with_data = user.get_days_with_data(year, month)
    connection.send_result(msg["id"], {"days": list(days_with_data)})


async def websocket_update_profile(hass: HomeAssistant, connection, msg):
    """Update data in the config_entry or set the default profile for a hass_user."""
    entity_id = msg["entity_id"]

    # Extract payload values
    updates = {
        SPOKEN_NAME: msg.get(SPOKEN_NAME),
        DAILY_GOAL: msg.get(DAILY_GOAL),
        STARTING_WEIGHT: msg.get(STARTING_WEIGHT),
        GOAL_WEIGHT: msg.get(GOAL_WEIGHT),
        WEIGHT_UNIT: msg.get(WEIGHT_UNIT),
        INCLUDE_EXERCISE_IN_NET: msg.get(INCLUDE_EXERCISE_IN_NET),
        BIRTH_YEAR: msg.get(BIRTH_YEAR),
        SEX: msg.get(SEX),
        HEIGHT: msg.get(HEIGHT),
        HEIGHT_UNIT: msg.get(HEIGHT_UNIT),
        BODY_FAT_PCT: msg.get(BODY_FAT_PCT),
    }
    username = msg.get(CONF_USERNAME)

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

    data_changed = any(value is not None for key, value in updates.items())

    if data_changed:
        new_data = {
            **matching_entry.data,
            **{k: v for k, v in updates.items() if v is not None},
        }
        hass.config_entries.async_update_entry(
            matching_entry,
            data=new_data,
            title=updates[SPOKEN_NAME]
            if updates[SPOKEN_NAME] is not None
            else matching_entry.title,
        )
        sensor: CalorieTrackerUser | None = matching_entry.runtime_data.get("sensor")  # type: ignore[assignment]
        if sensor:
            user = sensor.user
            # Simple mapping of update handlers
            if updates[SPOKEN_NAME] is not None:
                sensor.update_spoken_name(updates[SPOKEN_NAME])
            if updates[DAILY_GOAL] is not None:
                sensor.update_daily_goal(updates[DAILY_GOAL])
            if updates[STARTING_WEIGHT] is not None:
                sensor.update_starting_weight(updates[STARTING_WEIGHT])
            if updates[GOAL_WEIGHT] is not None:
                sensor.update_goal_weight(updates[GOAL_WEIGHT])
            if updates[WEIGHT_UNIT] is not None:
                sensor.update_weight_unit(updates[WEIGHT_UNIT])
            if updates[INCLUDE_EXERCISE_IN_NET] is not None:
                user.set_include_exercise_in_net(updates[INCLUDE_EXERCISE_IN_NET])
                hass.async_create_task(sensor.async_update_calories())
            if updates[BIRTH_YEAR] is not None:
                user.set_birth_year(updates[BIRTH_YEAR])
            if updates[SEX] is not None:
                user.set_sex(updates[SEX])
            if updates[HEIGHT] is not None:
                user.set_height(updates[HEIGHT])
            if updates[HEIGHT_UNIT] is not None:
                user.set_height_unit(updates[HEIGHT_UNIT])
            if updates[BODY_FAT_PCT] is not None:
                user.set_body_fat_pct(updates[BODY_FAT_PCT])
                await user.async_log_body_fat_pct(updates[BODY_FAT_PCT])

            await sensor.async_update_calories()
    elif username is not None:
        user_profile_map = get_user_profile_map(hass)
        await user_profile_map.async_set(username, matching_entry.entry_id)

    profiles = _get_calorie_tracker_profiles(hass)
    frontend_profiles = [
        {"entity_id": p["entity_id"], "spoken_name": p["spoken_name"]} for p in profiles
    ]
    connection.send_result(
        msg["id"], {"success": True, "all_profiles": frontend_profiles}
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

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    updated = await user.update_entry(entry_type, entry_id, new_entry)
    if updated:
        await user.storage.async_save()
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

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    deleted = await user.delete_entry(entry_type, entry_id)
    if deleted:
        await user.storage.async_save()
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
    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    log = user.get_log(date_str)
    weight = user.get_weight(date_str)
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
    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    summary = user.get_weekly_summary(date_str)
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

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    if entry_type == "food":
        await user.async_log_food(
            entry["food_item"], entry["calories"], entry.get("timestamp")
        )
    elif entry_type == "exercise":
        await user.async_log_exercise(
            exercise_type=entry["exercise_type"],
            duration=entry.get("duration_minutes"),
            calories_burned=entry.get("calories_burned"),
            timestamp=entry.get("timestamp"),
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

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    await user.async_log_weight(weight, date_str)
    sensor = matching_entry.runtime_data.get("sensor")
    if sensor:
        await sensor.async_update_calories()
    connection.send_result(msg["id"], {"success": True})


async def websocket_get_discovered_data(hass: HomeAssistant, connection, msg):
    """Return all discovered data sources and available image analyzers discovered at runtime."""
    calorie_data = hass.data.get("calorie_tracker", {})
    unlinked_profiles = calorie_data.get("unlinked_peloton_profiles", [])
    image_analyzers = calorie_data.get("available_image_analyzers", [])
    connection.send_result(
        msg["id"],
        {
            "discovered_data": unlinked_profiles,
            "image_analyzers": image_analyzers,
        },
    )


async def websocket_link_discovered_components(hass: HomeAssistant, connection, msg):
    """Link discovered component profiles to a calorie tracker profile."""
    calorie_tracker_entity_id = msg["calorie_tracker_entity_id"]
    linked_domain = msg["linked_domain"]
    linked_component_entry_ids = msg["linked_component_entry_ids"]

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(calorie_tracker_entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        _LOGGER.warning("Entity not found for entity_id: %s", calorie_tracker_entity_id)
        connection.send_error(msg["id"], "entity_not_found", "Entity not found")
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        _LOGGER.warning(
            "Config entry not found for entity_id: %s", calorie_tracker_entity_id
        )
        connection.send_error(msg["id"], "entry_not_found", "Config entry not found")
        return

    _LOGGER.debug("Found calorie tracker config entry: %s", matching_entry.entry_id)

    # Get current linked profiles
    current_options = dict(matching_entry.options or {})
    old_linked_profiles = current_options.get("linked_component_profiles", {})
    linked_profiles = dict(old_linked_profiles)  # shallow copy

    if linked_component_entry_ids:
        linked_profiles[linked_domain] = list(linked_component_entry_ids)

    # Assign a new options dict
    new_options = dict(current_options)
    new_options["linked_component_profiles"] = linked_profiles

    hass.config_entries.async_update_entry(matching_entry, options=new_options)

    _LOGGER.debug("Config entry updated successfully")

    user = matching_entry.runtime_data["user"]

    # Setup listeners for the linked components
    setup_linked_component_listeners(hass, matching_entry, user, startup=False)

    # Refresh the unlinked profiles list after linking
    await discover_unlinked_peloton_profiles(hass)

    _LOGGER.debug("Successfully linked components and refreshed discovered data")
    connection.send_result(msg["id"], {"success": True})


async def websocket_unlink_linked_component(hass: HomeAssistant, connection, msg):
    """Unlink a linked device from a calorie tracker profile."""
    calorie_tracker_entity_id = msg["calorie_tracker_entity_id"]
    linked_domain = msg["linked_domain"]
    linked_component_entry_id = msg["linked_component_entry_id"]

    entity_registry = er.async_get(hass)
    entity_entry = entity_registry.entities.get(calorie_tracker_entity_id)
    if not entity_entry or entity_entry.config_entry_id is None:
        connection.send_error(
            msg["id"], "not_found", "Calorie tracker entity not found"
        )
        return

    matching_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not matching_entry:
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    user: CalorieTrackerUser = matching_entry.runtime_data["user"]
    success = remove_linked_component_profile(
        hass, matching_entry, user, linked_domain, linked_component_entry_id
    )
    if success:
        # Refresh the unlinked profiles list after unlinking
        await discover_unlinked_peloton_profiles(hass)
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_result(msg["id"], {"success": False, "error": "Not linked"})


async def websocket_get_linked_components(hass: HomeAssistant, connection, msg):
    """Return user-friendly linked components for a calorie tracker profile."""
    entity_id = msg["entity_id"]
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
    linked_profiles = matching_entry.options.get("linked_component_profiles", {})
    display = get_linked_component_profiles_display(hass, linked_profiles)
    connection.send_result(msg["id"], {"linked_components": display})


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
                vol.Optional("weight_unit"): str,
                vol.Optional("include_exercise_in_net"): bool,
                vol.Optional("birth_year"): int,
                vol.Optional("sex"): str,
                vol.Optional("height"): int,
                vol.Optional("height_unit"): str,
                vol.Optional("body_fat_pct"): vol.Any(int, float),
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
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_discovered_data",
            }
        )(websocket_api.async_response(websocket_get_discovered_data)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/link_discovered_components",
                "calorie_tracker_entity_id": str,
                "linked_domain": str,
                "linked_component_entry_ids": [str],
            }
        )(websocket_api.async_response(websocket_link_discovered_components)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/unlink_linked_component",
                "calorie_tracker_entity_id": str,
                "linked_domain": str,
                "linked_component_entry_id": str,
            }
        )(websocket_api.async_response(websocket_unlink_linked_component)),
    )
    websocket_api.async_register_command(
        hass,
        websocket_api.websocket_command(
            {
                "type": "calorie_tracker/get_linked_components",
                "entity_id": str,
            }
        )(websocket_api.async_response(websocket_get_linked_components)),
    )
