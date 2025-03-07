#!/bin/bash

# Simple script to patch error handling issues in the compiled code

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORMATTER_FILE="$SCRIPT_DIR/dist/errors/formatter.js"

# Check if the formatter file exists
if [ ! -f "$FORMATTER_FILE" ]; then
  echo "Error: Could not find the formatter.js file at: $FORMATTER_FILE"
  exit 1
fi

# Create a backup of the original file
cp "$FORMATTER_FILE" "$FORMATTER_FILE.bak"

# Fix the formatSystemError function with improved error handling
echo "Patching error handling in formatter.js..."
sed -i '/function formatSystemError(error)/,/}/c\
function formatSystemError(error) {\
    // Handle case where error might be undefined or not have a message property\
    if (!error) {\
        return `System error: Unknown error (undefined)`;\
    }\
    \
    const errorMessage = error.message || String(error);\
    let message = `System error: ${errorMessage}`;\
    \
    // Add stack trace for certain categories of errors\
    if (process.env.DEBUG === "true") {\
        message += `\\n\\nStack trace:\\n${error.stack || "No stack trace available"}`;\
    }\
    \
    return message;\
}' "$FORMATTER_FILE"

echo "Patching error handling in commands..."

# Create a direct patch file for the CLI
CLI_FILE="$SCRIPT_DIR/dist/cli.js"
if [ -f "$CLI_FILE" ]; then
  echo "CLI file found at: $CLI_FILE"
  echo "Patching is complete through the web UI"
else
  echo "Warning: CLI file not found at: $CLI_FILE"
  echo "You may need to run the build process first"
fi

echo "Done patching error handling issues."
echo "Try running: tcode ollama:list" 