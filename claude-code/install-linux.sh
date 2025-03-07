#!/bin/bash

# Install Term-Code in WSL/Linux
# This script installs the Term-Code package globally in WSL/Linux environments

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Success message
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Warning message
warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# Error message
error() {
  echo -e "${RED}❌ $1${NC}"
}

# Section header
section() {
  echo ""
  echo -e "${BLUE}==== $1 ====${NC}"
  echo ""
}

# Welcome
echo -e "${BLUE}
======================================
    Term-Code Installation Script
======================================
${NC}"

# Detect WSL
IS_WSL=false
if grep -q Microsoft /proc/version; then
  IS_WSL=true
  echo -e "${GREEN}✅ Running in WSL environment${NC}"
else
  echo -e "${YELLOW}⚠️ Running in standard Linux environment${NC}"
fi

# Check if Node.js is installed
section "Checking prerequisites"
if ! command -v node &> /dev/null; then
  error "Node.js is not installed. Please install Node.js v18 or higher."
  echo "You can install it with:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

if ! command -v npm &> /dev/null; then
  error "npm is not installed."
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "npm version: ${GREEN}$NPM_VERSION${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Installation
section "Installing Term-Code"
echo "Installing from local directory: $SCRIPT_DIR"

# Check if sudo is required
if [[ -w "$(npm config get prefix)/lib/node_modules" ]]; then
  # No sudo needed
  echo "Installing globally (no sudo required)..."
  npm install -g "$SCRIPT_DIR"
else
  # Sudo needed
  warning "Installing globally (sudo required)..."
  echo "You may be prompted for your password."
  sudo npm install -g "$SCRIPT_DIR"
fi

# Verify installation
if command -v tcode &> /dev/null; then
  success "Term-Code installed successfully!"
else
  error "Installation failed. Please check for errors above."
  exit 1
fi

if command -v ollama-cli &> /dev/null; then
  success "Ollama CLI installed successfully!"
else
  warning "Ollama CLI not found in PATH. You may need to restart your terminal."
fi

# Create Ollama config file
section "Setting up Ollama configuration"
OLLAMA_CONFIG="$HOME/.ollama_config"

# If in WSL, use host.docker.internal, otherwise use localhost
if [ "$IS_WSL" = true ]; then
  echo "SERVER_URL=http://host.docker.internal:11434" > "$OLLAMA_CONFIG"
  echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> "$OLLAMA_CONFIG"
  echo -e "Configured to connect to Ollama on Windows host via ${GREEN}host.docker.internal${NC}"
else
  echo "SERVER_URL=http://localhost:11434" > "$OLLAMA_CONFIG"
  echo "OLLAMA_BASE_URL=http://localhost:11434" >> "$OLLAMA_CONFIG"
  echo -e "Configured to connect to Ollama on ${GREEN}localhost${NC}"
fi

success "Created Ollama configuration at $OLLAMA_CONFIG"

# Test the connection
section "Testing connection to Ollama"
if [ "$IS_WSL" = true ]; then
  # Test connection to Windows host
  if curl -s http://host.docker.internal:11434/api/tags &> /dev/null; then
    success "Successfully connected to Ollama on Windows host"
  else
    warning "Could not connect to Ollama on Windows host"
    echo "Please make sure Ollama is running on your Windows machine."
    echo "You can test the connection later with: ollama-cli test"
  fi
else
  # Test connection to local Ollama
  if curl -s http://localhost:11434/api/tags &> /dev/null; then
    success "Successfully connected to local Ollama"
  else
    warning "Could not connect to local Ollama"
    echo "Please make sure Ollama is installed and running."
    echo "You can install it with: curl -fsSL https://ollama.com/install.sh | sh"
    echo "You can test the connection later with: ollama-cli test"
  fi
fi

# Final instructions
section "Installation Complete!"
echo "You can now use Term-Code with the following commands:"
echo ""
echo "  tcode                    - Start Term-Code"
echo "  tcode ollama:list        - List available Ollama models"
echo "  tcode ollama:use <model> - Use a specific model"
echo ""
echo "Or use the standalone Ollama CLI:"
echo ""
echo "  ollama-cli list          - List available models"
echo "  ollama-cli server <url>  - Set server URL"
echo "  ollama-cli info <model>  - Get info about a model"
echo ""
echo "For more information, see the documentation in README.md"

echo -e "${GREEN}
Thank you for installing Term-Code!
${NC}" 