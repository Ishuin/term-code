#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}
======================================
    Term-Code Rebuild & Reinstall
======================================
${NC}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check for global installations that might conflict
echo -e "\n${BLUE}Checking for global installations...${NC}"
if npm list -g term-code &> /dev/null || [ -d "/usr/local/lib/node_modules/term-code" ]; then
  echo -e "${YELLOW}⚠️ Found global installation that might conflict${NC}"
  echo -e "Uninstalling global package..."
  sudo npm uninstall -g term-code || {
    echo -e "${YELLOW}⚠️ Manual uninstallation may be required${NC}"
    echo -e "Run this command: sudo rm -rf /usr/local/lib/node_modules/term-code"
  }
  echo -e "${GREEN}✓ Removed global package${NC}"
fi

# Check for stale symlinks in /usr/local/bin
echo -e "\n${BLUE}Checking for stale symlinks...${NC}"
if [ -f "/usr/local/bin/tcode" ] || [ -L "/usr/local/bin/tcode" ]; then
  echo -e "${YELLOW}⚠️ Found stale tcode reference in /usr/local/bin${NC}"
  sudo rm -f "/usr/local/bin/tcode"
  echo -e "${GREEN}✓ Removed stale symlink${NC}"
fi

if [ -f "/usr/local/bin/ollama-cli" ] || [ -L "/usr/local/bin/ollama-cli" ]; then
  echo -e "${YELLOW}⚠️ Found stale ollama-cli reference in /usr/local/bin${NC}"
  sudo rm -f "/usr/local/bin/ollama-cli"
  echo -e "${GREEN}✓ Removed stale symlink${NC}"
fi

# Ensure node-fetch is installed
echo -e "\n${BLUE}Installing dependencies...${NC}"
if ! npm list node-fetch | grep -q node-fetch; then
  npm install node-fetch@3.3.2
  echo -e "${GREEN}✓ Installed node-fetch${NC}"
else
  echo -e "${GREEN}✓ node-fetch already installed${NC}"
fi

# Ensure the dist directory exists
if [ ! -d "$SCRIPT_DIR/dist" ]; then
  mkdir -p "$SCRIPT_DIR/dist"
  echo -e "${GREEN}✓ Created dist directory${NC}"
fi

# Create package.json in dist directory
echo -e "\n${BLUE}Creating package.json in dist directory...${NC}"
echo '{
  "name": "term-code",
  "version": "1.0.0",
  "description": "Terminal-based AI coding assistant",
  "type": "module",
  "dependencies": {
    "node-fetch": "^3.3.2"
  }
}' > "$SCRIPT_DIR/dist/package.json"
echo -e "${GREEN}✓ Created dist/package.json${NC}"

# Convert Windows line endings (CRLF) to Unix line endings (LF) for all scripts
echo -e "\n${BLUE}Converting line endings for scripts...${NC}"

# Function to convert CRLF to LF for a file
convert_line_endings() {
  local file="$1"
  if [ -f "$file" ]; then
    echo "Converting $file"
    tr -d '\r' < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
}

