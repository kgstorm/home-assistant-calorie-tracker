"""Sensor platform for the Calorie Tracker integration."""

from __future__ import annotations

import logging

from homeassistant.components.sensor import RestoreSensor
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
import homeassistant.util.dt as dt_util

from . import CALORIE_TRACKER_DEVICE_INFO, CalorieTrackerConfigEntry
from .calorie_tracker_user import CalorieTrackerUser

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CalorieTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up Calorie Tracker sensors from a config entry."""
    user: CalorieTrackerUser = entry.runtime_data["user"]
    tz = dt_util.get_time_zone(hass.config.time_zone)
    sensor = CalorieTrackerSensor(user, entry.entry_id, tz)
    entry.runtime_data["sensor"] = sensor
    async_add_entities([sensor])
    await sensor.async_update_calories()


class CalorieTrackerSensor(RestoreSensor):
    """Representation of a Calorie Tracker sensor."""

    _attr_native_unit_of_measurement = "kcal"
    _attr_device_class = None
    _attr_state_class = "measurement"

    def __init__(self, user: CalorieTrackerUser, entry_id: str, tzinfo) -> None:
        """Initialize the sensor."""
        self.user = user
        self.tzinfo = tzinfo
        self._attr_unique_id = entry_id
        self._attr_device_info = CALORIE_TRACKER_DEVICE_INFO
        self._attr_name = f"Calorie Tracker {self.user.get_spoken_name()}"
        self._attr_native_value = self.user.get_todays_calories(self.tzinfo)

    @property
    def extra_state_attributes(self) -> dict:
        """Return the state attributes."""
        today = dt_util.now(self.tzinfo).date().isoformat()
        return {
            "spoken_name": self.user.get_spoken_name(),
            "daily_goal": self.user.get_daily_goal(),
            "calories_today": self.user.get_todays_calories(self.tzinfo),
            "starting_weight": self.user.get_starting_weight() or None,
            "goal_weight": self.user.get_goal_weight() or None,
            "weight_today": self.user.storage.get_weight(today),
            "weight_unit": self.user.get_weight_unit(),
        }

    async def async_update_calories(self) -> None:
        """Force HA to update this entity's state from runtime_data."""
        self._attr_native_value = self.user.get_todays_calories(self.tzinfo)
        self.async_write_ha_state()

    def update_spoken_name(self, spoken_name: str) -> None:
        """Update the spoken name and entity display name."""
        self.user.set_spoken_name(spoken_name)
        self._attr_name = f"Calorie Tracker {self.user.get_spoken_name()}"
        self.async_write_ha_state()

    def update_daily_goal(self, goal: int) -> None:
        """Update the daily calorie goal."""
        self.user.set_daily_goal(goal)
        self.async_write_ha_state()

    def get_daily_goal(self) -> int | None:
        """Return the daily calorie goal."""
        return self.user.get_daily_goal() or None

    def get_calories_today(self) -> int | None:
        """Return the calories consumed today."""
        return self.user.get_todays_calories(self.tzinfo) or None

    def update_starting_weight(self, weight: int) -> None:
        """Update the starting weight."""
        self.user.set_starting_weight(weight)
        self.async_write_ha_state()

    def update_goal_weight(self, weight: int) -> None:
        """Update the goal weight."""
        self.user.set_goal_weight(weight)
        self.async_write_ha_state()

    def update_weight_unit(self, weight_unit: str) -> None:
        """Update the weight unit and refresh state."""
        self.user.update_weight_unit(weight_unit)
        self.async_write_ha_state()
