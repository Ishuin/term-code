# Term-Code

**A terminal-based AI coding assistant optimized for Ollama integration in WSL environments**

Term-Code provides a streamlined interface for interacting with AI coding assistants directly from your terminal. While it supports both Claude and Ollama LLMs, it's specially optimized for using Ollama in Windows Subsystem for Linux (WSL) environments.

## Features

- 🤖 **Multi-provider support**: Works with both Claude API and local Ollama models
- 🐧 **WSL optimized**: Specially designed for WSL to Windows host communication
- 💬 **Natural language interface**: Ask questions, explain code, fix bugs, and more
- 🔄 **Code assistance**: Get help with coding tasks in many languages
- 🔧 **Easy configuration**: Simple setup for Ollama server URL and model selection

## WSL Installation

For WSL users, the easiest installation method is:

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

# Set up Ollama configuration
echo "SERVER_URL=http://host.docker.internal:11434" > ~/.ollama_config
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> ~/.ollama_config
```

## Usage

### Basic Commands

```bash
# Ask a question
tcode ask "How do I implement a binary search in Python?"

# Explain code
tcode explain path/to/file.js

# Fix issues in code
tcode fix path/to/file.py
```

### Ollama-specific Commands

```bash
# List available Ollama models
tcode ollama:list

# Set the Ollama server URL (useful for WSL)
tcode ollama:server http://host.docker.internal:11434

# Select a specific model
tcode ollama:use deepseek-r1:8b
```

## Ollama Setup in WSL

Term-Code is designed to work seamlessly with Ollama running on your Windows host. In WSL:

1. Install Ollama on Windows (not in WSL)
2. Configure Term-Code to use `host.docker.internal` to reach the Windows host
3. Use the commands above to interact with your models

## Customization

You can customize the Ollama server URL:

```bash
# Set a custom server URL
echo "SERVER_URL=http://custom-address:11434" > ~/.ollama_config
echo "OLLAMA_BASE_URL=http://custom-address:11434" >> ~/.ollama_config
```

## Troubleshooting

If you encounter issues:

1. **Connection problems**: Ensure Ollama is running on Windows and accessible from WSL
2. **Command not found**: Make sure `~/bin` is in your PATH
3. **Missing dependencies**: Check that `node-fetch` is installed

## License

MIT

## Credits

This project builds upon work by Anthropic's Claude Code research. Adapted for better Ollama integration in WSL environments. 