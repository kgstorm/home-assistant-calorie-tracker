"""Storage handler for the Calorie Tracker integration."""

from __future__ import annotations

from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util.hass_dict import HassKey

from .calorie_tracker_user import StorageProtocol
from .const import DOMAIN, USER_PROFILE_MAP_KEY

CALORIE_ENTRIES_PREFIX = "calorie_tracker_"
STORAGE_KEY: HassKey[dict[str, CalorieStorageManager]] = HassKey(f"{DOMAIN}_storage")
STORAGE_VERSION = 1
UNLINKED_EXERCISE_STORAGE_VERSION = 1


class CalorieStorageManager(StorageProtocol):
    """Class to manage persistent storage of calorie, exercise, and weight data for a user."""

    def __init__(self, hass: HomeAssistant, unique_id: str) -> None:
        """Initialize the storage manager.

        Args:
            hass: The Home Assistant instance.
            unique_id: A unique id that will persist even if the user changes their name.

        """
        self._store = Store(
            hass, STORAGE_VERSION, f"{CALORIE_ENTRIES_PREFIX}{unique_id}"
        )
        self._food_entries: list[dict[str, Any]] = []
        self._exercise_entries: list[dict[str, Any]] = []
        self._weights: dict[str, float] = {}
        self._body_fat_pcts: dict[str, float] = {}
        self._goals: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load stored data from disk."""
        data = await self._store.async_load()
        if data is not None:
            self._food_entries = data.get("food_entries", [])
            self._exercise_entries = data.get("exercise_entries", [])
            self._weights = data.get("weights", {})
            self._body_fat_pcts = data.get("body_fat_pcts", {})
            self._goals = data.get("goals", [])

    async def async_save(self) -> None:
        """Persist the current data to disk."""
        await self._store.async_save(
            {
                "food_entries": self._food_entries,
                "exercise_entries": self._exercise_entries,
                "weights": self._weights,
                "body_fat_pcts": self._body_fat_pcts,
                "goals": self._goals,
            }
        )

    async def add_daily_goal(self, date: str, goal_type: str, daily_goal: int) -> None:
        """Add a new daily goal entry with date, goal_type, and daily_goal, and persist it."""
        self._goals.append(
            {"date": date, "goal_type": goal_type, "daily_goal": daily_goal}
        )
        await self.async_save()

    def get_daily_goal(self, date: str) -> dict[str, Any] | None:
        """Get the most recent goal entry on or before the given date, or the earliest goal if date is before any goal."""
        if not self._goals:
            return None
        # Sort by date ascending
        sorted_goals = sorted(self._goals, key=lambda g: g["date"])
        result = None
        for goal in sorted_goals:
            if goal["date"] <= date:
                result = goal
            else:
                break
        if result is not None:
            return result
        # If no goal was set before the date, return the earliest goal
        return sorted_goals[0]

    # Food methods
    def add_food_entry(self, timestamp, food_item: str, calories: int) -> None:
        """Add a new food entry to the in-memory store (timestamp should be local time)."""
        self._food_entries.append(
            {
                "id": uuid.uuid4().hex,
                "timestamp": timestamp,
                "food_item": food_item,
                "calories": calories,
            }
        )

    def get_food_entries(self) -> list[dict[str, Any]]:
        """Return the list of stored calorie entries.

        Returns:
            A list of calorie entry dictionaries.

        """
        return self._food_entries

    def get_exercise_entries(self) -> list[dict[str, Any]]:
        """Return the list of stored exercise entries.

        Returns:
            A list of exercise entry dictionaries.

        """
        return self._exercise_entries

    # Weight methods
    def set_weight(self, date_str: str, weight: float) -> None:
        """Set the weight for a specific date (YYYY-MM-DD).

        Args:
            date_str: The date string.
            weight: The weight value.

        """
        self._weights[date_str] = weight

    def get_weight(self, date_str: str) -> float | None:
        """Get the weight for a specific date (YYYY-MM-DD).

        Args:
            date_str: The date string.

        Returns:
            The weight value or None if not set.

        """
        return self._weights.get(date_str)

    def get_all_weights(self) -> dict[str, float]:
        """Get all weight entries.

        Returns:
            Dictionary mapping date strings to weight values.

        """
        return self._weights.copy()

    def set_body_fat_pct(self, date_str: str, body_fat_pct: float) -> None:
        """Set the body fat percentage for a specific date (YYYY-MM-DD).

        Args:
            date_str: The date string.
            body_fat_pct: The body fat percentage value.

        """
        self._body_fat_pcts[date_str] = body_fat_pct

    def get_body_fat_pct(self, date_str: str) -> float | None:
        """Get the body fat percentage for a specific date (YYYY-MM-DD).

        Args:
            date_str: The date string.

        Returns:
            The body fat percentage value or None if not set.

        """
        return self._body_fat_pcts.get(date_str)

    def get_all_body_fat_pcts(self) -> dict[str, float]:
        """Get all body fat percentage entries.

        Returns:
            Dictionary mapping date strings to body fat percentage values.

        """
        return self._body_fat_pcts.copy()

    def delete_entry(self, entry_type: str, entry_id: str) -> bool:
        """Delete a food or exercise entry by ID.

        Args:
            entry_type: "food" or "exercise"
            entry_id: The unique ID of the entry to delete.

        Returns:
            True if deleted, False if not found.

        """
        entries = None
        if entry_type == "food":
            entries = self._food_entries
        elif entry_type == "exercise":
            entries = self._exercise_entries
        else:
            return False

        for idx, entry in enumerate(entries):
            if entry["id"] == entry_id:
                del entries[idx]
                return True
        return False

    async def async_delete_store(self) -> None:
        """Delete the stored calorie data file from disk."""
        await self._store.async_remove()
        self._food_entries = []
        self._exercise_entries = []
        self._weights = {}
        self._body_fat_pcts = {}
        self._goals = []

    def update_entry(
        self, entry_type: str, entry_id: str, new_entry: dict[str, Any]
    ) -> bool:
        """Update a food or exercise entry by ID.

        Args:
            entry_type: "food" or "exercise"
            entry_id: The unique ID of the entry to update.
            new_entry: The new entry dict (must include all required fields).

        Returns:
            True if updated, False if not found.

        """
        entries = None
        if entry_type == "food":
            entries = self._food_entries
        elif entry_type == "exercise":
            entries = self._exercise_entries
        else:
            return False

        for idx, entry in enumerate(entries):
            if entry["id"] == entry_id:
                entries[idx] = new_entry
                return True
        return False

    def get_days_with_data(self, year: int, month: int) -> set[str]:
        """Return set of YYYY-MM-DD strings for days in the given month with data."""
        days = set()
        for entry in self._food_entries:
            ts = entry["timestamp"]
            # Fast string slicing: "2025-06-11T09:17:13.526445"
            if ts.startswith(f"{year}-{month:02d}-"):
                days.add(ts[:10])
        return days

    async def async_log_weight(self, date_str: str, weight: float) -> None:
        """Asynchronously log a weight entry for a specific date."""
        self.set_weight(date_str, weight)
        await self.async_save()

    async def async_log_body_fat_pct(self, date_str: str, body_fat_pct: float) -> None:
        """Asynchronously log a body fat percentage entry for a specific date."""
        self.set_body_fat_pct(date_str, body_fat_pct)
        await self.async_save()

    async def async_log_exercise(
        self,
        timestamp,
        exercise_type: str,
        duration_minutes: int | None,
        calories_burned: int | None,
    ) -> None:
        """Asynchronously log an exercise entry (timestamp should be local time)."""
        self._exercise_entries.append(
            {
                "id": uuid.uuid4().hex,
                "timestamp": timestamp,
                "exercise_type": exercise_type,
                "duration_minutes": duration_minutes,
                "calories_burned": calories_burned,
            }
        )
        await self.async_save()


class UserProfileMapStorage:
    """Persistent mapping of Home Assistant user_id to calorie tracker entry_id."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the user profile map storage."""
        self._store = Store(hass, STORAGE_VERSION, USER_PROFILE_MAP_KEY)
        self._map: dict[str, str] = {}

    async def async_load(self) -> None:
        """Load the user profile map from disk."""
        data = await self._store.async_load()
        self._map = data or {}

    async def async_save(self) -> None:
        """Persist the user profile map to disk."""
        await self._store.async_save(self._map)

    async def async_get(self, user_id: str) -> str | None:
        """Get the entry_id mapped to a user_id."""
        if not self._map:
            await self.async_load()
        return self._map.get(user_id)

    async def async_set(self, user_id: str, entry_id: str) -> None:
        """Set the entry_id for a user_id and persist."""
        if not self._map:
            await self.async_load()
        self._map[user_id] = entry_id
        await self.async_save()

    async def async_remove(self) -> None:
        """Remove the entire store."""
        await self._store.async_remove()


def get_user_profile_map(hass: HomeAssistant) -> UserProfileMapStorage:
    """Return user profile map."""

    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    if USER_PROFILE_MAP_KEY not in hass.data[DOMAIN]:
        hass.data[DOMAIN][USER_PROFILE_MAP_KEY] = UserProfileMapStorage(hass)
    return hass.data[DOMAIN][USER_PROFILE_MAP_KEY]
