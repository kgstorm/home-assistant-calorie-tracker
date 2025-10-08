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

    async def add_goal(self, date: str, goal_type: str, goal_value: float) -> None:
        """Add a new goal entry and persist it.

        goal_value may be a float (for percentage-based variable goals) or an int
        for fixed calorie/net/deficit/surplus goals. Storage layer should persist
        the numeric value without additional rounding beyond what caller provides.
        """
        raise NotImplementedError

    def get_goal(self, date: str) -> dict[str, Any] | None:
        """Get the goal for a specific date."""
        raise NotImplementedError

    def get_all_goals(self) -> dict[str, dict[str, Any]]:
        """Get all goal entries."""
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
        storage: StorageProtocol,
        starting_weight: int,
        goal_weight: int,
        weight_unit: str,
        birth_year: int | None = None,
        sex: str | None = None,
        height: int | None = None,
        height_unit: str = "cm",
        neat: float = 1.2,
    ) -> None:
        """Initialize the Calorie Tracker user profile."""
        self._storage = storage
        self._spoken_name = spoken_name

        # Attempt to pull current goal (may be None if storage not loaded yet)
        current_goal = self.get_goal()
        if current_goal:
            self._goal_value = current_goal.get("goal_value", 0)
            self._goal_type = current_goal.get("goal_type")
        else:
            self._goal_value = 0
            self._goal_type = None

        self._starting_weight = starting_weight
        self._goal_weight = goal_weight
        self._weight_unit = weight_unit
        self._birth_year = birth_year
        self._sex = sex
        self._height = height
        self._height_unit = height_unit

        # Initialize body fat to 0.0; will be updated on first explicit set or
        # when queried with historical data present in storage.
        self._body_fat_pct = 0.0
        self._neat = neat

    def get_goal(self, date_str: str | None = None) -> dict[str, Any] | None:
        """Get the goal for a given date (or today if not specified).

        Returns:
            A dict with at least keys: goal_type, goal_value, start_date.
            Returns None if no goal is set.
        """
        if date_str is None:
            date_str = dt_util.now().date().isoformat()
        return self._storage.get_goal(date_str)

    async def add_goal(
        self, goal_type: str, goal_value: float, date_str: str | None = None
    ) -> None:
        """Set a new goal for a given date (or today if not specified), and persist it.

        Fixed goals (intake, net calories, deficit, surplus) are coerced to nearest
        int for historical compatibility. Variable goals (cut/bulk percentage) are
        stored with up to 2 decimal places so users can target fractional weekly
        percentage changes (e.g. 0.75%).
        """
        if date_str is None:
            date_str = dt_util.now().date().isoformat()

        if goal_type in ("variable_cut", "variable_bulk"):
            # Preserve two decimals of precision
            goal_value_store: float = round(float(goal_value), 2)
        else:
            # Maintain legacy int rounding for fixed calorie style goals
            goal_value_store = int(round(float(goal_value)))  # type: ignore[assignment]

        await self._storage.add_goal(date_str, goal_type, goal_value_store)

    def get_all_goals(self) -> dict[str, dict[str, Any]]:
        """Get all goal entries from the user's history.

        Returns:
            Dictionary mapping date strings to goal objects with goal_type and goal_value.

        """
        return self._storage.get_all_goals()

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
        if date_str is None:
            target_date_str = dt_util.now().date().isoformat()
        elif "T" in date_str:
            # Extract date part from full timestamp
            target_date_str = date_str.split("T")[0]
        else:
            target_date_str = date_str

        # Use fast string prefix matching instead of parsing every timestamp
        food_entries = [
            entry
            for entry in self._storage.get_food_entries()
            if entry["timestamp"].startswith(target_date_str)
        ]
        exercise_entries = [
            entry
            for entry in self._storage.get_exercise_entries()
            if entry["timestamp"].startswith(target_date_str)
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
        self, date_str: str | None = None, include_macros: bool = True
    ) -> dict[
        str, tuple[int, int, int, int, str, float, int | float, dict[str, int], int]
    ]:
        """Return the weekly summary.

        If include_macros is False, the macros dict in each tuple will be an empty
        dict. This lets callers opt out of computing macros when they don't need them.

        Returns a dict mapping date strings to tuples containing:
        (food, exercise, bmr_and_neat, daily_calorie_goal, goal_type, weight, goal_value, macros, remaining_calories)
        """
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        days_since_sunday = (target_date.weekday() + 1) % 7
        sunday = target_date - timedelta(days=days_since_sunday)
        week_dates = [sunday + timedelta(days=i) for i in range(7)]
        summary: dict[
            str, tuple[int, int, int, int, str, float, int | float, dict[str, int], int]
        ] = {}
        food_by_day: dict[str, int] = {d.isoformat(): 0 for d in week_dates}
        exercise_by_day: dict[str, int] = {d.isoformat(): 0 for d in week_dates}

        for entry in self._storage.get_food_entries():
            # Use fast string prefix matching - timestamps are formatted as "YYYY-MM-DD..."
            entry_date_prefix = entry["timestamp"][:10]  # Extract YYYY-MM-DD part
            if entry_date_prefix in food_by_day:
                food_by_day[entry_date_prefix] += entry.get("calories", 0) or 0

        for entry in self._storage.get_exercise_entries():
            # Use fast string prefix matching - timestamps are formatted as "YYYY-MM-DD..."
            entry_date_prefix = entry["timestamp"][:10]  # Extract YYYY-MM-DD part
            if entry_date_prefix in exercise_by_day:
                exercise_by_day[entry_date_prefix] += (
                    entry.get("calories_burned", 0) or 0
                )

        for d in week_dates:
            date_iso = d.isoformat()
            food = food_by_day[date_iso]
            exercise = exercise_by_day[date_iso]
            bmr = self.calculate_bmr(date_iso) or 0.0
            bmr_and_neat = int(round((bmr * self._neat) if bmr else 0.0))
            goal = self.get_goal(date_iso) or {}
            goal_type = goal.get("goal_type", "Not Found")
            goal_value = goal.get("goal_value", 0)
            weight = self.get_weight(date_iso) or 0.0

            # Calculate daily_calorie_goal
            if goal_type in ("fixed_intake", "fixed_net_calories"):
                # Absolute intake or net calorie targets are stored directly
                daily_calorie_goal = int(round(goal_value))
            elif goal_type == "fixed_deficit":
                # Fixed deficit represents X kcal below BMR+NEAT
                daily_calorie_goal = int(round(bmr_and_neat - goal_value))
            elif goal_type == "fixed_surplus":
                # Fixed surplus represents X kcal above BMR+NEAT
                daily_calorie_goal = int(round(bmr_and_neat + goal_value))
            elif goal_type in ("variable_cut", "variable_bulk"):
                percent = goal_value / 100.0
                weight_unit = self.get_weight_unit()
                if weight_unit == "kg":
                    cal_per_weight = 7700
                else:
                    cal_per_weight = 3500
                # Calculate the weekly calorie change required, then per-day
                per_day_delta = (weight * percent / 7.0) * cal_per_weight
                if goal_type == "variable_cut":
                    daily_calorie_goal = int(round(bmr_and_neat - per_day_delta))
                else:  # variable_bulk
                    daily_calorie_goal = int(round(bmr_and_neat + per_day_delta))
            else:
                daily_calorie_goal = int(round(goal_value))

            # Calculate remaining calories for this date
            remaining_calories = self.calculate_remaining_calories(date_iso)

            # Get macros for this date if requested
            macros = self.get_daily_macros(date_iso) if include_macros else {}

            summary[date_iso] = (
                food,
                exercise,
                bmr_and_neat,
                daily_calorie_goal,
                goal_type,
                weight,
                goal_value,
                macros,
                remaining_calories,
            )

        return summary

    async def async_log_food(
        self,
        food_item: str,
        calories: int,
        timestamp: str | None = None,
        c: int | None = None,
        p: int | None = None,
        f: int | None = None,
        a: int | None = None,
    ) -> None:
        """Asynchronously log a food entry and persist it."""
        ts = _normalize_local_timestamp(timestamp)
        # Pass optional macro grams to storage
        self._storage.add_food_entry(ts, food_item, calories, c=c, p=p, f=f, a=a)
        await self._storage.async_save()

    def get_daily_macros(self, date_str: str | None = None) -> dict[str, int]:
        """Return aggregate macro totals for a specific date (YYYY-MM-DD).

        If date_str is None, default to today's date. If a full timestamp is
        provided (contains a time), normalize it to the date portion before
        passing to the storage backend which expects a YYYY-MM-DD prefix.
        """
        target_date = (
            dt_util.parse_datetime(date_str).date()
            if date_str
            else dt_util.now().date()
        )
        return self._storage.get_daily_macros(target_date.isoformat())

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

    def get_weight_history(self) -> list[dict[str, float | str]]:
        """Return all logged weights as a list of {date, weight} dicts, sorted by date."""
        weights = self._storage.get_all_weights()
        # Return sorted by date ascending
        return [
            {"date": date, "weight": weights[date]} for date in sorted(weights.keys())
        ]

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

        # Get all weight entries and sort them by date string
        all_entries = []
        storage_data = self._storage.get_all_weights()
        for date_key, weight_val in storage_data.items():
            all_entries.append((date_key, weight_val))

        if not all_entries:
            return self._starting_weight

        all_entries.sort(key=lambda x: x[0])

        # Find the most recent entry before target date
        most_recent_before = None
        for entry_date_str, weight_val in all_entries:
            if entry_date_str <= target_iso:
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
        goal = self.get_goal(date_str)
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
            all_entries.append((date_key, bf_pct))

        if not all_entries:
            return self._body_fat_pct

        all_entries.sort(key=lambda x: x[0])

        # Find the most recent entry before target date
        most_recent_before = None
        for entry_date_str, bf_pct in all_entries:
            if entry_date_str <= target_iso:
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

    def calculate_remaining_calories(self, date_str: str | None = None) -> int:
        """Calculate remaining calories for a given date (or today if not specified).

        Returns the remaining calories based on the user's goal type and current consumption.
        For variable goals (cut/bulk), calculates based on body weight percentage per week.
        For fixed goals, uses the goal value directly as the daily target.

        Returns positive value if under goal, negative value if over goal.
        """
        # Get today's data
        log = self.get_log(date_str)
        food, exercise = log.get("calories", (0, 0))

        # Get goal information
        goal = self.get_goal(date_str)
        goal_type = goal.get("goal_type") if goal else self.get_goal_type()
        goal_value = (
            goal.get("goal_value", 0) if goal else getattr(self, "_goal_value", 0)
        )

        if not goal_type or not goal_value:
            return 0

        # Calculate the actual daily calorie target
        if goal_type.startswith("variable"):
            # For variable goals, goal_value is a percentage of body weight per week
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()

            if bmr is None:
                return 0

            bmr_baseline = bmr * neat
            current_weight = self.get_weight(date_str)

            if current_weight is None:
                return 0

            # Convert weight to lbs if needed (3500 calories per pound)
            weight_lbs = current_weight
            if self.get_weight_unit() == "kg":
                weight_lbs = current_weight * 2.20462

            # Calculate daily calorie adjustment: weight * percentage / 100 * 3500 calories / 7 days
            daily_adjustment = weight_lbs * goal_value / 100 * 3500 / 7

            if "cut" in goal_type:
                # For cutting, subtract from BMR (create deficit)
                daily_goal = bmr_baseline - daily_adjustment
            elif "bulk" in goal_type:
                # For bulking, add to BMR (create surplus)
                daily_goal = bmr_baseline + daily_adjustment
            else:
                # Generic variable goal, assume cutting
                daily_goal = bmr_baseline - daily_adjustment
        elif goal_type in ("fixed_intake", "fixed_net_calories"):
            # For fixed intake/net calories, goal_value is the actual target
            daily_goal = goal_value
        elif goal_type == "fixed_deficit":
            # Fixed deficit represents X kcal below BMR+NEAT
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()
            if bmr is None:
                return 0
            bmr_baseline = bmr * neat
            daily_goal = bmr_baseline - goal_value
        elif goal_type == "fixed_surplus":
            # Fixed surplus represents X kcal above BMR+NEAT
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()
            if bmr is None:
                return 0
            bmr_baseline = bmr * neat
            daily_goal = bmr_baseline + goal_value
        else:
            # Default fallback - treat as fixed target
            daily_goal = goal_value

        # Calculate current calories based on goal type
        if goal_type == "fixed_net_calories" or goal_type.startswith("variable"):
            current_calories = food - exercise
        elif goal_type == "fixed_intake":
            current_calories = food
        else:
            # Default to net calories for unknown types
            current_calories = food - exercise

        # Calculate remaining calories (can be positive or negative)
        remaining = daily_goal - current_calories
        return int(remaining)

    def calculate_daily_goal_calories(self, date_str: str | None = None) -> int:
        """Calculate the daily calorie goal for a given date (or today if not specified).

        Returns the calculated daily calorie target based on the user's goal type.
        For variable goals, calculates based on BMR + body weight percentage adjustments.
        For fixed goals, returns the goal value directly.
        """
        # Get goal information
        goal = self.get_goal(date_str)
        goal_type = goal.get("goal_type") if goal else self.get_goal_type()
        goal_value = (
            goal.get("goal_value", 0) if goal else getattr(self, "_goal_value", 0)
        )

        if not goal_type or not goal_value:
            return 0

        # Calculate the actual daily calorie target
        if goal_type.startswith("variable"):
            # For variable goals, goal_value is a percentage of body weight per week
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()

            if bmr is None:
                return 0

            bmr_baseline = bmr * neat
            current_weight = self.get_weight(date_str)

            if current_weight is None:
                return 0

            # Convert weight to lbs if needed (3500 calories per pound)
            weight_lbs = current_weight
            if self.get_weight_unit() == "kg":
                weight_lbs = current_weight * 2.20462

            # Calculate daily calorie adjustment: weight * percentage / 100 * 3500 calories / 7 days
            daily_adjustment = weight_lbs * goal_value / 100 * 3500 / 7

            if "cut" in goal_type:
                # For cutting, subtract from BMR (create deficit)
                daily_goal = bmr_baseline - daily_adjustment
            elif "bulk" in goal_type:
                # For bulking, add to BMR (create surplus)
                daily_goal = bmr_baseline + daily_adjustment
            else:
                # Generic variable goal, assume cutting
                daily_goal = bmr_baseline - daily_adjustment
        elif goal_type in ("fixed_intake", "fixed_net_calories"):
            # For fixed intake/net calories, goal_value is the actual target
            daily_goal = goal_value
        elif goal_type == "fixed_deficit":
            # Fixed deficit represents X kcal below BMR+NEAT
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()
            if bmr is None:
                return 0
            bmr_baseline = bmr * neat
            daily_goal = bmr_baseline - goal_value
        elif goal_type == "fixed_surplus":
            # Fixed surplus represents X kcal above BMR+NEAT
            bmr = self.calculate_bmr(date_str)
            neat = self.get_neat()
            if bmr is None:
                return 0
            bmr_baseline = bmr * neat
            daily_goal = bmr_baseline + goal_value
        else:
            # Default fallback - treat as fixed target
            daily_goal = goal_value

        return int(daily_goal)
