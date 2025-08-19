"""Linked component listeners for Calorie Tracker."""

import datetime
import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
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


async def setup_linked_component_listeners(
    hass: HomeAssistant, entry, user, startup: bool = True
):
    """Set up all linked component listeners for this Calorie Tracker entry.

    If startup is True, register listeners for homeassistant_started.
    If startup is False, immediately set up listeners and return remove_callbacks.
    """

    _LOGGER.debug(
        "setup_linked_component_listeners called for entry: %s, startup=%s",
        getattr(entry, "entry_id", None),
        startup,
    )

    async def _setup_all_linked_listeners():
        _LOGGER.debug(
            "Setting up Peloton listeners for all linked entries on homeassistant_started"
        )
        remove_callbacks = []
        options = entry.options or {}
        linked_profiles = options.get("linked_component_profiles") or options.get(
            "linked_exercise_profiles", {}
        )
        _LOGGER.debug("linked_profiles: %r", linked_profiles)
        for domain, entry_ids in linked_profiles.items():
            _LOGGER.debug("Processing domain: %s, entry_ids: %r", domain, entry_ids)
            if domain == "peloton":
                for linked_entry_id in entry_ids:
                    _LOGGER.debug(
                        "Setting up peloton listener for linked_entry_id: %s",
                        linked_entry_id,
                    )
                    remove_cb = await setup_peloton_listener(
                        hass, linked_entry_id, user
                    )
                    if remove_cb:
                        remove_callbacks.append(remove_cb)
        entry.runtime_data["remove_callbacks"] = remove_callbacks
        return remove_callbacks

    async def _setup_all_linked_listeners():
        _LOGGER.debug(
            "Setting up Peloton listeners for all linked entries on homeassistant_started"
        )
        remove_callbacks = []
        options = entry.options or {}
        linked_profiles = options.get("linked_component_profiles") or options.get(
            "linked_exercise_profiles", {}
        )
        _LOGGER.debug("linked_profiles: %r", linked_profiles)
        for domain, entry_ids in linked_profiles.items():
            _LOGGER.debug("Processing domain: %s, entry_ids: %r", domain, entry_ids)
            if domain == "peloton":
                for linked_entry_id in entry_ids:
                    _LOGGER.debug(
                        "Setting up peloton listener for linked_entry_id: %s",
                        linked_entry_id,
                    )
                    remove_cb = await setup_peloton_listener(
                        hass, linked_entry_id, user
                    )
                    if remove_cb:
                        remove_callbacks.append(remove_cb)
        entry.runtime_data["remove_callbacks"] = remove_callbacks
        return remove_callbacks

    async def _on_ha_started(event=None):
        await _setup_all_linked_listeners()

    if startup:
        hass.bus.async_listen_once("homeassistant_started", _on_ha_started)
        return None

    # Remove old callbacks if they exist
    old_callbacks = entry.runtime_data.get("remove_callbacks", [])
    for callback in old_callbacks:
        if callable(callback):
            callback()
    # Immediately set up listeners
    return await _setup_all_linked_listeners()


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


