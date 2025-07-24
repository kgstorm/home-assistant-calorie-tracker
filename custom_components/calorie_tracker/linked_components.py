"""Linked component listeners for Calorie Tracker."""

import datetime
import logging

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event
import homeassistant.util.dt as dt_util

from .calorie_tracker_user import CalorieTrackerUser
from .const import (
    DEFAULT_ANTHROPIC_MODEL,
    DEFAULT_AZURE_MODEL,
    DEFAULT_GEMINI_MODEL,
    DEFAULT_OPENAI_MODEL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


async def discover_image_analyzers(hass: HomeAssistant) -> list[dict]:
    """Discover available image analysis integrations."""

    # Known integrations that support image analysis
    known_analyzers = [
        {
            "domain": "openai_conversation",
            "name": "OpenAI Conversation",
            "default_model": DEFAULT_OPENAI_MODEL,
            "setup_url": "https://www.home-assistant.io/integrations/openai_conversation/",
        },
        {
            "domain": "google_generative_ai_conversation",
            "name": "Google Generative AI",
            "default_model": DEFAULT_GEMINI_MODEL,
            "setup_url": "https://www.home-assistant.io/integrations/google_generative_ai_conversation/",
        },
        {
            "domain": "azure_openai_conversation",
            "name": "Azure OpenAI",
            "default_model": DEFAULT_AZURE_MODEL,
            "setup_url": "https://www.home-assistant.io/integrations/azure_openai_conversation/",
        },
        {
            "domain": "ollama",
            "name": "Ollama",
            "default_model": None,
            "setup_url": "https://www.home-assistant.io/integrations/ollama/",
        },
        {
            "domain": "anthropic",
            "name": "Anthropic Claude",
            "default_model": DEFAULT_ANTHROPIC_MODEL,
            "setup_url": "https://www.home-assistant.io/integrations/anthropic/",
        },
    ]

    available_analyzers = []

    for analyzer in known_analyzers:
        domain = analyzer["domain"]

        # Check if integration is loaded and has config entries
        if domain in hass.config.components:
            entries = hass.config_entries.async_entries(domain)
            if entries:
                for entry in entries:
                    # Get model from config entry or use default
                    model = analyzer["default_model"]

                    # Check for non-default model in config entry data
                    if hasattr(entry, "data") and entry.data:
                        match domain:
                            case (
                                "openai_conversation"
                                | "azure_openai_conversation"
                                | "anthropic"
                            ):
                                options = getattr(entry, "options", {}) or {}
                                model = options.get(
                                    "chat_model", analyzer["default_model"]
                                )
                            case "ollama":
                                model = entry.data.get("model")
                            case "google_generative_ai_conversation":
                                options = getattr(entry, "options", {}) or {}
                                model = options.get(
                                    "chat_model", analyzer["default_model"]
                                )
                                _LOGGER.debug("Raw chat_model value: %r", model)
                                model = model.removeprefix("models/")

                    available_analyzers.append(
                        {
                            "domain": domain,
                            "name": analyzer["name"],
                            "setup_url": analyzer["setup_url"],
                            "config_entry": entry.entry_id,
                            "title": entry.title,
                            "available": True,
                            "model": model,
                        }
                    )
                    _LOGGER.info(
                        "Found available image analyzer: %s (entry: %s) with model: %s",
                        analyzer["name"],
                        entry.title,
                        model,
                    )

    # Store available analyzers in hass.data for frontend access
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    hass.data[DOMAIN]["available_image_analyzers"] = available_analyzers

    _LOGGER.info("Discovered %d available image analyzers", len(available_analyzers))
    _LOGGER.debug("Discovered image analyzers: %s", available_analyzers)
    return available_analyzers


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


def _map_peloton_discipline_to_exercise_type(discipline: str) -> str:
    """Map Peloton fitness discipline to exercise type."""
    discipline_mapping = {
        "cycling": "Cycling",
        "running": "Running",
        "walking": "Walking",
        "strength": "Strength Training",
        "yoga": "Yoga",
        "meditation": "Meditation",
        "stretching": "Stretching",
        "cardio": "Cardio",
        "bootcamp": "Bootcamp",
    }

    return discipline_mapping.get(discipline.lower(), "Peloton Workout")


def _extract_calories_from_workout(workout: dict) -> int | None:
    """Extract calories burned from a Peloton workout dict."""
    if performance_graph := workout.get("performance_graph"):
        if summaries := performance_graph.get("summaries"):
            for summary in summaries:
                if summary.get("slug") == "calories":
                    calories = summary.get("value")
                    if calories is not None:
                        try:
                            return int(float(calories))
                        except (ValueError, TypeError):
                            pass
    return None


def _calculate_workout_duration(workout: dict) -> int | None:
    """Calculate workout duration in minutes from start and end times."""
    start_time = workout.get("start_time")
    end_time = workout.get("end_time")

    if not start_time or not end_time:
        return None

    try:
        duration_seconds = end_time - start_time
        return max(1, int(duration_seconds // 60))  # At least 1 minute
    except (ValueError, TypeError):
        return None


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

    async def _async_peloton_state_change(event: Event) -> None:
        """Handle Peloton workout state changes using direct API calls."""
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state is not None and new_state is not None:
            if old_state.state == "on" and new_state.state == "off":
                try:
                    from pylotoncycle import PylotonCycle
                except ImportError:
                    _LOGGER.error("Pylotoncycle package not available")
                    return

                # Get Peloton credentials from the coordinator
                peloton_entry = None
                for entry in hass.config_entries.async_entries("peloton"):
                    if entry.entry_id == linked_entry_id:
                        peloton_entry = entry
                        break

                if not peloton_entry:
                    _LOGGER.warning(
                        "Peloton config entry %s not found", linked_entry_id
                    )
                    return

                username = peloton_entry.data.get("username")
                password = peloton_entry.data.get("password")

                if not username or not password:
                    _LOGGER.warning("Peloton credentials not available")
                    return

                try:
                    # Run PylotonCycle operations in executor to avoid blocking
                    def _get_recent_workouts():
                        """Get recent workouts in executor."""
                        conn = PylotonCycle(username, password)
                        return conn.GetRecentWorkouts(2)

                    # Execute blocking call in thread pool
                    workouts = await hass.async_add_executor_job(_get_recent_workouts)

                    if not workouts:
                        _LOGGER.debug("No recent workouts found")
                        return

                    # Check for completed workouts in the last 2 minutes
                    now = datetime.datetime.now(datetime.UTC)
                    cutoff_time = now - datetime.timedelta(minutes=2)

                    for workout in workouts:
                        # Check if workout is complete and recent
                        if workout.get("status") != "COMPLETE":
                            continue

                        # Get workout end time, or use current time if complete but no end_time
                        end_timestamp = workout.get("end_time")

                        if not end_timestamp:
                            # If workout is COMPLETE but no end_time, assume it just finished
                            _LOGGER.debug(
                                "Workout is COMPLETE but no end_time found, using current time"
                            )
                            end_timestamp = now.timestamp()

                        try:
                            workout_end_time = datetime.datetime.fromtimestamp(
                                end_timestamp, tz=datetime.UTC
                            )
                        except (ValueError, TypeError) as err:
                            _LOGGER.warning(
                                "Failed to parse workout end time %s: %s",
                                end_timestamp,
                                err,
                            )
                            continue

                        _LOGGER.debug(
                            "workout end time: %s. Cutoff: %s",
                            workout_end_time,
                            cutoff_time,
                        )

                        # Skip if workout ended more than 2 minutes ago
                        if workout_end_time < cutoff_time:
                            _LOGGER.debug(
                                "Skipping workout that ended at %s (older than 2 minutes)",
                                workout_end_time,
                            )
                            continue

                        # Extract workout data
                        fitness_discipline = workout.get("fitness_discipline", "")
                        exercise_type = _map_peloton_discipline_to_exercise_type(
                            fitness_discipline
                        )

                        # Extract calories from performance graph
                        calories_burned = _extract_calories_from_workout(workout)

                        # Calculate duration in minutes
                        duration = _calculate_workout_duration(workout)

                        _LOGGER.debug(
                            "Logging Peloton workout: exercise_type=%s, duration=%s, calories_burned=%s, end_time=%s",
                            exercise_type,
                            duration,
                            calories_burned,
                            workout_end_time,
                        )

                        await user.async_log_exercise(
                            exercise_type=exercise_type or "Peloton Workout",
                            tzinfo=dt_util.get_time_zone(hass.config.time_zone),
                            duration=duration,
                            calories_burned=calories_burned,
                        )

                except (ImportError, ValueError, TypeError, RuntimeError) as err:
                    _LOGGER.warning("Failed to fetch Peloton workout data: %s", err)

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
