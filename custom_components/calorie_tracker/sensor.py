"""Sensor platform for the Calorie Tracker integration."""

from __future__ import annotations

from datetime import date
import logging

from homeassistant.components.sensor import RestoreSensor
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import CALORIE_TRACKER_DEVICE_INFO, CalorieTrackerConfigEntry
from .api import CalorieTrackerAPI

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CalorieTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up Calorie Tracker sensors from a config entry."""
    api: CalorieTrackerAPI = entry.runtime_data["api"]
    sensor = CalorieTrackerSensor(api, entry.entry_id)
    entry.runtime_data["sensor"] = sensor
    async_add_entities([sensor])
    await sensor.async_update_calories()


class CalorieTrackerSensor(RestoreSensor):
    """Representation of a Calorie Tracker sensor."""

    _attr_native_unit_of_measurement = "kcal"
    _attr_device_class = None
    _attr_state_class = "measurement"

    def __init__(self, api: CalorieTrackerAPI, entry_id: str) -> None:
        """Initialize the sensor."""
        self.api = api
        self._attr_unique_id = entry_id
        self._attr_device_info = CALORIE_TRACKER_DEVICE_INFO
        self._attr_name = f"Calorie Tracker {self.api.get_spoken_name()}"
        self._attr_native_value = self.api.get_todays_calories()

    @property
    def extra_state_attributes(self) -> dict:
        """Return the state attributes."""
        today = date.today().isoformat()
        return {
            "spoken_name": self.api.get_spoken_name() or None,
            "daily_goal": self.api.get_daily_goal() or None,
            "calories_today": self.api.get_todays_calories(),
            "starting_weight": self.api.get_starting_weight() or None,
            "goal_weight": self.api.get_goal_weight() or None,
            "weight_today": self.api.storage.get_weight(today),
        }

    async def async_update_calories(self) -> None:
        """Force HA to update this entity's state from runtime_data."""
        self._attr_native_value = self.api.get_todays_calories()
        self.async_write_ha_state()

    def update_spoken_name(self, spoken_name: str) -> None:
        """Update the spoken name and entity display name."""
        self.api.set_spoken_name(spoken_name)
        self._attr_name = f"Calorie Tracker {self.api.get_spoken_name()}"
        self.async_write_ha_state()

    def update_daily_goal(self, goal: int) -> None:
        """Update the daily calorie goal."""
        self.api.set_daily_goal(goal)
        self.async_write_ha_state()

    def get_daily_goal(self) -> int | None:
        """Return the daily calorie goal."""
        return self.api.get_daily_goal() or None

    def get_calories_today(self) -> int | None:
        """Return the calories consumed today."""
        return self.api.get_todays_calories() or None

    def update_starting_weight(self, weight: int) -> None:
        """Update the starting weight."""
        self.api.set_starting_weight(weight)
        self.async_write_ha_state()

    def update_goal_weight(self, weight: int) -> None:
        """Update the goal weight."""
        self.api.set_goal_weight(weight)
        self.async_write_ha_state()
