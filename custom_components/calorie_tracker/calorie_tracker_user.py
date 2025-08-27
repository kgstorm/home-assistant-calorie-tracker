"""User profile logic for the Calorie Tracker Home Assistant Integration."""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
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
    return dt.isoformat(timespec="minutes")


class StorageProtocol(Protocol):
    """Protocol defining the storage interface for calorie, exercise, and weight entries."""

    async def async_load(self) -> None:
        """Asynchronously load stored data from persistent storage."""
        raise NotImplementedError

    async def async_save(self) -> None:
        """Asynchronously persist the current data to persistent storage."""
        raise NotImplementedError

    async def add_daily_goal(self, date: str, goal_type: str, daily_goal: int) -> None:
        """Add a new daily goal entry and persist it."""
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

    def get_all_weights(self) -> dict[str, float]:
        """Get all weight entries."""
        raise NotImplementedError

    def get_body_fat_pct(self, date_str: str) -> float | None:
        """Get the body fat percentage for a specific date (YYYY-MM-DD)."""
        raise NotImplementedError

    def get_all_body_fat_pcts(self) -> dict[str, float]:
        """Get all body fat percentage entries."""
        raise NotImplementedError

    async def async_log_body_fat_pct(self, date_str: str, body_fat_pct: float) -> None:
        """Asynchronously log a body fat percentage entry for a specific date."""
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
        goal_type: str | None = None,
        birth_year: int | None = None,
        sex: str | None = None,
        height: int | None = None,
        height_unit: str = "cm",
        body_fat_pct: float | None = None,
        neat: float = 1.2,
    ) -> None:
        """Initialize the Calorie Tracker user profile."""
        self._storage = storage
        self._spoken_name = spoken_name
        self._daily_goal = daily_goal
        self._starting_weight = starting_weight
        self._goal_weight = goal_weight
        self._weight_unit = weight_unit
        self._goal_type = goal_type
        self._birth_year = birth_year
        self._sex = sex
        self._height = height
        self._height_unit = height_unit
        self._body_fat_pct = body_fat_pct
        self._neat = neat

    def get_daily_goal(self, date_str: str | None = None) -> dict[str, any] | None:
        """Get the goal for a given date (or today if not specified)."""
        if date_str is None:
            date_str = dt_util.now().date().isoformat()
        return self._storage.get_daily_goal(date_str)

    async def add_daily_goal(
        self, goal_type: str, daily_goal: int, date_str: str | None = None
    ) -> None:
        """Set a new goal for a given date (or today if not specified), and persist it."""
        if date_str is None:
            date_str = dt_util.now().date().isoformat()
        await self._storage.add_daily_goal(date_str, goal_type, daily_goal)

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

    def get_log(self, date_str: str | None = None) -> dict[str, Any]:
        """Return the food, exercise, and weight log for the specified date, or today if not specified."""
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )

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

        weight = self.get_weight(date_str)
        body_fat_pct = self.get_body_fat_pct(date_str)
        food = sum(e.get("calories", 0) or 0 for e in food_entries)
        exercise = sum(e.get("calories_burned", 0) or 0 for e in exercise_entries)

        return {
            "food_entries": food_entries,
            "exercise_entries": exercise_entries,
            "weight": weight,
            "body_fat_pct": body_fat_pct,
            "calories": (food, exercise),
        }

    def get_weekly_summary(
        self, date_str: str | None = None
    ) -> dict[str, tuple[int, int, float, int, str, float]]:
        """Return the weekly summary (food, exercise, bmr_and_neat, daily_goal, goal_type, weight)."""
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        days_since_sunday = (target_date.weekday() + 1) % 7
        sunday = target_date - timedelta(days=days_since_sunday)
        week_dates = [sunday + timedelta(days=i) for i in range(7)]
        summary: dict[str, tuple[int, int, float, int, str, float]] = {}
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
            bmr = self.calculate_bmr(date_iso) or 0.0
            bmr_and_neat = (bmr * self._neat) if bmr else 0.0
            daily_goal = self.get_daily_goal(date_iso).get("daily_goal", 0)
            goal_type = self.get_daily_goal(date_iso).get("goal_type", "Not Found")
            weight = self.get_weight(date_iso) or 0.0
            summary[date_iso] = (food, exercise, bmr_and_neat, daily_goal, goal_type, weight)

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

    async def async_log_body_fat_pct(
        self, body_fat_pct: float, date_str: str | None = None
    ) -> None:
        """Asynchronously log a body fat percentage entry for a specific date (defaults to today)."""
        if date_str is None:
            date_str = dt_util.now().date().isoformat()
        elif "T" in date_str:
            date_str = date_str.split("T")[0]
        await self._storage.async_log_body_fat_pct(date_str, body_fat_pct)

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
        """Return the weight for the specified date, with fallback logic.

        If no weight is found for the date:
        1. Look for the most recent weight before this date
        2. If none found before, use the earliest weight after this date
        3. If no logged weights exist, fall back to profile starting weight
        """
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        target_iso = target_date.isoformat()

        # Check exact date first
        weight = self._storage.get_weight(target_iso)
        if weight is not None:
            return weight

        # Get all weight entries and sort them
        all_entries = []
        storage_data = self._storage.get_all_weights()
        for date_key, weight_val in storage_data.items():
            try:
                entry_date = dt_util.parse_datetime(date_key).date()
                all_entries.append((entry_date, weight_val))
            except (ValueError, AttributeError):
                continue

        if not all_entries:
            return self._starting_weight

        all_entries.sort(key=lambda x: x[0])

        # Find the most recent entry before target date
        most_recent_before = None
        for entry_date, weight_val in all_entries:
            if entry_date <= target_date:
                most_recent_before = weight_val
            else:
                break

        if most_recent_before is not None:
            return most_recent_before

        # If no entry before target date, use the earliest entry after
        return all_entries[0][1] if all_entries else self._starting_weight

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

    def get_goal_type(self, date_str: str | None = None) -> str | None:
        """Return the goal type for a given date (or today if not specified)."""
        goal = self.get_daily_goal(date_str)
        if goal and "goal_type" in goal:
            return goal["goal_type"]
        return self._goal_type

    def set_goal_type(self, goal_type: str | None) -> None:
        """Set the default goal type for the user profile."""
        self._goal_type = goal_type

    # -----------------------------------------------------------------------
    # BMR related profile data
    # -----------------------------------------------------------------------
    def get_birth_year(self) -> int | None:
        """Return birth year."""
        return self._birth_year

    def set_birth_year(self, year: int | None) -> None:
        """Set birth year."""
        self._birth_year = year

    def get_sex(self) -> str | None:
        """Return biological sex (male/female)."""
        return self._sex

    def set_sex(self, sex: str | None) -> None:
        """Set biological sex (male/female)."""
        self._sex = sex

    def get_height(self) -> int | None:
        """Return height value in user's preferred unit."""
        return self._height

    def set_height(self, height: int | None) -> None:
        """Set height value in user's preferred unit."""
        self._height = height

    def get_height_unit(self) -> str:
        """Return height unit ('in' or 'cm')."""
        return self._height_unit

    def set_height_unit(self, height_unit: str) -> None:
        """Set height unit ('in' or 'cm')."""
        self._height_unit = height_unit

    def get_height_in_cm(self) -> float | None:
        """Return height in centimeters for BMR calculations, regardless of storage unit."""
        if self._height is None:
            return None

        if self._height_unit == "in":
            # Convert inches to centimeters
            return self._height * 2.54

        # Already in centimeters
        return float(self._height)

    def calculate_bmr(self, date_str: str | None = None) -> float | None:
        """Calculate Basal Metabolic Rate using optimal equation based on available data.

        Uses tiered approach for maximum accuracy:
        1. Cunningham equation when body fat available AND > 25%
        2. Katch-McArdle equation when body fat available AND ≤ 25%
        3. Owen equation when no body fat but BMI > 25
        4. Mifflin-St Jeor equation as fallback for all other cases

        Uses time-aware data for the specified date or today if not specified.
        Returns None if insufficient data is available.
        """
        # Get required data
        sex = self.get_sex()
        birth_year = self.get_birth_year()
        height_cm = self.get_height_in_cm()

        # Get weight for the specified date
        weight = self.get_weight(date_str)

        # Check if we have minimum required data
        if not all([sex, height_cm, weight]):
            return None

        # Convert weight to kg if needed
        weight_kg = weight
        if self.get_weight_unit() == "lbs":
            weight_kg = weight * 0.453592  # Convert lbs to kg

        # Get body fat percentage for the date
        body_fat_pct = self.get_body_fat_pct(date_str)

        # Calculate BMI for Owen equation decision
        height_m = height_cm / 100
        bmi = weight_kg / (height_m * height_m)

        # Tier 1 & 2: Use body fat-based equations if available
        if body_fat_pct is not None:
            lean_body_mass = weight_kg * (1 - body_fat_pct / 100)

            if body_fat_pct > 25:
                # Tier 1: Cunningham equation for higher body fat
                bmr = 500 + (22 * lean_body_mass)
            else:
                # Tier 2: Katch-McArdle equation for lower body fat
                bmr = 370 + (21.6 * lean_body_mass)

            return round(bmr, 1)

        # Tier 3: Owen equation for overweight individuals without body fat data
        if bmi > 25:
            if sex.lower() == "male":
                bmr = 879 + (10.2 * weight_kg)
            elif sex.lower() == "female":
                bmr = 795 + (7.18 * weight_kg)
            else:
                return None

            return round(bmr, 1)

        # Tier 4: Mifflin-St Jeor equation as fallback
        if birth_year is None:
            return None

        # Calculate age
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        age = target_date.year - birth_year

        # Ensure all required values are present
        if weight_kg is None or height_cm is None or age is None:
            return None

        # Apply Mifflin-St Jeor equation
        if sex.lower() == "male":
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        elif sex.lower() == "female":
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        else:
            return None

        return round(bmr, 1)

    def get_body_fat_pct(self, date_str: str | None = None) -> float | None:
        """Return the body fat percentage for the specified date, with fallback logic.

        If no body fat percentage is found for the date:
        1. Look for the most recent body fat percentage before this date
        2. If none found before, use the earliest body fat percentage after this date
        3. If no logged body fat percentages exist, fall back to profile default
        """
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        target_iso = target_date.isoformat()

        # Check exact date first
        body_fat_pct = self._storage.get_body_fat_pct(target_iso)
        if body_fat_pct is not None:
            return body_fat_pct

        # Get all body fat percentage entries and sort them
        all_entries = []
        storage_data = self._storage.get_all_body_fat_pcts()
        for date_key, bf_pct in storage_data.items():
            try:
                entry_date = dt_util.parse_datetime(date_key).date()
                all_entries.append((entry_date, bf_pct))
            except (ValueError, AttributeError):
                continue

        if not all_entries:
            return self._body_fat_pct

        all_entries.sort(key=lambda x: x[0])

        # Find the most recent entry before target date
        most_recent_before = None
        for entry_date, bf_pct in all_entries:
            if entry_date <= target_date:
                most_recent_before = bf_pct
            else:
                break

        if most_recent_before is not None:
            return most_recent_before

        # If no entry before target date, use the earliest entry after
        return all_entries[0][1] if all_entries else self._body_fat_pct

    async def set_body_fat_pct(self, pct: float, date_str: str) -> None:
        """Set body fat percent for a specific date and persist."""
        self._body_fat_pct = pct
        self._storage.set_body_fat_pct(date_str, pct)
        await self._storage.async_save()

    def get_neat(self) -> float:
        """Return the NEAT (Non-Exercise Activity Thermogenesis) multiplier."""
        return self._neat

    def set_neat(self, neat: float) -> None:
        """Set the NEAT (Non-Exercise Activity Thermogenesis) multiplier."""
        self._neat = neat

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
