"""Constants for the Calorie Scaffold integration."""

DOMAIN = "calorie_tracker"
CALORIES = "calories"
ITEM_NAME = "item_name"
DAILY_GOAL = "daily_goal"
TODAYS_CALORIES = "todays_calories"
CONF_OPENAI_API_KEY = "openai_api_key"
DEFAULT_CALORIE_LIMIT = 2000
SPOKEN_NAME = "spoken_name"
USER_PROFILE_MAP_KEY = f"{DOMAIN}_user_profile_map"
STARTING_WEIGHT = "starting_weight"
GOAL_WEIGHT = "goal_weight"
UNLINKED_EXERCISE = "unlinked_exercise"
WEIGHT_UNIT = "weight_unit"
DEFAULT_WEIGHT_UNIT = "lbs"
INCLUDE_EXERCISE_IN_NET = "include_exercise_in_net"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"
DEFAULT_AZURE_MODEL = "gpt-4o-mini"
DEFAULT_ANTHROPIC_MODEL = "claude-3-haiku-20240307"
ENTRY_TYPE = "entry_type"
FOOD_ITEM = "food_item"
EXERCISE_TYPE = "exercise_type"
DURATION = "duration"
CALORIES_BURNED = "calories_burned"
WEIGHT = "weight"
TIMESTAMP = "timestamp"
NEAT = "neat"
BIRTH_YEAR = "birth_year"
SEX = "sex"  # 'male' | 'female'
HEIGHT = "height"  # Height value in user's preferred unit
HEIGHT_UNIT = "height_unit"  # 'in' | 'cm'
BODY_FAT_PCT = "body_fat_pct"  # Optional visual estimate
PREFERRED_IMAGE_ANALYZER = (
    "preferred_image_analyzer"  # Preferred image analyzer for photo analysis
)
GOAL_TYPE = "goal_type"
