#!/bin/bash

# This script builds the frontend.

set -e

# Path to manifest.json and __init__.py
FRONTEND_DIR="/home/kgstorm/HAdev/home-assistant-calorie-tracker/custom_components/calorie_tracker/frontend"

# Compile frontend
cd "$FRONTEND_DIR"
npm install
npm run build

# Return to the original directory
cd -

echo "Frontend updated successfully."
