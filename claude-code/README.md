# Term-Code

**A terminal-based AI coding assistant optimized for Ollama integration in WSL environments**

Term-Code provides a streamlined command-line interface for interacting with both cloud-based and local AI coding assistants. It's specifically optimized for using Ollama in Windows Subsystem for Linux (WSL), allowing seamless integration between your Linux development environment and Ollama models running on the Windows host.

## Features

- 🤖 **Multi-provider support**: Works with both Claude API and local Ollama models
- 🐧 **WSL optimized**: Special handling for WSL to Windows host communication via `host.docker.internal`
- 💬 **Natural language interface**: Ask questions, explain code, fix bugs, and refactor with simple commands
- 🔄 **Code assistance**: Get help with programming tasks in various languages
- 🛠️ **Robust error handling**: Fixed to gracefully handle connection issues and module resolution
- 🔧 **Easy configuration**: Simple setup with minimal dependencies and support for `.ollama_config` file

## Architecture

Term-Code consists of several key components:

- **run-term-code.js**: Main entry point optimized for Ollama with environment variable setup
- **ollama.js**: Standalone client for direct Ollama API access (using native HTTP/HTTPS modules)
- **term-code script**: Shell script for launching the tool with proper environment configuration
- **Helper scripts**: Various utility scripts for installation and configuration (reinstall.sh, fix-installation.sh)

## WSL Installation

For WSL users, the recommended installation method is:

```bash
# Navigate to the project directory
cd /path/to/term-code/claude-code

# Install dependencies
npm install

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

# Refactor code
tcode refactor path/to/file.ts
```

### Ollama-specific Commands

```bash
# List available models
tcode ollama:list

# Set the Ollama server URL (useful for WSL)
tcode ollama:server http://host.docker.internal:11434

# Select a specific model
tcode ollama:use deepseek-r1:8b

# Get information about a model
tcode ollama:info deepseek-r1:8b
```

## Ollama Setup

Term-Code is designed to work seamlessly with Ollama running on your Windows host:

1. Install Ollama on Windows (not in WSL) from [ollama.ai](https://ollama.ai)
2. Start the Ollama application and pull your desired models
3. Configure Term-Code to use `host.docker.internal` to reach the Windows host
4. Run commands like `tcode ollama:list` to verify connectivity

## Direct Ollama CLI

For quick access to Ollama functionality without the full Term-Code CLI, you can use the included `ollama.js` script:

```bash
# Make it executable
chmod +x ollama.js

# Create a symlink
ln -sf "$(pwd)/ollama.js" ~/bin/ollama-cli
chmod +x ~/bin/ollama-cli

# Use it directly
ollama-cli list
ollama-cli models
ollama-cli help
```

## Troubleshooting

If you encounter issues:

### Connection Problems
- Ensure Ollama is running on your Windows host
- Verify the Ollama server URL in `~/.ollama_config`
- Check if `host.docker.internal` is accessible from WSL with `ping host.docker.internal`

### Command Not Found
- Make sure `~/bin` is in your PATH: `echo $PATH | grep ~/bin`
- Check symlink creation: `ls -la ~/bin/tcode`

### Module Errors
- Ensure `node-fetch` is installed: `npm install node-fetch@3.3.2`
- Check for line ending issues, especially if edited in Windows

### Package.json Issues
- The codebase has been patched to handle package.json path resolution issues in global installations
- If you encounter ES module errors, verify that `"type": "module"` is in your package.json

## Dependencies

- Node.js v18+
- node-fetch v3.3.2 (for API requests)
- @anthropic-ai/claude-code (optional, for Claude API)
- open and uuid libraries

## License

MIT

## Credits

This project builds upon the Claude Code foundation from Anthropic, with specialized adaptations for better Ollama integration in WSL environments. 