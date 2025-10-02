"""Sensor platform for the Calorie Tracker integration."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.components.sensor import RestoreSensor
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_change

# Compatibility for Home Assistant versions
try:
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
except ImportError:
    # For older HA versions, fallback type annotation
    AddConfigEntryEntitiesCallback = None
import homeassistant.util.dt as dt_util

from . import CALORIE_TRACKER_DEVICE_INFO, CalorieTrackerConfigEntry
from .calorie_tracker_user import CalorieTrackerUser

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CalorieTrackerConfigEntry,
    async_add_entities,
) -> None:
    """Set up Calorie Tracker sensors from a config entry."""
    user: CalorieTrackerUser = entry.runtime_data["user"]
    sensor = CalorieTrackerSensor(user, entry.entry_id)
    # Initialize track_macros flag from config entry options (default False)
    sensor.track_macros = entry.options.get("track_macros", False)
    entry.runtime_data["sensor"] = sensor
    async_add_entities([sensor])
    await sensor.async_update_calories()


class CalorieTrackerSensor(RestoreSensor):
    """Representation of a Calorie Tracker sensor."""

    _attr_native_unit_of_measurement = "kcal"
    _attr_device_class = None
    _attr_state_class = "measurement"

    def __init__(self, user: CalorieTrackerUser, entry_id: str) -> None:
        """Initialize the sensor."""
        self.user = user
        self._entry_id = entry_id
        self._attr_unique_id = entry_id
        self._attr_device_info = CALORIE_TRACKER_DEVICE_INFO
        self._attr_name = f"Calorie Tracker {self.user.get_spoken_name()}"
        self._midnight_unsub = None
        self.track_macros: bool = False

    async def async_added_to_hass(self) -> None:
        """Set up midnight update when sensor is added to Home Assistant."""
        await super().async_added_to_hass()

        # Schedule updates at midnight to refresh "today" data
        self._midnight_unsub = async_track_time_change(
            self.hass, self._handle_midnight_update, hour=0, minute=0, second=0
        )

    async def async_will_remove_from_hass(self) -> None:
        """Clean up when sensor is removed."""
        if self._midnight_unsub:
            self._midnight_unsub()
            self._midnight_unsub = None
        await super().async_will_remove_from_hass()

    @callback
    def _handle_midnight_update(self, now: Any) -> None:
        """Handle midnight update to refresh today's data."""
        _LOGGER.debug("Midnight update triggered, refreshing sensor state")
        self.async_write_ha_state()

    @property
    def native_value(self) -> int:
        """Return the remaining calories for today (non-negative)."""
        return max(0, self.user.calculate_remaining_calories())

    @property
    def extra_state_attributes(self) -> dict:
        """Return the state attributes."""
        # Get today's data
        today_log = self.user.get_log()

        # Get yesterday's data
        yesterday_date = (dt_util.now().date() - timedelta(days=1)).isoformat()
        yesterday_log = self.user.get_log(yesterday_date)

        # Calculate previous 7-day stats
        prev_7days_food = 0
        prev_7days_exercise = 0

        # Optimize: calculate date once outside loop
        today = dt_util.now().date()
        for i in range(1, 8):  # Days -1 to -7 (yesterday through 7 days ago)
            date = (today - timedelta(days=i)).isoformat()
            day_log = self.user.get_log(date)
            day_food, day_exercise = day_log.get("calories", (0, 0))
            prev_7days_food += day_food
            prev_7days_exercise += day_exercise

        # Today's and yesterday's detailed breakdown
        today_food, today_exercise = today_log.get("calories", (0, 0))
        yesterday_food, yesterday_exercise = yesterday_log.get("calories", (0, 0))

        goal = self.user.get_goal()
        # Safely extract goal fields when a goal does not yet exist
        goal_type = goal.get("goal_type") if goal else self.user.get_goal_type()
        goal_start_date = goal.get("start_date") if goal else None
        goal_value = (
            goal.get("goal_value", 0) if goal else getattr(self.user, "_goal_value", 0)
        )

        # Calculate net calories today and remaining calories
        net_calories_today = today_food - today_exercise

        # Calculate daily calorie goal and remaining calories using backend methods
        daily_goal = self.user.calculate_daily_goal_calories()
        calories_remaining_raw = self.user.calculate_remaining_calories()
        calories_remaining_today = max(0, calories_remaining_raw)

        return {
            # User profile data
            "spoken_name": self.user.get_spoken_name(),
            "goal_type": goal_type,
            "goal_start_date": goal_start_date,
            "goal_value": goal_value,
            "daily_goal_calories": daily_goal,
            "starting_weight": self.user.get_starting_weight() or None,
            "goal_weight": self.user.get_goal_weight() or None,
            "current_weight": self.user.get_weight(),
            "weight_unit": self.user.get_weight_unit(),
            "birth_year": self.user.get_birth_year(),
            "sex": self.user.get_sex(),
            "height": self.user.get_height(),
            "height_unit": self.user.get_height_unit(),
            "body_fat_pct": self.user.get_body_fat_pct(),
            "activity_multiplier": self.user.get_neat(),
            "calorie_burn_baseline": self._calculate_bmr_and_neat(),
            # Today's detailed breakdown
            "food_calories_today": today_food,
            "exercise_calories_today": today_exercise,
            "net_calories_today": net_calories_today,
            "calories_remaining_today": calories_remaining_today,
            # Yesterday's detailed breakdown
            "food_calories_yesterday": yesterday_food,
            "exercise_calories_yesterday": yesterday_exercise,
            # Previous 7 days averages (excluding today)
            "food_calories_7day_average": round(prev_7days_food / 7)
            if prev_7days_food
            else 0,
            "exercise_calories_7day_average": round(prev_7days_exercise / 7)
            if prev_7days_exercise
            else 0,
            "track_macros": bool(getattr(self, "track_macros", False)),
        }

    async def async_update_calories(self) -> None:
        """Force HA to update this entity's state from runtime_data."""
        self.async_write_ha_state()

    def _calculate_bmr_and_neat(self) -> float | None:
        """Calculate BMR and NEAT combined (BMR * NEAT multiplier).

        This represents the calories burned from basal metabolic rate plus
        non-exercise activity thermogenesis (daily activities excluding exercise).
        """
        bmr = self.user.calculate_bmr()
        if bmr is None:
            return None
        neat_multiplier = self.user.get_neat()
        return round(bmr * neat_multiplier, 1)

    def update_spoken_name(self, spoken_name: str) -> None:
        """Update the spoken name and entity display name."""
        self.user.set_spoken_name(spoken_name)
        self._attr_name = f"Calorie Tracker {self.user.get_spoken_name()}"
        self.async_write_ha_state()

    def update_starting_weight(self, weight: float) -> None:
        """Update the starting weight."""
        self.user.set_starting_weight(weight)
        self.async_write_ha_state()

    def update_goal_weight(self, weight: float) -> None:
        """Update the goal weight."""
        self.user.set_goal_weight(weight)
        self.async_write_ha_state()

    def update_weight_unit(self, weight_unit: str) -> None:
        """Update the weight unit and refresh state."""
        self.user.update_weight_unit(weight_unit)
        self.async_write_ha_state()

    def update_goal_type(self, goal_type: str) -> None:
        """Update the goal type and refresh state."""
        self.user.set_goal_type(goal_type)
        self.async_write_ha_state()

    async def update_goal(self, goal_value: int, goal_type: str | None = None) -> None:
        """Update the goal and optionally goal type."""
        if goal_type is None:
            # Get current goal_type from user's default or today's goal
            current_goal = self.user.get_goal()
            goal_type = (
                current_goal.get("goal_type")
                if current_goal
                else self.user.get_goal_type()
            )

        await self.user.add_goal(goal_type, goal_value)
        self.async_write_ha_state()
