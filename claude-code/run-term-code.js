#!/usr/bin/env node

/**
 * Term-Code with Ollama Integration
 * 
 * This script provides both interactive and single-command modes for the
 * Terminal-based AI coding assistant with Ollama integration.
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { createInterface } from 'readline';

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
process.env.TERM_CODE_PROVIDER = 'ollama'; // Set provider for modular interface

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

// Determine whether to run in interactive mode
const isInteractiveMode = process.argv.includes('--interactive') || process.argv.includes('-i');

// Show help if no arguments provided and not in interactive mode
if (process.argv.length <= 2 && !isInteractiveMode) {
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
  
\x1b[33mRunning Modes:\x1b[0m
  --interactive, -i        Run in interactive chat mode

\x1b[33mExamples:\x1b[0m
  $ tcode ollama:list
  $ tcode ollama:use deepseek-r1:8b
  $ tcode ask "How do I implement quicksort?"
  $ tcode --interactive    Start in interactive chat mode
`);
  process.exit(0);
}

// Create a simple interactive terminal interface if in interactive mode
if (isInteractiveMode) {
  console.log(`\x1b[32m✓\x1b[0m Starting interactive chat mode...\n`);
  
  // Run the CLI module with initial 'help' command to show available commands
  const cliPath = resolve(__dirname, 'dist', 'cli.js');
  
  if (existsSync(cliPath)) {
    console.log(`\x1b[32m✓\x1b[0m Launching CLI module...\n`);
    
    // First show the help to display available commands
    spawnSync('node', [cliPath, 'help'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Create an interactive session
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'ollama-code> '
    });
    
    console.log('\n\x1b[32m✓\x1b[0m Interactive mode started. Type your questions or commands below:');
    console.log('\x1b[33m✓\x1b[0m Type "exit" or "quit" to end the session\n');
    
    rl.prompt();
    
    rl.on('line', (line) => {
      const input = line.trim();
      
      if (input === 'exit' || input === 'quit' || input === 'q') {
        console.log('Exiting interactive mode...');
        rl.close();
        process.exit(0);
      }
      
      if (input === '') {
        rl.prompt();
        return;
      }
      
      // Parse input into command and args
      const parts = input.split(' ');
      const command = parts[0];
      const args = parts.slice(1);
      
      // Run the command
      const result = spawnSync('node', [cliPath, command, ...args], {
        stdio: 'inherit',
        env: process.env
      });
      
      rl.prompt();
    });
    
    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  } else {
    console.error(`\x1b[31m✗\x1b[0m Error: CLI module not found at ${cliPath}`);
    console.error('Please verify your installation or build the project with: npm run build');
    process.exit(1);
  }
} else {
  // Filter out interactive flags
  let args = process.argv.slice(2).filter(arg => arg !== '--interactive' && arg !== '-i');
  
  if (args.length > 0) {
    console.log(`\x1b[32m✓\x1b[0m Running command: ${args.join(' ')}`);
  }
  
  // Run the CLI module for a single command
  const cliPath = resolve(__dirname, 'dist', 'cli.js');
  
  if (existsSync(cliPath)) {
    console.log(`\x1b[32m✓\x1b[0m Launching CLI module...`);
    const result = spawnSync('node', [cliPath, ...args], {
      stdio: 'inherit',
      env: process.env
    });
    
    process.exit(result.status || 0);
  } else {
    console.error(`\x1b[31m✗\x1b[0m Error: CLI module not found at ${cliPath}`);
    console.error('Please verify your installation or build the project with: npm run build');
    process.exit(1);
  }
} 