# Home Assistant Calorie Tracker

The Calorie Tracker is a custom component for Home Assistant that helps you monitor your daily calorie intake and progress toward your fitness goals. If using an LLM conversation agent (such as OpenAI Conversation), you can log everything through your voice assistant. 

## Features

- Log calories, exercises, and daily weight.
- Set your starting weight, goal weight, and daily calorie goals.
- View progress in a custom panel within Home Assistant.
- Supports multiple profiles for different users.
- With an LLM conversation agent (such as OpenAI Conversation) you can:
    - Log calories, exercise, and weight with your voice assistant
    - If you don't know the calories, the LLM will estimate them from the description (better datails for better estimate)

## Installation

1. Clone or download this repository into your Home Assistant `custom_components` directory:
   ```bash
   git clone https://github.com/kgstorm/home-assistant-calorie-tracker.git

Ensure the folder structure looks like this:

  
Restart Home Assistant.

Add the Calorie Tracker integration via the Home Assistant UI:

Navigate to Settings > Integrations.
Click Add Integration and search for "Calorie Tracker".
Once setup, a Calorie Tracker panel will appear in the Home Assistant sidebar. Entrirs can he made/edited/deleted in the sidebar.

A service call is also available to log calories.

Screenshots
Calorie Tracker Panel
<img alt="Calorie Tracker Panel" src="vscode-remote-resource://127.0.0.1:46091/stable-18e3a1ec544e6907be1e944a94c496e302073435/vscode-remote-resource?path=%2Fworkspaces%2Fcore%2Fscreenshots%2Fcalorie_tracker_panel.png&amp;tkn=143b3ff2-e175-48d1-9976-53048d734cd8">
Profile Setup
<img alt="Profile Setup" src="vscode-remote-resource://127.0.0.1:46091/stable-18e3a1ec544e6907be1e944a94c496e302073435/vscode-remote-resource?path=%2Fworkspaces%2Fcore%2Fscreenshots%2Fprofile_setup.png&amp;tkn=143b3ff2-e175-48d1-9976-53048d734cd8">
Development
Contributions are welcome! Please open an issue or submit a pull request if you'd like to improve the component.
