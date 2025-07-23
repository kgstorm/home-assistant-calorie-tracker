# Home Assistant Calorie Tracker

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square&logo=homeassistantcommunitystore)](https://hacs.xyz/)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t8hdahudm6)

A [HACS](https://www.hacs.xyz/) integration that helps you monitor your daily calorie intake and progress toward your fitness goals. If using an LLM conversation agent (such as OpenAI Conversation), you can log everything through your voice assistant. A custom panel is included for visualizing your progress. 

## Push for Home Assist Preview Edition

I built this integration after purchasing a [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe/). This device (combined with an LLM as a conversation agent) has been a game changer for using a voice assistant without getting frustrated. This thing just works. Being able to quickly speak to this voice assistant to log calories, exercise, and weights without having to look at my phone makes all the difference. Not to mention the LLM pretty accurately estimates calories if you don't know them. It's awesome.

![Home Assistant Voice Preview Edition](screenshots/vpe-packaging.png)

## Features

- Tracks calories, exercises, and daily weight.
- Set your starting weight, goal weight, and daily calorie goals.
- Includes a Home Assistant side panel to view/edit all data.
- Supports multiple profiles for different users.
- With an LLM conversation agent (such as OpenAI Conversation) you can:
    - Log calories, exercise, and weight with your voice assistant
    - The LLM can also estimate calories from descriptions (better datails for better estimate)
    - Log calories by taking a picture of food (LLM must support image inputs)
- A service call is available to log calories.

## Log Calories by Taking a Photo with an LLM

- Logging calories with an LLM is supported with these conversation agents:
    - [Anthropic](https://www.home-assistant.io/integrations/anthropic)
    - [Azure OpenAI Conversation](https://github.com/joselcaguilar/azure-openai-ha)
    - [Google Generative AI Conversation](https://www.home-assistant.io/integrations/google_generative_ai_conversation)
    - [Ollama](https://www.home-assistant.io/integrations/ollama)
    - [OpenAI Conversation](https://www.home-assistant.io/integrations/openai_conversation)

## Auto logging Peloton workouts

- The Calorie Tracker integration will detect if there is a [Home Assistant Peloton Sensor](https://github.com/edwork/homeassistant-peloton-sensor) profile and allow you to link the Peloton profile to a Calorie Tracker profile. Peloton workouts will then be auto logged. 
- If you have other components you would like to log automatically, submit an [issue](https://github.com/kgstorm/home-assistant-calorie-tracker/issues)

## Install with HACS

The recommended way to download this is via HACS:


[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?category=custom_respository&owner=kgstorm&repository=home-assistant-calorie-tracker)

Restart Home Assistant.

Add the Calorie Tracker integration via the Home Assistant Settings > Integrations.

## Manual Installation

1. Clone or download this repository into your Home Assistant `custom_components` directory:
   ```bash
   git clone https://github.com/kgstorm/home-assistant-calorie-tracker.git
   ```
   
Ensure the folder structure looks like this:
   ```yaml
    custom_components/
        calorie_tracker/
            __init__.py
            api.py
            const.py
            storage.py
            websockets.py
            ...
   ```
Restart Home Assistant.

Add the Calorie Tracker integration via the Home Assistant Settings > Integrations.

## Screenshots

### Calorie Tracker Panel
Entries can be viewed/made/edited/deleted in the Calorie Tracker panel:

![Calorie Tracker Panel](screenshots/CalorieTrackerPanel.png)


### LLM Example

![Profile Setup](screenshots/CalorieTrackerLLMexample.png)

Development
Contributions are welcome. Please open an issue or submit a pull request if you'd like to improve the component.
