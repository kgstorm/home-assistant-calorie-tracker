"""Event handlers for Calorie Tracker."""

from datetime import datetime

from homeassistant.core import Event, HomeAssistant

from .api import CalorieTrackerAPI
from .const import DOMAIN
from .storage import get_discovered_data_storage


async def handle_exercise_complete(hass: HomeAssistant, event: Event) -> None:
    """Handle exercise_complete event.

    If the exercise profile is linked, log to the user's store.
    Otherwise, log to the unlinked exercise store.
    """
    event_data = event.data
    exercise_entry_id = event_data.get("entry_id")
    exercise_type = event_data.get("type")
    duration_seconds = event_data.get("duration_seconds")
    duration = duration_seconds // 60 if duration_seconds else None
    calories_burned = event_data.get("calories")
    linked_domain = event_data.get("domain")

    linked = False
    for entry in hass.config_entries.async_entries(DOMAIN):
        linked_profiles = entry.options.get("linked_exercise_profiles", [])
        if linked_domain in linked_profiles:
            domain_profiles = linked_profiles[linked_domain]
            if exercise_entry_id in domain_profiles:
                api = entry.runtime_data.get("api")
                if api:
                    await api.async_log_exercise(
                        exercise_type=exercise_type,
                        duration=duration,
                        calories_burned=calories_burned,
                    )
                linked = True
                break

    if not linked:
        discovered_data_storage = get_discovered_data_storage(hass)
        api = CalorieTrackerAPI(
            spoken_name="Unlinked",
            daily_goal=0,
            storage=None,  # No general storage needed for unlinked exercises
            discovered_data_storage=discovered_data_storage,
        )
        event_data["timestamp"] = datetime.now()
        await api.async_log_discovered_data(event_data)
