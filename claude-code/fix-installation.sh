#!/bin/bash

# Fix-installation script for Term-Code in WSL
# This script fixes common issues by reusing existing components

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}
======================================
     Term-Code Installation Fix
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

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
cd "$SCRIPT_DIR"
npm install

# Fix the package.json in dist directory
mkdir -p "$SCRIPT_DIR/dist"
echo -e "{
  \"name\": \"term-code\",
  \"version\": \"1.0.0\",
  \"description\": \"Terminal-based AI coding assistant\",
  \"type\": \"module\",
  \"dependencies\": {
    \"node-fetch\": \"^3.3.2\"
  }
}" > "$SCRIPT_DIR/dist/package.json"

echo -e "${GREEN}✅ Created dist/package.json${NC}"

# Create bin directory if it doesn't exist
if [ ! -d "$HOME_BIN" ]; then
  echo -e "\n${BLUE}Creating ~/bin directory...${NC}"
  mkdir -p "$HOME_BIN"
fi

# Set up Ollama configuration
echo -e "\n${BLUE}Setting up Ollama configuration...${NC}"
OLLAMA_CONFIG="$HOME/.ollama_config"
echo "SERVER_URL=http://host.docker.internal:11434" > "$OLLAMA_CONFIG"
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> "$OLLAMA_CONFIG"
echo -e "${GREEN}✅ Created $OLLAMA_CONFIG${NC}"

# Fix permissions on scripts
echo -e "\n${BLUE}Fixing script permissions...${NC}"
chmod +x "$SCRIPT_DIR/ollama-cli.sh"
chmod +x "$SCRIPT_DIR/ollama.js"
chmod +x "$SCRIPT_DIR/run-term-code.js"
echo -e "${GREEN}✅ Made scripts executable${NC}"

# Create symbolic links
echo -e "\n${BLUE}Creating symbolic links...${NC}"
# Use absolute paths for symlinks to prevent path resolution issues
ln -sf "$SCRIPT_DIR/ollama-cli.sh" "$HOME_BIN/ollama-cli"
ln -sf "$SCRIPT_DIR/run-term-code.js" "$HOME_BIN/tcode"
chmod +x "$HOME_BIN/ollama-cli" "$HOME_BIN/tcode"
echo -e "${GREEN}✅ Created symlinks in ~/bin${NC}"

# Ensure bin is in PATH
if [[ ":$PATH:" != *":$HOME_BIN:"* ]]; then
  echo -e "\n${BLUE}Adding ~/bin to PATH...${NC}"
  
  if [ -f "$HOME/.bashrc" ]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.bashrc"
    echo -e "${YELLOW}⚠️ Added ~/bin to PATH in ~/.bashrc${NC}"
    echo -e "${YELLOW}⚠️ Run 'source ~/.bashrc' to apply changes${NC}"
  elif [ -f "$HOME/.zshrc" ]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.zshrc"
    echo -e "${YELLOW}⚠️ Added ~/bin to PATH in ~/.zshrc${NC}"
    echo -e "${YELLOW}⚠️ Run 'source ~/.zshrc' to apply changes${NC}"
  fi
fi

# Test the connection
echo -e "\n${BLUE}Testing connection to Ollama...${NC}"
if curl -s http://host.docker.internal:11434/api/tags &> /dev/null; then
  echo -e "${GREEN}✅ Successfully connected to Ollama on Windows host${NC}"
else
  echo -e "${YELLOW}⚠️ Could not connect to Ollama on Windows host${NC}"
  echo "Make sure Ollama is running on your Windows machine."
fi

# Final message
echo -e "\n${GREEN}Installation fix complete!${NC}"
echo -e "\nYou can now use Term-Code with these commands:"
echo -e "  ${YELLOW}tcode${NC} - Run Term-Code"
echo -e "  ${YELLOW}ollama-cli list${NC} - List Ollama models"
echo -e "\nIf the commands aren't available, run:"
echo -e "  ${YELLOW}source ~/.bashrc${NC}"
echo -e "  ${YELLOW}export PATH=\"\$HOME/bin:\$PATH\"${NC}" 