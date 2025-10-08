"""Weight trend analysis and prediction."""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

import numpy as np
from scipy import stats
from scipy.signal import find_peaks

_LOGGER = logging.getLogger(__name__)


def calculate_linear_trend(weight_data: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Calculate linear regression trend from weight data.

    Returns dict with:
    - slope: kg per day
    - intercept: starting weight
    - r_squared: quality of fit (0-1)
    - predicted_days_to_goal: days until goal (if applicable)
    """
    if len(weight_data) < 3:
        return None

    dates = [datetime.fromisoformat(d["date"]) for d in weight_data]
    weights = [d["weight"] for d in weight_data]

    # Convert dates to days since first measurement
    first_date = dates[0]
    x = np.array([(d - first_date).days for d in dates])
    y = np.array(weights)

    # Perform linear regression
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

    return {
        "slope": slope,  # kg per day
        "intercept": intercept,
        "r_squared": r_value**2,
        "p_value": p_value,
        "std_err": std_err,
    }


def predict_goal_date(
    weight_data: list[dict[str, Any]],
    goal_weight: float,
    min_data_points: int = 7,
) -> dict[str, Any] | None:
    """Predict when user will reach goal weight.

    Returns dict with:
    - predicted_date: ISO date string
    - days_remaining: int
    - confidence: 'high', 'medium', 'low' based on r_squared
    - current_rate: kg per week
    """
    if len(weight_data) < min_data_points:
        return None

    trend = calculate_linear_trend(weight_data)
    if not trend or trend["slope"] == 0:
        return None

    current_weight = weight_data[-1]["weight"]
    weight_to_lose = current_weight - goal_weight

    # Check if moving in right direction
    if (weight_to_lose > 0 and trend["slope"] >= 0) or (
        weight_to_lose < 0 and trend["slope"] <= 0
    ):
        return None  # Not progressing toward goal

    # Calculate days to goal
    days_to_goal = weight_to_lose / trend["slope"]

    if days_to_goal < 0:
        days_to_goal = abs(days_to_goal)

    last_date = datetime.fromisoformat(weight_data[-1]["date"])
    predicted_date = last_date + timedelta(days=int(days_to_goal))

    # Determine confidence based on r_squared
    r_squared = trend["r_squared"]
    if r_squared > 0.8:
        confidence = "high"
    elif r_squared > 0.5:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "predicted_date": predicted_date.date().isoformat(),
        "days_remaining": int(days_to_goal),
        "confidence": confidence,
        "current_rate": trend["slope"] * 7,  # kg per week
        "r_squared": r_squared,
    }


def detect_trend_changes(
    weight_data: list[dict[str, Any]],
    min_segment_size: int = 7,
    significance_threshold: float = 0.05,
) -> list[dict[str, Any]]:
    """Detect significant changes in weight trend.

    Uses a sliding window approach to find points where the slope
    changes significantly.

    Returns list of change points with:
    - date: ISO date string where change occurred
    - before_slope: slope before change (kg/day)
    - after_slope: slope after change (kg/day)
    - significance: p-value of the difference
    """
    if len(weight_data) < min_segment_size * 2:
        return []

    weights = np.array([d["weight"] for d in weight_data])

    # Calculate moving average to smooth data
    window = min(7, len(weights) // 4)
    weights_smooth = np.convolve(weights, np.ones(window) / window, mode="valid")

    # Calculate derivatives (rate of change)
    derivatives = np.diff(weights_smooth)

    # Find peaks in absolute derivative changes (significant slope changes)
    peaks, properties = find_peaks(
        np.abs(np.diff(derivatives)),
        prominence=np.std(derivatives) * 0.5,
        distance=min_segment_size,
    )

    change_points = []
    for peak in peaks:
        # Adjust peak index for smoothing and differentiation
        idx = peak + window // 2 + 1

        if idx < min_segment_size or idx > len(weight_data) - min_segment_size:
            continue

        # Calculate slopes before and after
        before_data = weight_data[max(0, idx - min_segment_size) : idx]
        after_data = weight_data[idx : min(len(weight_data), idx + min_segment_size)]

        before_trend = calculate_linear_trend(before_data)
        after_trend = calculate_linear_trend(after_data)

        if not before_trend or not after_trend:
            continue

        # Check if difference is significant
        slope_diff = abs(after_trend["slope"] - before_trend["slope"])
        avg_std = (before_trend["std_err"] + after_trend["std_err"]) / 2

        if slope_diff > avg_std * 2:  # 2 standard deviations
            change_points.append(
                {
                    "date": weight_data[idx]["date"],
                    "before_slope": before_trend["slope"],
                    "after_slope": after_trend["slope"],
                    "slope_change": after_trend["slope"] - before_trend["slope"],
                }
            )

    return change_points
