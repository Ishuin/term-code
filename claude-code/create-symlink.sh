#!/bin/bash

# Create a symlink in the home directory that will work from anywhere

# Get the absolute path to this directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Target path in home directory
TARGET="$HOME/ollama-cli"

# Create the symlink
echo "Creating symlink at $TARGET pointing to $SCRIPT_DIR/ollama-cli.sh"
ln -sf "$SCRIPT_DIR/ollama-cli.sh" "$TARGET"

# Make it executable (just in case)
chmod +x "$SCRIPT_DIR/ollama-cli.sh"
chmod +x "$TARGET"

echo "✅ Symlink created successfully!"
echo "You can now run 'ollama-cli' from anywhere:"
echo "  $TARGET list"
echo "  $TARGET info deepseek-r1:8b" 