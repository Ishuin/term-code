# Term-Code Installation Guide

This guide covers how to install Term-Code with an emphasis on WSL (Windows Subsystem for Linux) environments using Ollama.

## Prerequisites

- **Windows with WSL**: Windows 10 or higher with WSL2 installed
- **Ollama**: Installed on your Windows host (not within WSL)
- **Node.js**: v18 or higher installed in WSL environment

## Installation in WSL

Follow these steps to install Term-Code in WSL with Ollama integration:

### Step 1: Prepare Your Environment

Ensure Node.js is installed in your WSL environment:

```bash
# Check Node.js version
node -v

# If not installed or below v18, install it
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Ensure Ollama is running on your Windows host (not in WSL):

1. Download and install Ollama from [ollama.ai](https://ollama.ai)
2. Start the Ollama application on Windows
3. Pull a model like `deepseek-r1:8b` through the Windows app or command line

### Step 2: Set Up Term-Code

Clone or download the Term-Code repository and navigate to it:

```bash
cd /path/to/term-code/claude-code

# Install dependencies
npm install
```

### Step 3: Configure the Command Line Tool

Create symbolic links for easy access:

```bash
# Create bin directory if it doesn't exist
mkdir -p ~/bin

# Make scripts executable
chmod +x run-term-code.js
chmod +x ollama-cli.sh

# Create symbolic links
ln -sf "$(pwd)/run-term-code.js" ~/bin/tcode
ln -sf "$(pwd)/ollama-cli.sh" ~/bin/ollama-cli
chmod +x ~/bin/tcode ~/bin/ollama-cli

# Ensure ~/bin is in your PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Step 4: Configure Ollama Connection

Create the Ollama configuration to connect to the Windows host:

```bash
# Set the Ollama server URL to point to the Windows host
echo "SERVER_URL=http://host.docker.internal:11434" > ~/.ollama_config
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> ~/.ollama_config
```

### Step 5: Test the Installation

Verify that Term-Code can connect to Ollama:

```bash
# List available models
tcode ollama:list

# Test with a simple question
tcode ask "Hello, how are you?"
```

## Alternative Installation Methods

### Using the Fix Installation Script

If you encounter issues with the manual installation, you can use the provided fix script:

```bash
# Navigate to the project directory
cd /path/to/term-code/claude-code

# Make the script executable
chmod +x fix-installation.sh

# Run the installation fix script
./fix-installation.sh
```

### Direct Execution

You can always run the script directly without installation:

```bash
# From the project directory
node /path/to/term-code/claude-code/run-term-code.js ask "Your question here"
```

## Troubleshooting

### Common Issues

1. **Command Not Found**:
   - Make sure ~/bin is in your PATH
   - Verify the symbolic links are correctly created

2. **Connection Errors**:
   - Ensure Ollama is running on your Windows host
   - Check if host.docker.internal is resolving correctly in your WSL environment

3. **Module Not Found Errors**:
   - Install node-fetch directly: `npm install node-fetch@3.3.2`

4. **Line Ending Issues**:
   - If you see strange errors, they might be due to Windows line endings
   - Run: `sed -i 's/\r$//' run-term-code.js` to fix line endings

### Verifying WSL Configuration

Ensure WSL is properly configured:

```bash
# Check WSL version
wsl --list --verbose

# Should show version 2 for your distro
```

## Next Steps

After installation, refer to the [QUICK-START.md](QUICK-START.md) guide for usage examples. 