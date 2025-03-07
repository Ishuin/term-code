#!/usr/bin/env node

/**
 * post-install.js
 * 
 * This script runs after npm install to set up Term-Code in WSL environment
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}
========================================
  Term-Code WSL Post-Installation Setup
========================================
${colors.reset}`);

try {
  // Check if we're in WSL or Linux
  const isWsl = checkIsWsl();
  if (isWsl) {
    console.log(`${colors.green}✓${colors.reset} Running in WSL environment`);
  } else {
    console.log(`${colors.yellow}!${colors.reset} Running in standard Linux environment`);
  }

  // Set up Ollama configuration
  setupOllamaConfig();
  
  // Make scripts executable
  makeScriptsExecutable();
  
  // Provide final instructions
  showFinalInstructions(isWsl);
  
  console.log(`${colors.green}
Installation completed successfully!
${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}
Error during post-installation: ${error.message}
${colors.reset}`);
  process.exit(1);
}

/**
 * Check if the script is running in WSL
 */
function checkIsWsl() {
  try {
    const release = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return release.includes('microsoft') || release.includes('wsl');
  } catch (error) {
    return false;
  }
}

/**
 * Set up Ollama configuration
 */
function setupOllamaConfig() {
  console.log(`\n${colors.blue}Setting up Ollama configuration...${colors.reset}`);
  
  const configFile = path.join(os.homedir(), '.ollama_config');
  const config = 
`SERVER_URL=http://host.docker.internal:11434
OLLAMA_BASE_URL=http://host.docker.internal:11434
`;
  
  fs.writeFileSync(configFile, config);
  console.log(`${colors.green}✓${colors.reset} Created Ollama configuration at ${configFile}`);
}

/**
 * Make scripts executable
 */
function makeScriptsExecutable() {
  console.log(`\n${colors.blue}Making scripts executable...${colors.reset}`);
  
  try {
    // Get the installation directory
    const installDir = path.resolve(__dirname, '..');
    
    // Make ollama.js executable
    const ollamaJsPath = path.join(installDir, 'ollama.js');
    if (fs.existsSync(ollamaJsPath)) {
      fs.chmodSync(ollamaJsPath, '755');
      console.log(`${colors.green}✓${colors.reset} Made ${ollamaJsPath} executable`);
    }
    
    // Find and make all .sh files executable
    const files = fs.readdirSync(installDir);
    for (const file of files) {
      if (file.endsWith('.sh')) {
        const filePath = path.join(installDir, file);
        fs.chmodSync(filePath, '755');
        console.log(`${colors.green}✓${colors.reset} Made ${filePath} executable`);
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Error making scripts executable: ${error.message}`);
  }
}

/**
 * Show final installation instructions
 */
function showFinalInstructions(isWsl) {
  console.log(`\n${colors.blue}Installation Instructions:${colors.reset}`);
  
  if (isWsl) {
    console.log(`
1. Verify that Ollama is running on your Windows host

2. Test the connection:
   ${colors.yellow}ollama-cli list${colors.reset}

3. Set the Ollama server URL if needed:
   ${colors.yellow}ollama-cli server http://host.docker.internal:11434${colors.reset}

4. Run Term-Code:
   ${colors.yellow}tcode${colors.reset}
   
5. Or run with specific Ollama commands:
   ${colors.yellow}tcode ollama:list${colors.reset}
   ${colors.yellow}tcode ollama:use deepseek-r1:8b${colors.reset}
`);
  } else {
    console.log(`
1. Ensure Ollama is installed and running:
   ${colors.yellow}curl -fsSL https://ollama.com/install.sh | sh${colors.reset}
   ${colors.yellow}ollama serve${colors.reset}

2. Test the connection:
   ${colors.yellow}ollama-cli list${colors.reset}

3. Run Term-Code:
   ${colors.yellow}tcode${colors.reset}
`);
  }
} 