#!/bin/bash

# This script builds the frontend.
# It no longer renames the file with a version number, as versioning is handled via query parameter in __init__.py.

set -e

# Path to manifest.json and __init__.py
FRONTEND_DIR="/workspaces/core/config/custom_components/repo/custom_components/calorie_tracker/frontend"

# Compile frontend
cd "$FRONTEND_DIR"
npm install
npm run build

# Return to the original directory
cd -

echo "Frontend updated successfully."