async def setup_peloton_listener(
    hass: HomeAssistant, linked_entry_id, user: CalorieTrackerUser
):
    """Set up a polling-based listener for Peloton workout completion."""
    _LOGGER.debug("setup_peloton_listener called for entry: %s", linked_entry_id)

    try:
        from pylotoncycle import PylotonCycle
    except ImportError:
        _LOGGER.error("Pylotoncycle package not available")
        return None

    async def get_latest_peloton_workout(peloton_entry):
        """Fetch the most recent Peloton workout for the given credentials."""

        username = peloton_entry.data.get("username")
        password = peloton_entry.data.get("password")
        if not username or not password:
            _LOGGER.warning("Peloton credentials not available")
            return None

        def _get_latest_workout():
            conn = PylotonCycle(username, password)
            workouts = conn.GetRecentWorkouts(1)
            return workouts[0] if workouts else None

        return await hass.async_add_executor_job(_get_latest_workout)

    peloton_coordinators = hass.data.get("peloton", {})
    coordinator = peloton_coordinators.get(linked_entry_id)
    if not coordinator:
        _LOGGER.warning(
            "Peloton coordinator for entry %s not found, will retry when available",
            linked_entry_id,
        )
        return False
    _LOGGER.debug("Peloton coordinator found for entry: %s", linked_entry_id)
    user_id = coordinator.data.get("workout_stats_summary", {}).get("user_id")
    if not user_id:
        _LOGGER.warning(
            "Peloton user_id not available in coordinator for entry %s, will retry when available",
            linked_entry_id,
        )
        return False
    _LOGGER.debug("Peloton user_id found for entry: %s", linked_entry_id)

    # Store last logged workout ID, initializing to most recent COMPLETE workout if available
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    last_logged_key = f"last_logged_peloton_{linked_entry_id}"

    # Fetch the most recent workout to determine if it is COMPLETE
    peloton_entry = None
    for entry in hass.config_entries.async_entries("peloton"):
        if entry.entry_id == linked_entry_id:
            peloton_entry = entry
            break
    if peloton_entry:
        workout = await get_latest_peloton_workout(peloton_entry)
        if workout and workout.get("status") == "COMPLETE":
            last_logged_id = workout.get("id")
        else:
            last_logged_id = None
        hass.data[DOMAIN][last_logged_key] = last_logged_id
        _LOGGER.debug("Initialized %s to %s", last_logged_key, last_logged_id)
    else:
        hass.data[DOMAIN][last_logged_key] = None

    async def poll_latest_workout(now, peloton_entry=peloton_entry):
        _LOGGER.debug(
            "poll_latest_workout called for entry: %s at %s",
            linked_entry_id,
            dt_util.now(),
        )

        if not peloton_entry:
            _LOGGER.warning("Peloton config entry %s not found", linked_entry_id)
            return

        workout = await get_latest_peloton_workout(peloton_entry)
        if not workout:
            _LOGGER.debug("No recent workouts found")
            return

        workout_id = workout.get("id")
        status = workout.get("status")
        _LOGGER.debug("Polled Peloton workout: id=%s, status=%s", workout_id, status)

        # Only log if workout is COMPLETE and not already logged
        last_logged_id = hass.data[DOMAIN][last_logged_key]
        if status != "COMPLETE":
            _LOGGER.debug("Workout %s not complete, skipping", workout_id)
            return
        if last_logged_id == workout_id:
            _LOGGER.debug("Workout %s already logged, skipping", workout_id)
            return

        # Extract workout data
        fitness_discipline = workout.get("fitness_discipline", "")
        exercise_type = _map_peloton_discipline_to_exercise_type(fitness_discipline)
        calories_burned = _extract_calories_from_workout(workout)
        duration = _calculate_workout_duration(workout)
        # Use local time for timestamp
        workout_end_local = dt_util.now().replace(second=0, microsecond=0, tzinfo=None)
        timestamp_str = workout_end_local.isoformat(timespec="minutes")

        _LOGGER.info(
            "Logging Peloton workout: id=%s, exercise_type=%s, duration=%s, calories_burned=%s, timestamp=%s",
            workout_id,
            exercise_type,
            duration,
            calories_burned,
            timestamp_str,
        )
        await user.async_log_exercise(
            exercise_type=exercise_type or "Peloton Workout",
            duration=duration,
            calories_burned=calories_burned,
            timestamp=timestamp_str,
        )
        # Update last logged workout ID
        hass.data[DOMAIN][last_logged_key] = workout_id

    # Register polling every 90 seconds

    _LOGGER.debug("Registering poll_latest_workout for entry: %s", linked_entry_id)

    # Use a sync callback to schedule the async poll_latest_workout safely from any thread
    def _poll_latest_workout_callback(now):
        hass.add_job(poll_latest_workout(now, peloton_entry))

    remove_cb = async_track_time_interval(
        hass,
        _poll_latest_workout_callback,
        datetime.timedelta(seconds=90),
    )
    _LOGGER.info("Peloton polling listener set up for entry: %s", linked_entry_id)
    return remove_cb


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


async def remove_linked_component_profile(
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
    await setup_linked_component_listeners(hass, entry, user, startup=False)
    return True
