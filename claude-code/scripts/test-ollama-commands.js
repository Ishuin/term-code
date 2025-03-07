#!/usr/bin/env node

/**
 * Test script for Ollama commands
 * This script directly tests the Ollama command handlers without going through the CLI
 */

import { setServerCommand, listModelsCommand, showModelCommand } from '../dist/commands/ollama.js';

// Server URL to test - use host.docker.internal for WSL
const serverUrl = process.argv[2] || 'http://host.docker.internal:11434';

console.log(`Testing Ollama commands with server URL: ${serverUrl}`);

// Mock terminal for testing
const terminal = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  emphasize: (msg) => console.log(`[EMPHASIS] ${msg}`),
  table: (data, options) => {
    console.log(`[TABLE] ${options?.header?.join(' | ') || ''}`);
    data.forEach(row => console.log(`  ${row.join(' | ')}`));
  }
};

// Run a sequence of commands to test Ollama integration
async function main() {
  try {
    // 1. Set the server URL
    console.log('\n=== Setting Ollama server URL ===');
    await setServerCommand.handler({
      _: [serverUrl],
      _terminal: terminal
    });
    
    // 2. List available models
    console.log('\n=== Listing Ollama models ===');
    await listModelsCommand.handler({
      _terminal: terminal
    });
    
    // 3. Show the current model
    console.log('\n=== Showing current model ===');
    await showModelCommand.handler({
      _terminal: terminal
    });
    
    console.log('\n✅ Command test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main(); 