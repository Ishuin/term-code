#!/bin/bash

# start-ollama.sh
# Script to start Ollama and launch Term-Code

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

echo "🚀 Starting Ollama for Term-Code..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    error "Ollama is not installed in your system."
    echo "Please run setup-ollama.sh first to install Ollama."
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://host.docker.internal:11434/api/tags &> /dev/null; then
    echo "Starting Ollama service..."
    nohup ollama serve &> /dev/null &
    
    # Wait for Ollama to start
    echo "Waiting for Ollama to start..."
    MAX_RETRIES=10
    COUNT=0
    while [ $COUNT -lt $MAX_RETRIES ]; do
        if curl -s http://host.docker.internal:11434/api/tags &> /dev/null; then
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
else
    success "Ollama is already running"
fi

# List available models
echo "Available models:"
curl -s http://host.docker.internal:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d':' -f2 | tr -d '"' | sort

# Check if Term-Code is installed
if command -v tcode &> /dev/null; then
    # Global installation
    echo ""
    echo "Starting Term-Code with Ollama integration..."
    export OLLAMA_BASE_URL=http://host.docker.internal:11434
    
    # Run Term-Code with any passed arguments
    tcode "$@"
elif [ -x "./tcode-local" ]; then
    # Local installation
    echo ""
    echo "Starting Term-Code (local) with Ollama integration..."
    export OLLAMA_BASE_URL=http://host.docker.internal:11434
    
    # Run local Term-Code with any passed arguments
    ./tcode-local "$@"
else
    error "Term-Code is not installed or not found in the current directory."
    echo "Please run setup-ollama.sh first to install Term-Code."
    exit 1
fi 