# Convert JS files
for jsfile in "$SCRIPT_DIR"/*.js "$SCRIPT_DIR"/scripts/*.js "$SCRIPT_DIR"/dist/*.js; do
  if [ -f "$jsfile" ]; then
    convert_line_endings "$jsfile"
  fi
done

# Convert shell scripts
for shfile in "$SCRIPT_DIR"/*.sh "$SCRIPT_DIR"/term-code "$SCRIPT_DIR"/ollama-cli "$SCRIPT_DIR"/tcode-local; do
  if [ -f "$shfile" ]; then
    convert_line_endings "$shfile"
  fi
done

echo -e "${GREEN}✓ Converted line endings for all scripts${NC}"

# Make scripts executable
echo -e "\n${BLUE}Setting file permissions...${NC}"
chmod +x "$SCRIPT_DIR/run-term-code.js"
chmod +x "$SCRIPT_DIR/ollama-cli.sh"
chmod +x "$SCRIPT_DIR/ollama.js"
chmod +x "$SCRIPT_DIR/term-code"
chmod +x "$SCRIPT_DIR/tcode-local"
echo -e "${GREEN}✓ Made scripts executable${NC}"

# Set up symlinks
echo -e "\n${BLUE}Setting up symlinks...${NC}"
mkdir -p "$HOME/bin"

# Use absolute paths for symlinks
ln -sf "$SCRIPT_DIR/run-term-code.js" "$HOME/bin/tcode"
ln -sf "$SCRIPT_DIR/ollama-cli.sh" "$HOME/bin/ollama-cli"
chmod +x "$HOME/bin/tcode" "$HOME/bin/ollama-cli"
echo -e "${GREEN}✓ Created symlinks in ~/bin${NC}"

# Ensure bin directory is in path (and comes BEFORE /usr/local/bin)
echo -e "\n${BLUE}Configuring PATH...${NC}"
if [ -f "$HOME/.bashrc" ]; then
  # Remove any existing ~/bin PATH entry to avoid duplication
  sed -i '/export PATH="\$HOME\/bin:\$PATH"/d' "$HOME/.bashrc"
  
  # Add ~/bin to the beginning of PATH
  echo 'export PATH="$HOME/bin:$PATH"' >> "$HOME/.bashrc"
  echo -e "${GREEN}✓ Updated PATH in ~/.bashrc${NC}"
  echo -e "${YELLOW}⚠️ Run the following command to apply changes:${NC}"
  echo -e "   ${YELLOW}source ~/.bashrc${NC}"
fi

# Create a hash reset to force bash to look for commands again
echo -e "\n${BLUE}Resetting command hash...${NC}"
echo 'hash -r' >> "$HOME/.bashrc"
echo -e "${GREEN}✓ Added hash reset to ~/.bashrc${NC}"

# Set up Ollama configuration
echo -e "\n${BLUE}Setting up Ollama configuration...${NC}"
echo "SERVER_URL=http://host.docker.internal:11434" > "$HOME/.ollama_config"
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> "$HOME/.ollama_config"
echo -e "${GREEN}✓ Created/updated Ollama configuration${NC}"

# Test Ollama connection
echo -e "\n${BLUE}Testing Ollama connection...${NC}"
if curl -s http://host.docker.internal:11434/api/tags > /dev/null; then
  echo -e "${GREEN}✓ Connected to Ollama successfully${NC}"
else
  echo -e "${YELLOW}⚠️ Could not connect to Ollama. Make sure it's running.${NC}"
fi

# Fix shebang lines in JS files to use proper node path
echo -e "\n${BLUE}Fixing shebang lines...${NC}"
for jsfile in "$SCRIPT_DIR"/*.js "$SCRIPT_DIR"/scripts/*.js; do
  if [ -f "$jsfile" ] && head -n 1 "$jsfile" | grep -q "^#!"; then
    # Replace shebang line with correct path
    sed -i '1s|^#!.*$|#!/usr/bin/env node|' "$jsfile"
  fi
done
echo -e "${GREEN}✓ Fixed shebang lines${NC}"

echo -e "\n${GREEN}Installation complete!${NC}"
echo -e "\n${RED}IMPORTANT:${NC} You MUST run this command to apply changes:"
echo -e "  ${YELLOW}source ~/.bashrc${NC}"
echo -e "\nThen you can use Term-Code with the following commands:"
echo -e "  ${YELLOW}tcode${NC}         - Run the main Term-Code application"
echo -e "  ${YELLOW}tcode ollama:list${NC} - List available Ollama models"
echo -e "  ${YELLOW}tcode ollama:server <url>${NC} - Configure Ollama server URL"
echo -e "  ${YELLOW}ollama-cli list${NC} - List models using simple CLI"

# Create a temporary script that uses the direct path
echo -e "\n${BLUE}Creating direct execution script...${NC}"
cat > "$HOME/bin/direct-tcode" << EOF
#!/bin/bash
echo "Running Term-Code directly..."
# Use the term-code script with full path
"$SCRIPT_DIR/term-code" "\$@"
EOF
chmod +x "$HOME/bin/direct-tcode"
echo -e "${GREEN}✓ Created direct-tcode command${NC}"
echo -e "\nAlternatively, you can try these commands:"
echo -e "  ${YELLOW}$HOME/bin/direct-tcode${NC}"
echo -e "  ${YELLOW}$SCRIPT_DIR/term-code${NC}" 