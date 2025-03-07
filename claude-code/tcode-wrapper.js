#!/usr/bin/env node

/**
 * Simple wrapper script for Term-Code
 * This avoids the package.json path issues
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables for Ollama
process.env.OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';
process.env.OLLAMA_PROVIDER = 'true';

// Copy package.json to the locations that might be checked
const packageJson = {
  "name": "term-code",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "node-fetch": "^3.3.2"
  }
};

// Ensure dist directory has a package.json
try {
  const distPackageJsonPath = path.join(__dirname, 'dist', 'package.json');
  if (!fs.existsSync(path.dirname(distPackageJsonPath))) {
    fs.mkdirSync(path.dirname(distPackageJsonPath), { recursive: true });
  }
  fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2));
} catch (error) {
  console.error('Warning: Could not write dist/package.json', error.message);
}

// Display header
console.log('\x1b[34m===============================');
console.log('  TERM-CODE with OLLAMA');
console.log('===============================\x1b[0m');
console.log(`\x1b[32m✓\x1b[0m Using Ollama at: ${process.env.OLLAMA_BASE_URL}`);

// Direct execution using Node.js child process
const args = process.argv.slice(2);
const cliPath = path.join(__dirname, 'dist', 'cli.js');

try {
  // Check if the CLI file exists
  if (!fs.existsSync(cliPath)) {
    throw new Error(`CLI file not found: ${cliPath}`);
  }
  
  // Spawn node process to run the CLI directly
  const nodeProcess = spawn('node', [cliPath, ...args], {
    stdio: 'inherit',
    env: process.env
  });
  
  nodeProcess.on('error', (error) => {
    console.error('\x1b[31m✗\x1b[0m Error running Term-Code:', error.message);
    process.exit(1);
  });
  
  nodeProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`\x1b[31m✗\x1b[0m Term-Code exited with code ${code}`);
    }
    process.exit(code);
  });
} catch (error) {
  console.error('\x1b[31m✗\x1b[0m Error running Term-Code:', error.message);
  console.error('\nPossible causes:');
  console.error('1. The project has not been built yet. Try running: npm run build');
  console.error('2. Dependencies might be missing. Try running: npm install node-fetch@3.3.2');
  process.exit(1);
} 