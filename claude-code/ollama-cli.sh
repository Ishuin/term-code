#!/bin/bash

# Simple wrapper for the direct-ollama.js script

# Get the real path of the script, resolving symlinks
REAL_PATH=$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")
SCRIPT_DIR=$(dirname "$REAL_PATH")
NODE_PATH=$(which node)

# Path to the direct-ollama.js script
OLLAMA_JS="${SCRIPT_DIR}/scripts/direct-ollama.js"

# If script not found in expected location, search in common locations
if [ ! -f "$OLLAMA_JS" ]; then
  # Try to find it relative to the current directory
  if [ -f "./scripts/direct-ollama.js" ]; then
    OLLAMA_JS="./scripts/direct-ollama.js"
  # Check if we're in the scripts directory
  elif [ -f "./direct-ollama.js" ]; then
    OLLAMA_JS="./direct-ollama.js"
  # Try the parent directory
  elif [ -f "../scripts/direct-ollama.js" ]; then
    OLLAMA_JS="../scripts/direct-ollama.js"
  fi
fi

if [ $# -eq 0 ]; then
  echo "Ollama CLI - Simple interface for Ollama"
  echo ""
  echo "Usage: ./ollama-cli.sh <command> [args]"
  echo ""
  echo "Available commands:"
  echo "  server <url>     - Set and test server URL"
  echo "                     Default: http://host.docker.internal:11434"
  echo "  list             - List available models"
  echo "  info <model>     - Get info about a specific model"
  echo ""
  echo "Examples:"
  echo "  ./ollama-cli.sh server http://host.docker.internal:11434"
  echo "  ./ollama-cli.sh list"
  echo "  ./ollama-cli.sh info deepseek-r1:8b"
  exit 0
fi

# Store URL preference if set
if [ "$1" = "server" ] && [ -n "$2" ]; then
  # Save config in both script directory and home directory for flexibility
  echo "export OLLAMA_BASE_URL=$2" > "${SCRIPT_DIR}/.ollama_config"
  echo "SERVER_URL=$2" > "$HOME/.ollama_config"
  echo "OLLAMA_BASE_URL=$2" >> "$HOME/.ollama_config"
fi

# Load config if exists (try both locations)
if [ -f "${SCRIPT_DIR}/.ollama_config" ]; then
  source "${SCRIPT_DIR}/.ollama_config"
elif [ -f "$HOME/.ollama_config" ]; then
  export $(grep -v '^#' "$HOME/.ollama_config" | xargs)
fi

# Verify that the JS file exists
if [ ! -f "$OLLAMA_JS" ]; then
  echo "Error: Could not find direct-ollama.js script at: $OLLAMA_JS"
  echo "Please verify your installation or reinstall Term-Code"
  exit 1
fi

# Run the direct-ollama.js script
$NODE_PATH "$OLLAMA_JS" "$@" 