"""API for the Calorie Tracker Home Assistant Integration."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any, Protocol


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


class DiscoveredDataStorageProtocol(Protocol):
    """Protocol defining the interface for handling unlinked exercises."""

    async def async_log_discovered_data(self, event_data: dict[str, Any]) -> None:
        """Log an unlinked exercise event."""
        raise NotImplementedError

    async def async_load(self) -> None:
        """Asynchronously load unlinked exercise data from persistent storage."""
        raise NotImplementedError

    async def async_save(self) -> None:
        """Asynchronously persist unlinked exercise data to storage."""
        raise NotImplementedError

    def get_discovered_data(self) -> list[dict[str, Any]]:
        """Return the list of unlinked exercise entries."""
        raise NotImplementedError


class CalorieTrackerAPI:
    """Calorie Tracker core logic."""

    def __init__(
        self,
        spoken_name: str,
        daily_goal: int,
        storage: StorageProtocol,
        discovered_data_storage: DiscoveredDataStorageProtocol,
        starting_weight: int = 0,
        goal_weight: int = 0,
    ) -> None:
        """Initialize the Calorie Tracker API."""
        self._storage = storage
        self._discovered_data_storage = discovered_data_storage
        self._spoken_name = spoken_name
        self._daily_goal = daily_goal
        self._starting_weight = starting_weight
        self._goal_weight = goal_weight

    @property
    def storage(self) -> StorageProtocol:
        """Return the storage backend."""
        return self._storage

    async def async_initialize(self) -> None:
        """Asynchronously initialize the API and load storage."""
        await self._storage.async_load()

    def get_spoken_name(self) -> str:
        """Return the spoken name."""
        return self._spoken_name

    def set_spoken_name(self, spoken_name: str) -> None:
        """Set the spoken name."""
        self._spoken_name = spoken_name

    def get_daily_goal(self) -> int:
        """Return the daily calorie goal."""
        return self._daily_goal

    def set_daily_goal(self, goal: int) -> None:
        """Set the daily calorie goal."""
        self._daily_goal = goal

    def get_todays_calories(self) -> int:
        """Return the net calories (food - exercise) for today."""
        today = date.today()
        food = sum(
            entry["calories"]
            for entry in self._storage.get_food_entries()
            if datetime.fromisoformat(entry["timestamp"]).date() == today
        )
        exercise = sum(
            entry.get("calories_burned", 0)
            for entry in self._storage.get_exercise_entries()
            if datetime.fromisoformat(entry["timestamp"]).date() == today
        )
        return max(food - exercise, 0)

    def get_remaining(self) -> int:
        """Return the number of remaining calories for the day."""
        return self._daily_goal - self.get_todays_calories()

    def get_log(self, date_str: str | None = None) -> dict[str, Any]:
        """Return the food, exercise, and weight log for the specified date, or today if not specified."""
        target_date = (
            datetime.fromisoformat(date_str).date() if date_str else date.today()
        )
        date_iso = target_date.isoformat()
        food_entries = [
            entry
            for entry in self._storage.get_food_entries()
            if datetime.fromisoformat(entry["timestamp"]).date() == target_date
        ]
        exercise_entries = [
            entry
            for entry in self._storage.get_exercise_entries()
            if datetime.fromisoformat(entry["timestamp"]).date() == target_date
        ]
        weight = self._storage.get_weight(date_iso)
        # Add net_calories to the log for frontend use
        food = sum(e["calories"] for e in food_entries)
        exercise = sum(e.get("calories_burned", 0) for e in exercise_entries)
        net_calories = food - exercise
        return {
            "food_entries": food_entries,
            "exercise_entries": exercise_entries,
            "weight": weight,
            "net_calories": net_calories,
        }

    def get_weekly_summary(self, date_str: str | None = None) -> dict[str, int]:
        """Return the weekly summary (net calories) for the week containing the specified date, or today if not specified."""
        target_date = (
            datetime.fromisoformat(date_str).date() if date_str else date.today()
        )
        days_since_sunday = (target_date.weekday() + 1) % 7
        sunday = target_date - timedelta(days=days_since_sunday)
        week_dates = [sunday + timedelta(days=i) for i in range(7)]
        summary: dict[str, int] = {d.isoformat(): 0 for d in week_dates}
        # Precompute food and exercise per day
        food_by_day: dict[str, int] = {}
        for entry in self._storage.get_food_entries():
            entry_date = datetime.fromisoformat(entry["timestamp"]).date()
            if sunday <= entry_date <= sunday + timedelta(days=6):
                food_by_day.setdefault(entry_date.isoformat(), 0)
                food_by_day[entry_date.isoformat()] += entry["calories"]
        exercise_by_day: dict[str, int] = {}
        for entry in self._storage.get_exercise_entries():
            entry_date = datetime.fromisoformat(entry["timestamp"]).date()
            if sunday <= entry_date <= sunday + timedelta(days=6):
                exercise_by_day.setdefault(entry_date.isoformat(), 0)
                exercise_by_day[entry_date.isoformat()] += entry.get(
                    "calories_burned", 0
                )
        for d in week_dates:
            date_str = d.isoformat()
            food = food_by_day.get(date_str, 0)
            exercise = exercise_by_day.get(date_str, 0)
            summary[date_str] = food - exercise
        return summary

    def update_entry(
        self, entry_type: str, entry_id: str, new_entry: dict[str, Any]
    ) -> bool:
        """Update a food or exercise entry by its unique ID."""
        return self._storage.update_entry(entry_type, entry_id, new_entry)

    def get_starting_weight(self) -> int:
        """Return the starting weight."""
        return self._starting_weight

    def set_starting_weight(self, weight: int) -> None:
        """Set the starting weight."""
        self._starting_weight = weight

    def get_goal_weight(self) -> int:
        """Return the goal weight."""
        return self._goal_weight

    def set_goal_weight(self, weight: int) -> None:
        """Set the goal weight."""
        self._goal_weight = weight

    async def async_log_food(
        self, food_item: str, calories: int, timestamp: datetime | None = None
    ) -> None:
        """Asynchronously log a food entry and persist it.

        Args:
            food_item: The name of the food item.
            calories: The number of calories.
            timestamp: The datetime of the entry (defaults to now if not provided).

        """
        if timestamp is None:
            timestamp = datetime.now()
        self._storage.add_food_entry(timestamp, food_item, calories)
        await self._storage.async_save()

    async def async_log_weight(
        self, weight: float, date_str: str | None = None
    ) -> None:
        """Asynchronously log a weight entry for a specific date (defaults to today)."""
        if date_str is None:
            date_str = date.today().isoformat()
        await self._storage.async_log_weight(date_str, weight)

    async def async_log_exercise(
        self,
        exercise_type: str,
        duration: int | None = None,
        calories_burned: int | None = None,
        timestamp: datetime | None = None,
    ) -> None:
        """Asynchronously log an exercise entry."""
        if timestamp is None:
            timestamp = datetime.now()
        await self._storage.async_log_exercise(
            timestamp, exercise_type, duration, calories_burned
        )

    def get_days_with_data(self, year: int, month: int) -> set[str]:
        """Return set of YYYY-MM-DD strings for days in the given month with data."""
        return self._storage.get_days_with_data(year, month)

    def delete_entry(self, entry_type: str, entry_id: str) -> bool:
        """Delete a food or exercise entry by its unique ID."""
        return self._storage.delete_entry(entry_type, entry_id)

    def get_weight(self, date_str: str | None = None) -> float | None:
        """Return the weight for the specified date, or today if not specified."""
        target_date = (
            datetime.fromisoformat(date_str).date() if date_str else date.today()
        )
        return self._storage.get_weight(target_date.isoformat())

    async def async_log_discovered_data(self, event_data: dict[str, Any]) -> None:
        """Log an unlinked exercise event."""
        await self._discovered_data_storage.async_log_discovered_data(event_data)
