#!/bin/bash

# setup-ollama.sh
# Unified setup script for Term-Code + Ollama integration
# This script handles all aspects of setting up Term-Code with Ollama

set -e # Exit on error

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE="$HOME/.ollama_config"
DEFAULT_OLLAMA_URL="http://host.docker.internal:11434"
DEFAULT_MODEL="deepseek-r1:8b"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/bin"

# Print a section header
section() {
  echo ""
  echo -e "${BLUE}==== $1 ====${NC}"
  echo ""
}

# Print a success message
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Print a warning message
warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# Print an error message
error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if Term-Code is globally installed, install if not
check_term_code() {
  section "Checking Term-Code Installation"
  
  if ! command -v tcode &> /dev/null; then
    warning "Term-Code is not installed globally"
    read -p "Would you like to install Term-Code globally? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Installing Term-Code globally..."
      if [[ -d "$SCRIPT_DIR/node_modules" && -f "$SCRIPT_DIR/package.json" ]]; then
        # Install from local directory
        npm install -g "$SCRIPT_DIR"
      else
        # Install from npm
        npm install -g term-code
      fi
      
      if command -v tcode &> /dev/null; then
        success "Term-Code installed successfully"
      else
        error "Failed to install Term-Code"
        exit 1
      fi
    else
      warning "Continuing without global installation"
      warning "You'll need to run Term-Code from this directory using: ./tcode-local"
      
      # Create a local executable
      NODE_PATH=$(which node)
      echo '#!/usr/bin/env bash' > "$SCRIPT_DIR/tcode-local"
      echo "exec $NODE_PATH $SCRIPT_DIR/dist/cli.js \"\$@\"" >> "$SCRIPT_DIR/tcode-local"
      chmod +x "$SCRIPT_DIR/tcode-local"
      success "Created local executable: tcode-local"
    fi
  else
    success "Term-Code is already installed globally"
  fi
}

# Check if Ollama is installed, install if not
check_ollama() {
  section "Checking Ollama Installation"
  
  if ! command -v ollama &> /dev/null; then
    warning "Ollama is not installed"
    read -p "Would you like to install Ollama? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Installing Ollama..."
      curl -fsSL https://ollama.com/install.sh | sh
      
      if command -v ollama &> /dev/null; then
        success "Ollama installed successfully"
      else
        error "Failed to install Ollama"
        exit 1
      fi
    else
      error "Ollama is required for Term-Code to function properly"
      exit 1
    fi
  else
    success "Ollama is already installed"
  fi
}

# Start Ollama if not running
start_ollama() {
  section "Starting Ollama Service"
  
  if curl -s "$DEFAULT_OLLAMA_URL/api/tags" &> /dev/null; then
    success "Ollama is already running"
  else
    echo "Starting Ollama service..."
    nohup ollama serve &> /dev/null &
    
    # Wait for Ollama to start
    echo "Waiting for Ollama to start..."
    MAX_RETRIES=10
    COUNT=0
    while [ $COUNT -lt $MAX_RETRIES ]; do
      if curl -s "$DEFAULT_OLLAMA_URL/api/tags" &> /dev/null; then
        success "Ollama is now running!"
        break
      fi
      
      echo "  Attempt $((COUNT+1))/$MAX_RETRIES..."
      sleep 2
      COUNT=$((COUNT+1))
    done
    
    if [ $COUNT -eq $MAX_RETRIES ]; then
      error "Failed to start Ollama. Please check logs or start it manually."
      exit 1
    fi
  fi
}

