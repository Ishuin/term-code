#!/usr/bin/env node

/**
 * Simple test script for Ollama integration
 * This bypasses the CLI layer and directly tests the Ollama client
 */

import { OllamaClient } from '../dist/ai/providers/ollama/client.js';

// Config from command line arguments
const serverUrl = process.argv[2];
const modelName = process.argv[3] || 'deepseek-r1:8b';

// URLs to try in order if no command line argument is provided
const urlsToTry = serverUrl ? [serverUrl] : [
  'http://host.docker.internal:11434',
  'http://127.0.0.1:11434',
  'http://localhost:11434'
];

console.log(`Will try connecting to Ollama at: ${urlsToTry.join(', ')}`);
console.log(`Using model: ${modelName}`);

async function tryConnect(url) {
  console.log(`\nTrying connection to: ${url}`);
  try {
    const client = new OllamaClient({ baseUrl: url }, modelName);
    const connected = await client.testConnection();
    
    if (connected) {
      console.log(`✅ Successfully connected to Ollama at ${url}!`);
      return client;
    } else {
      console.log(`❌ Failed to connect to ${url}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error connecting to ${url}: ${error.message}`);
    return null;
  }
}

async function main() {
  let client = null;
  
  // Try each URL until one works
  for (const url of urlsToTry) {
    client = await tryConnect(url);
    if (client) break;
  }
  
  if (!client) {
    console.error('❌ Failed to connect to any Ollama server');
    process.exit(1);
  }
  
  try {
    // List models
    const models = await client.listModels();
    console.log(`\nAvailable models (${models.models.length}):`);
    
    // Display models in a simple table
    console.log('----------------------------------------------');
    console.log('| Model Name | Size | Parameters |');
    console.log('----------------------------------------------');
    
    for (const model of models.models) {
      const sizeGB = (model.size / (1024 * 1024 * 1024)).toFixed(2);
      console.log(`| ${model.name.padEnd(20)} | ${sizeGB.padEnd(6)} GB | ${(model.details.parameter_size || 'Unknown').padEnd(10)} |`);
    }
    console.log('----------------------------------------------');
    
    // Generate a simple test completion
    console.log('\nGenerating a test completion...');
    const result = await client.generateCompletion({
      messages: [{ role: 'user', content: 'What are the benefits of TypeScript?' }]
    });
    
    console.log('\n=== Response ===');
    console.log(result.text);
    console.log('================');
    console.log(`\nTokens used: ${result.usage?.totalTokens || 'Unknown'}`);
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 