#!/usr/bin/env node

/**
 * Simple direct script to run Term-Code with Ollama
 * This bypasses any installation issues and runs the CLI directly
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';

// Get script directory (using ES modules approach)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables for Ollama
let ollamaBaseUrl = 'http://host.docker.internal:11434';

// Try to read from .ollama_config file in home directory or current directory
try {
  const homeConfigPath = join(process.env.HOME || process.env.USERPROFILE || '', '.ollama_config');
  const localConfigPath = join(__dirname, '.ollama_config');
  
  if (existsSync(homeConfigPath)) {
    const config = readFileSync(homeConfigPath, 'utf8');
    const match = config.match(/OLLAMA_BASE_URL=(.+)/);
    if (match && match[1]) {
      ollamaBaseUrl = match[1].trim();
      console.log(`Using Ollama config from ${homeConfigPath}`);
    }
  } else if (existsSync(localConfigPath)) {
    const config = readFileSync(localConfigPath, 'utf8');
    const match = config.match(/OLLAMA_BASE_URL=(.+)/);
    if (match && match[1]) {
      ollamaBaseUrl = match[1].trim();
      console.log(`Using Ollama config from ${localConfigPath}`);
    }
  }
} catch (error) {
  console.error(`Warning: Could not read Ollama config: ${error.message}`);
}

// Set environment variables
process.env.OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || ollamaBaseUrl;
process.env.OLLAMA_PROVIDER = 'true'; // Explicitly enable Ollama provider

// Test Ollama connection
async function testOllamaConnection() {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Prepare dist directory and package.json if needed
const distDir = join(__dirname, 'dist');
const distPackageJsonPath = join(distDir, 'package.json');

if (!existsSync(distDir)) {
  console.log('Creating dist directory...');
  mkdirSync(distDir, { recursive: true });
}

if (!existsSync(distPackageJsonPath)) {
  console.log('Creating package.json in dist directory...');
  const packageJson = {
    name: "term-code",
    version: "1.0.0",
    description: "Terminal-based AI coding assistant",
    type: "module",
    dependencies: {
      "node-fetch": "^3.3.2"
    }
  };
  
  writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Ensure node-fetch is installed
try {
  await import('node-fetch');
} catch (error) {
  console.log('Installing node-fetch dependency...');
  spawnSync('npm', ['install', 'node-fetch@3.3.2'], { 
    stdio: 'inherit',
    cwd: __dirname
  });
}

// Display the banner
console.log(`\x1b[34m
===============================
  TERM-CODE with OLLAMA
===============================
\x1b[0m`);

console.log(`\x1b[32m✓\x1b[0m Using Ollama at: ${process.env.OLLAMA_BASE_URL}`);

// Test Ollama connection
const ollamaConnected = await testOllamaConnection();
if (!ollamaConnected) {
  console.log(`\x1b[33m⚠️\x1b[0m Could not connect to Ollama at ${process.env.OLLAMA_BASE_URL}`);
  console.log('Please check that Ollama is running and the server URL is correct.');
}

// Show Ollama-specific help if no arguments provided
if (process.argv.length <= 2) {
  console.log(`
\x1b[33mOllama Commands:\x1b[0m
  ollama:list              List available models
  ollama:server <url>      Set Ollama server URL (default: ${process.env.OLLAMA_BASE_URL})
  ollama:use <model>       Set the active Ollama model
  ollama:info <model>      Get info about a specific model
  
\x1b[33mGeneral Commands:\x1b[0m
  help                     Show all available commands
  ask <question>           Ask a question
  explain <file>           Explain code in a file
  fix <file>               Fix issues in a file
  refactor <file>          Refactor code in a file
  
\x1b[33mExamples:\x1b[0m
  $ tcode ollama:list
  $ tcode ollama:use deepseek-r1:8b
  $ tcode ask "How do I implement quicksort?"
`);
}

// Transform command line arguments for Ollama commands
if (process.argv[2] && process.argv[2].startsWith('ollama:')) {
  const originalCommand = process.argv[2];
  console.log(`\x1b[32m✓\x1b[0m Running Ollama command: ${originalCommand}`);
}

// Run in a subprocess to isolate module loading issues
const cliPath = resolve(__dirname, 'dist', 'cli.js');

if (existsSync(cliPath)) {
  console.log(`\x1b[32m✓\x1b[0m Launching CLI module...`);
  const result = spawnSync('node', [cliPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env
  });
  
  process.exit(result.status || 0);
} else {
  console.error(`\x1b[31m✗\x1b[0m Error: CLI module not found at ${cliPath}`);
  console.error('Please verify your installation or build the project with: npm run build');
  process.exit(1);
} 