# Pull recommended models
pull_models() {
  section "Setting Up Ollama Models"
  
  # Check for existing models
  if curl -s "$DEFAULT_OLLAMA_URL/api/tags" | grep -q "$DEFAULT_MODEL"; then
    success "Default model $DEFAULT_MODEL is already installed"
  else
    echo "Pulling recommended model: $DEFAULT_MODEL"
    echo "This may take some time depending on your internet connection..."
    
    if ollama pull "$DEFAULT_MODEL"; then
      success "Model $DEFAULT_MODEL pulled successfully"
    else
      warning "Failed to pull $DEFAULT_MODEL model"
      warning "You can try again later with: ollama pull $DEFAULT_MODEL"
    fi
  fi
  
  # List available models
  echo "Available models:"
  curl -s "$DEFAULT_OLLAMA_URL/api/tags" | grep -o '"name":"[^"]*"' | cut -d':' -f2 | tr -d '"' | sort
}

# Configure Term-Code for Ollama
configure_term_code() {
  section "Configuring Term-Code for Ollama"
  
  # Save Ollama configuration
  echo "SERVER_URL=$DEFAULT_OLLAMA_URL" > "$CONFIG_FILE"
  success "Saved Ollama configuration to $CONFIG_FILE"
  
  # Create bin directory if it doesn't exist
  mkdir -p "$BIN_DIR"
  
  # Add to PATH if needed
  if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "Adding $BIN_DIR to PATH"
    
    # Determine shell configuration file
    if [[ -f "$HOME/.bashrc" ]]; then
      SHELL_CONFIG="$HOME/.bashrc"
    elif [[ -f "$HOME/.zshrc" ]]; then
      SHELL_CONFIG="$HOME/.zshrc"
    else
      warning "Could not determine shell configuration file"
      warning "Please add the following line to your shell configuration manually:"
      echo 'export PATH="$HOME/bin:$PATH"'
      echo 'export OLLAMA_BASE_URL="'"$DEFAULT_OLLAMA_URL"'"'
      return
    fi
    
    # Add to PATH in shell configuration
    echo >> "$SHELL_CONFIG"
    echo '# Term-Code configuration' >> "$SHELL_CONFIG"
    echo 'export PATH="$HOME/bin:$PATH"' >> "$SHELL_CONFIG"
    echo 'export OLLAMA_BASE_URL="'"$DEFAULT_OLLAMA_URL"'"' >> "$SHELL_CONFIG"
    
    success "Updated $SHELL_CONFIG"
    warning "Please run 'source $SHELL_CONFIG' or restart your terminal to apply changes"
  else
    success "$BIN_DIR is already in PATH"
  fi
  
  # Create a convenience script to start Term-Code with Ollama
  cat > "$BIN_DIR/term-code" << EOF
#!/bin/bash

# Start Term-Code with Ollama configuration
export OLLAMA_BASE_URL="$DEFAULT_OLLAMA_URL"
tcode "\$@"
EOF

  chmod +x "$BIN_DIR/term-code"
  success "Created convenience script: $BIN_DIR/term-code"
}

# Show usage instructions
show_instructions() {
  section "Setup Complete! Next Steps:"
  
  echo "1. Apply PATH changes:"
  if [[ -f "$HOME/.bashrc" ]]; then
    echo "   source ~/.bashrc"
  elif [[ -f "$HOME/.zshrc" ]]; then
    echo "   source ~/.zshrc"
  fi
  
  echo ""
  echo "2. Test your Ollama connection:"
  if command -v tcode &> /dev/null; then
    echo "   tcode ollama:list"
  else
    echo "   ./tcode-local ollama:list"
  fi
  
  echo ""
  echo "3. Start using Term-Code with Ollama!"
  if command -v tcode &> /dev/null; then
    echo "   tcode"
  else
    echo "   ./tcode-local"
  fi
  
  echo ""
  echo "For more information, see the documentation:"
  echo "  - INSTALL.md: Installation instructions"
  echo "  - OLLAMA.md: Ollama integration details"
  echo "  - README.md: General usage information"
}

# Main script
main() {
  echo "🚀 Term-Code + Ollama Setup"
  echo "This script will set up Term-Code with Ollama integration"
  
  check_term_code
  check_ollama
  start_ollama
  pull_models
  configure_term_code
  show_instructions
}

main 