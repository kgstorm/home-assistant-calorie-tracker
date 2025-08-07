"""User profile logic for the Calorie Tracker Home Assistant Integration."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Protocol

import homeassistant.util.dt as dt_util

_LOGGER = logging.getLogger(__name__)


def _normalize_local_timestamp(ts: datetime | str | None = None) -> str:
    """Return a local timestamp string (YYYY-MM-DDTHH:MM)."""
    if ts is None:
        dt = dt_util.now()
    elif isinstance(ts, str):
        dt = dt_util.parse_datetime(ts)
        if dt is None:
            dt = dt_util.now()
    elif isinstance(ts, datetime):
        dt = ts
    else:
        raise ValueError("Invalid timestamp type")
    dt = dt.replace(second=0, microsecond=0, tzinfo=None)
    result = dt.isoformat(timespec="minutes")

    return result


class StorageProtocol(Protocol):
    """Protocol defining the storage interface for calorie, exercise, and weight entries."""

    async def async_load(self) -> None:
        """Asynchronously load stored data from persistent storage."""
        raise NotImplementedError

    async def async_save(self) -> None:
        """Asynchronously persist the current data to persistent storage."""
        raise NotImplementedError

    def get_food_entries(self) -> list[dict[str, Any]]:
        """Return the list of stored food entries."""
        raise NotImplementedError

    def get_exercise_entries(self) -> list[dict[str, Any]]:
        """Return the list of stored exercise entries."""
        raise NotImplementedError

    def get_weight(self, date_str: str) -> float | None:
        """Get the weight for a specific date (YYYY-MM-DD)."""
        raise NotImplementedError

    def update_entry(
        self, entry_type: str, entry_id: str, new_entry: dict[str, Any]
    ) -> bool:
        """Update a food or exercise entry by ID."""
        raise NotImplementedError


class CalorieTrackerUser:
    """Calorie Tracker user profile logic."""

    def __init__(
        self,
        spoken_name: str,
        daily_goal: int,
        storage: StorageProtocol,
        starting_weight: int,
        goal_weight: int,
        weight_unit: str,
    ) -> None:
        """Initialize the Calorie Tracker user profile."""
        self._storage = storage
        self._spoken_name = spoken_name
        self._daily_goal = daily_goal
        self._starting_weight = starting_weight
        self._goal_weight = goal_weight
        self._weight_unit = weight_unit

    @property
    def storage(self) -> StorageProtocol:
        """Return the storage backend."""
        return self._storage

    async def async_initialize(self) -> None:
        """Asynchronously initialize the user and load storage."""
        await self._storage.async_load()

    def get_spoken_name(self) -> str:
        """Return the spoken name."""
        return self._spoken_name

    def set_spoken_name(self, spoken_name: str) -> None:
        """Set the spoken name."""
        self._spoken_name = spoken_name

    def get_daily_goal(self) -> int:
        """Return the daily calorie goal."""
        return self._daily_goal if self._daily_goal is not None else 2000

    def set_daily_goal(self, goal: int) -> None:
        """Set the daily calorie goal."""
        self._daily_goal = goal

    def get_log(self, date_str: str | None = None) -> dict[str, Any]:
        """Return the food, exercise, and weight log for the specified date, or today if not specified."""
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        date_iso = target_date.isoformat()

        food_entries = [
            entry
            for entry in self._storage.get_food_entries()
            if dt_util.parse_datetime(entry["timestamp"]).date() == target_date
        ]
        exercise_entries = [
            entry
            for entry in self._storage.get_exercise_entries()
            if dt_util.parse_datetime(entry["timestamp"]).date() == target_date
        ]

        weight = self._storage.get_weight(date_iso)
        food = sum(e.get("calories", 0) or 0 for e in food_entries)
        exercise = sum(e.get("calories_burned", 0) or 0 for e in exercise_entries)

        return {
            "food_entries": food_entries,
            "exercise_entries": exercise_entries,
            "weight": weight,
            "calories": (food, exercise),
            "net_calories": food - exercise,
        }

    def get_weekly_summary(
        self, date_str: str | None = None
    ) -> dict[str, tuple[int, int]]:
        """Return the weekly summary (food, exercise) for the week containing the specified date, or today if not specified."""
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        days_since_sunday = (target_date.weekday() + 1) % 7
        sunday = target_date - timedelta(days=days_since_sunday)
        week_dates = [sunday + timedelta(days=i) for i in range(7)]
        summary: dict[str, tuple[int, int]] = {}
        food_by_day: dict[str, int] = {d.isoformat(): 0 for d in week_dates}
        exercise_by_day: dict[str, int] = {d.isoformat(): 0 for d in week_dates}

        for entry in self._storage.get_food_entries():
            entry_date = dt_util.parse_datetime(entry["timestamp"]).date()
            entry_iso = entry_date.isoformat()
            if entry_iso in food_by_day:
                food_by_day[entry_iso] += entry.get("calories", 0) or 0

        for entry in self._storage.get_exercise_entries():
            entry_date = dt_util.parse_datetime(entry["timestamp"]).date()
            entry_iso = entry_date.isoformat()
            if entry_iso in exercise_by_day:
                exercise_by_day[entry_iso] += entry.get("calories_burned", 0) or 0

        for d in week_dates:
            date_iso = d.isoformat()
            food = food_by_day[date_iso]
            exercise = exercise_by_day[date_iso]
            summary[date_iso] = (food, exercise)

        return summary

    async def async_log_food(
        self, food_item: str, calories: int, timestamp: str | None = None
    ) -> None:
        """Asynchronously log a food entry and persist it."""
        ts = _normalize_local_timestamp(timestamp)
        self._storage.add_food_entry(ts, food_item, calories)
        await self._storage.async_save()

    async def async_log_weight(
        self, weight: float, date_str: str | None = None
    ) -> None:
        """Asynchronously log a weight entry for a specific date (defaults to today)."""
        if date_str is None:
            date_str = dt_util.now().date().isoformat()
        elif "T" in date_str:
            date_str = date_str.split("T")[0]
        await self._storage.async_log_weight(date_str, weight)

    async def async_log_exercise(
        self,
        exercise_type: str,
        duration: int | None = None,
        calories_burned: int | None = None,
        timestamp: str | None = None,
    ) -> None:
        """Asynchronously log an exercise entry."""
        ts = _normalize_local_timestamp(timestamp)
        await self._storage.async_log_exercise(
            ts, exercise_type, duration, calories_burned
        )

    def get_days_with_data(self, year: int, month: int) -> set[str]:
        """Return set of YYYY-MM-DD strings for days in the given month with data."""
        return self._storage.get_days_with_data(year, month)

    def get_weight(self, date_str: str | None = None) -> float | None:
        """Return the weight for the specified date, or today if not specified."""
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        return self._storage.get_weight(target_date.isoformat())

    def get_starting_weight(self) -> int | None:
        """Return the starting weight."""
        return self._starting_weight or None

    def set_starting_weight(self, weight: int) -> None:
        """Set the starting weight."""
        self._starting_weight = weight

    def get_goal_weight(self) -> int | None:
        """Return the goal weight."""
        return self._goal_weight or None

    def set_goal_weight(self, weight: int) -> None:
        """Set the goal weight."""
        self._goal_weight = weight

    def get_weight_unit(self) -> str:
        """Return the weight unit (kg or lbs)."""
        return self._weight_unit or "lbs"

    def update_weight_unit(self, weight_unit: str) -> None:
        """Update the weight unit (kg or lbs)."""
        self._weight_unit = weight_unit

    async def delete_entry(self, entry_type: str, entry_id: str) -> bool:
        """Delete a food or exercise entry by ID and persist the change."""
        deleted = self._storage.delete_entry(entry_type, entry_id)
        if deleted:
            await self._storage.async_save()
        return deleted

    async def update_entry(
        self, entry_type: str, entry_id: str, new_entry: dict[str, Any]
    ) -> bool:
        """Update a food or exercise entry by ID and persist the change."""
        updated = self._storage.update_entry(entry_type, entry_id, new_entry)
        if updated:
            await self._storage.async_save()
        return updated
