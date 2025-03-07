# Term-Code Quick Start Guide

This quick start guide will help you get up and running with Term-Code in a WSL environment, specifically optimized for Ollama integration.

## Prerequisites

- Windows with WSL installed
- Ollama installed on your Windows host (not in WSL)
- Node.js v18+ installed in your WSL environment

## Installation

Follow these steps to install Term-Code:

```bash
# Navigate to the project directory
cd /path/to/term-code/claude-code

# Make the script executable
chmod +x run-term-code.js

# Create a symlink for easier access
mkdir -p ~/bin
ln -sf "$(pwd)/run-term-code.js" ~/bin/tcode
chmod +x ~/bin/tcode

# Ensure ~/bin is in your PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Set up Ollama configuration to connect to Windows host
echo "SERVER_URL=http://host.docker.internal:11434" > ~/.ollama_config
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> ~/.ollama_config
```

## Testing Your Installation

After installation, test if Term-Code can connect to Ollama:

```bash
# Check if Ollama is accessible
tcode ollama:list
```

If you see a list of models, the connection is working properly. If not, make sure Ollama is running on your Windows host.

## Basic Usage

Here are some common commands to get started:

### Ollama Commands

```bash
# List available models
tcode ollama:list

# Set the Ollama server URL (if different from default)
tcode ollama:server http://host.docker.internal:11434

# Use a specific model
tcode ollama:use deepseek-r1:8b

# Get information about a model
tcode ollama:info deepseek-r1:8b
```

### AI Assistance Commands

```bash
# Ask a coding question
tcode ask "How do I implement a binary search tree in JavaScript?"

# Explain a code file
tcode explain path/to/file.js

# Fix issues in a code file
tcode fix path/to/file.py

# Refactor a code file
tcode refactor path/to/file.ts --focus=performance
```

## Common Issues

### Connection Problems

If you can't connect to Ollama, check:

1. Is Ollama running on your Windows host?
2. Is the URL correct in your ~/.ollama_config file?
3. Can you ping host.docker.internal from WSL?

### Command Not Found

If you get "command not found" when running `tcode`:

1. Make sure the symlink was created correctly in ~/bin
2. Ensure ~/bin is in your PATH (`echo $PATH`)
3. Try running with the full path: `~/bin/tcode`

### Missing Dependencies

If you get module errors:

```bash
# Install node-fetch directly
npm install node-fetch@3.3.2
```

## Next Steps

For more advanced usage and customization options, refer to the main [README.md](README.md) file. 