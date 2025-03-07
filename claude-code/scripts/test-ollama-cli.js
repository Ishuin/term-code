#!/usr/bin/env node

/**
 * Test script for Ollama CLI commands
 * This script will call the CLI directly to test commands
 */

import { spawn } from 'child_process';
import { join } from 'path';

// Server URL to test - use host.docker.internal for WSL
const serverUrl = process.argv[2] || 'http://host.docker.internal:11434';

console.log(`Testing Ollama CLI with server URL: ${serverUrl}`);

// Function to run CLI commands
function runCliCommand(args) {
  return new Promise((resolve, reject) => {
    const cliPath = join(process.cwd(), 'dist', 'cli.js');
    console.log(`Running: node ${cliPath} ${args.join(' ')}`);
    
    const child = spawn('node', [cliPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Run a sequence of commands to test Ollama integration
async function main() {
  try {
    // 1. Set the server URL
    console.log('\n=== Setting Ollama server URL ===');
    await runCliCommand(['ollama:server', serverUrl]);
    
    // 2. List available models
    console.log('\n=== Listing Ollama models ===');
    await runCliCommand(['ollama:list']);
    
    // 3. Show the current model
    console.log('\n=== Showing current model ===');
    await runCliCommand(['ollama:current']);
    
    console.log('\n✅ CLI test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main(); 