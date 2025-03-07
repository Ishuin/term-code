#!/bin/bash

# Easy installation script for Term-Code in WSL
# This avoids global npm installation issues

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}
======================================
      Term-Code Easy Install
======================================
${NC}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_BIN="$HOME/bin"

# Check Node.js installation
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed!${NC}"
  echo "Please install Node.js v18 or higher:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Create bin directory if it doesn't exist
if [ ! -d "$HOME_BIN" ]; then
  echo "Creating ~/bin directory..."
  mkdir -p "$HOME_BIN"
fi

# Install node-fetch (required dependency)
echo "Installing node-fetch dependency..."
cd "$SCRIPT_DIR"
npm install node-fetch@3.3.2

# Make the wrapper script executable
chmod +x "$SCRIPT_DIR/tcode-wrapper.js"

# Create symbolic links
echo "Creating symbolic links in ~/bin..."
ln -sf "$SCRIPT_DIR/tcode-wrapper.js" "$HOME_BIN/tcode"
ln -sf "$SCRIPT_DIR/ollama.js" "$HOME_BIN/ollama-cli"

# Make links executable
chmod +x "$HOME_BIN/tcode" "$HOME_BIN/ollama-cli"

# Ensure bin is in PATH
if [[ ":$PATH:" != *":$HOME_BIN:"* ]]; then
  echo "Adding ~/bin to PATH..."
  
  if [ -f "$HOME/.bashrc" ]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.bashrc"
    echo -e "${YELLOW}⚠️ Added ~/bin to PATH in ~/.bashrc${NC}"
    echo -e "${YELLOW}⚠️ Run 'source ~/.bashrc' to apply changes${NC}"
  elif [ -f "$HOME/.zshrc" ]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.zshrc"
    echo -e "${YELLOW}⚠️ Added ~/bin to PATH in ~/.zshrc${NC}"
    echo -e "${YELLOW}⚠️ Run 'source ~/.zshrc' to apply changes${NC}"
  else
    echo -e "${YELLOW}⚠️ Could not find shell config file.${NC}"
    echo -e "${YELLOW}⚠️ Add the following line to your shell config:${NC}"
    echo 'export PATH="$HOME/bin:$PATH"'
  fi
fi

# Create Ollama config file
echo "Setting up Ollama configuration..."
echo "SERVER_URL=http://host.docker.internal:11434" > "$HOME/.ollama_config"
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> "$HOME/.ollama_config"

# Test the connection
echo "Testing connection to Ollama..."
if curl -s http://host.docker.internal:11434/api/tags &> /dev/null; then
  echo -e "${GREEN}✅ Successfully connected to Ollama on Windows host${NC}"
else
  echo -e "${YELLOW}⚠️ Could not connect to Ollama on Windows host${NC}"
  echo "Make sure Ollama is running on your Windows machine."
fi

# Final instructions
echo -e "\n${GREEN}Installation Complete!${NC}"
echo -e "\nYou can now use Term-Code with these commands:"
echo -e "  ${YELLOW}tcode${NC} - Run Term-Code"
echo -e "  ${YELLOW}ollama-cli list${NC} - List Ollama models"
echo -e "\nIf the commands aren't available, run:"
echo -e "  ${YELLOW}source ~/.bashrc${NC}"
echo -e "  ${YELLOW}export PATH=\"\$HOME/bin:\$PATH\"${NC}"

echo -e "\n${GREEN}Enjoy using Term-Code with Ollama!${NC}" 