# Term-Code: Claude Code Cleanroom with Ollama Integration

**DISCLAIMER:**

This is a cleanroom implementation derived from the Claude Code npm package, extended with Ollama integration for WSL environments.

Learn more about the cleanroom technique at https://ghuntley.com/tradecraft

Claude Code is a product by Anthropic. This is an independent implementation. Do not contact Anthropic regarding this source code.

## About Term-Code

Term-Code is a terminal-based AI coding assistant that helps you code faster by executing routine tasks, explaining complex code, and answering programming questions - all through natural language commands. While it preserves the core functionality of Claude Code, it has been optimized for Ollama integration in Windows Subsystem for Linux (WSL) environments.

### Key Features

- 🤖 **Multi-provider support**: Works with both Claude API and local Ollama models
- 🐧 **WSL optimized**: Special handling for WSL to Windows host communication via `host.docker.internal`
- 💬 **Natural language interface**: Ask questions, explain code, fix bugs, and refactor with simple commands 
- 🔄 **Code assistance**: Get help with programming tasks in various languages
- 🛠️ **Robust error handling**: Gracefully handles connection issues and module resolution
- 🔧 **Easy configuration**: Simple setup with minimal dependencies

### Architecture

Term-Code consists of several key components:

- **run-term-code.js**: Main entry point optimized for Ollama with environment variable setup
- **ollama.js**: Standalone client for direct Ollama API access
- **Helper scripts**: Various utilities for installation and configuration

## Installation & Usage

For detailed installation and usage instructions, please see the [claude-code/README.md](claude-code/README.md) file.

Quick WSL installation:

```bash
# Navigate to the project directory
cd term-code/claude-code

# Make the script executable
chmod +x run-term-code.js

# Create a symlink for easier access
mkdir -p ~/bin
ln -sf "$(pwd)/run-term-code.js" ~/bin/tcode

# Set up Ollama configuration to connect to Windows host
echo "SERVER_URL=http://host.docker.internal:11434" > ~/.ollama_config
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> ~/.ollama_config
```

Use Term-Code with simple commands:

```bash
# Ask coding questions
tcode ask "How do I implement binary search in JavaScript?"

# Work with Ollama models
tcode ollama:list
tcode ollama:use deepseek-r1:8b
```

## Documentation

- [QUICK-START.md](claude-code/QUICK-START.md) - Get up and running quickly
- [INSTALL.md](claude-code/INSTALL.md) - Detailed installation instructions
- [README.md](claude-code/README.md) - Full documentation

## License

MIT

## Credits

This project builds upon the Claude Code foundation from Anthropic, with specialized adaptations for better Ollama integration in WSL environments.
