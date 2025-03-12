#!/bin/bash

# Create symlinks for Term-Code with Ollama
# This script creates symlinks in ~/bin for easier access

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Creating symlinks for Term-Code with Ollama..."

# Create ~/bin directory if it doesn't exist
mkdir -p ~/bin

# Create symlink for direct path access
ln -sf "$SCRIPT_DIR/term-code" ~/bin/tcode

# Make the script executable
chmod +x "$SCRIPT_DIR/term-code"

echo "Done! You can now use 'tcode' from anywhere."
echo "Try 'tcode --interactive' to start interactive mode."
echo "Make sure ~/bin is in your PATH."

# Add ~/bin to PATH if not already there
if ! grep -q "export PATH=\"\$HOME/bin:\$PATH\"" ~/.bashrc; then
  echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
  echo "Added ~/bin to PATH in ~/.bashrc. Please run 'source ~/.bashrc'."
fi 