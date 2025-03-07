#!/usr/bin/env node

/**
 * Direct Ollama Interaction Script
 * 
 * This is a standalone script that directly interacts with Ollama API
 * without going through the command framework.
 */
import fetch from 'node-fetch';

// Get command line arguments
const command = process.argv[2];
const arg = process.argv[3];

// Default URL
const DEFAULT_URL = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';

/**
 * Execute the command
 */
async function main() {
  console.log(`Ollama API URL: ${DEFAULT_URL}`);
  
  if (!command) {
    console.log('Available commands:');
    console.log('  server <url>     - Set the server URL');
    console.log('  list             - List available models');
    console.log('  info <model>     - Get info about a model');
    console.log('\nExample: node direct-ollama.js list');
    return;
  }
  
  try {
    switch (command) {
      case 'server':
        const url = arg || DEFAULT_URL;
        console.log(`Setting server URL to: ${url}`);
        // For server command, we just test the connection
        await testConnection(url);
        break;
        
      case 'list':
        await listModels();
        break;
        
      case 'info':
        if (!arg) {
          console.error('Error: Model name is required');
          console.log('Usage: node direct-ollama.js info <model_name>');
          return;
        }
        await getModelInfo(arg);
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run without arguments to see available commands');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Test connection to Ollama
 */
async function testConnection(url) {
  try {
    const response = await fetch(`${url}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
    }
    
    console.log('✅ Successfully connected to Ollama API!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * List available models
 */
async function listModels() {
  try {
    const response = await fetch(`${DEFAULT_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.models && data.models.length > 0) {
      console.log(`\nAvailable models (${data.models.length}):`);
      console.log('----------------------------------------------');
      console.log('| Model Name          | Size (GB) | Parameters |');
      console.log('----------------------------------------------');
      
      for (const model of data.models) {
        const sizeMB = model.size || 0;
        const sizeGB = (sizeMB / 1024 / 1024 / 1024).toFixed(2);
        const params = model.details?.parameter_size || 'Unknown';
        console.log(`| ${model.name.padEnd(20)} | ${sizeGB.padEnd(9)} | ${params.padEnd(10)} |`);
      }
      
      console.log('----------------------------------------------');
    } else {
      console.log('No models found');
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

/**
 * Get info about a specific model
 */
async function getModelInfo(modelName) {
  try {
    // First get all models
    const response = await fetch(`${DEFAULT_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.models) {
      throw new Error('Failed to get models list');
    }
    
    // Find the requested model
    const model = data.models.find(m => m.name === modelName);
    
    if (!model) {
      console.error(`Model '${modelName}' not found`);
      return;
    }
    
    // Display model details
    console.log(`\nModel: ${model.name}`);
    console.log(`Size: ${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Modified: ${model.modified_at}`);
    
    if (model.details) {
      console.log('\nDetails:');
      console.log(`Family: ${model.details.family || 'Unknown'}`);
      console.log(`Parameters: ${model.details.parameter_size || 'Unknown'}`);
      console.log(`Quantization: ${model.details.quantization_level || 'None'}`);
      console.log(`Format: ${model.details.format || 'Unknown'}`);
    }
  } catch (error) {
    console.error('Error getting model info:', error.message);
  }
}

// Run the main function
main(); 