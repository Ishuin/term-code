#!/usr/bin/env node

/**
 * Simple verification script for Ollama integration
 * Tests core functionality directly without CLI dependencies
 */

import { OllamaClient } from '../dist/ai/providers/ollama/client.js';

// Server URLs to try
const HOST_URL = 'http://host.docker.internal:11434';
const LOCALHOST_URL = 'http://127.0.0.1:11434';

// Function to test a client with a specific URL
async function testOllamaClient(url) {
  console.log(`\n🧪 Testing Ollama connection to: ${url}`);
  
  try {
    // 1. Create client & test connection
    const client = new OllamaClient({ baseUrl: url });
    console.log('📡 Testing connection...');
    const connected = await client.testConnection();
    
    if (!connected) {
      console.log(`❌ Failed to connect to ${url}`);
      return null;
    }
    
    console.log(`✅ Connected to Ollama at ${url}`);
    
    // 2. List models
    console.log('📋 Fetching models...');
    const models = await client.listModels();
    console.log(`✅ Found ${models.models.length} models`);
    
    for (const model of models.models) {
      console.log(`   - ${model.name} (${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`);
    }
    
    // 3. Test configuration update
    console.log('\n🔄 Testing configuration update...');
    console.log(`   Current URL: ${client.config.baseUrl}`);
    client.updateConfig({ baseUrl: url + '/test' });
    console.log(`   Updated URL: ${client.config.baseUrl}`);
    client.updateConfig({ baseUrl: url }); // Restore original
    
    // 4. Test model setting
    if (models.models.length > 0) {
      const testModel = models.models[0].name;
      console.log(`\n🔄 Testing model setting with "${testModel}"...`);
      client.setActiveModel(testModel);
      const activeModel = client.getActiveModel();
      console.log(`   Active model: ${activeModel}`);
      
      if (activeModel === testModel) {
        console.log('✅ Model setting successful');
      } else {
        console.log('❌ Model setting failed');
      }
    }
    
    return client;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

// Try each server URL until we get a connection
async function main() {
  try {
    console.log('🔍 Verifying Ollama integration');
    
    // Try WSL host URL first
    let client = await testOllamaClient(HOST_URL);
    
    // If that fails, try localhost
    if (!client) {
      client = await testOllamaClient(LOCALHOST_URL);
    }
    
    // If we have a working client, show success
    if (client) {
      console.log('\n✅ Ollama integration verified successfully!');
      console.log('   You can now use the following commands:');
      console.log('   - ollama:server <url>  - Set the server URL');
      console.log('   - ollama:list          - List available models');
      console.log('   - ollama:use <model>   - Set the active model');
      console.log('   - ollama:current       - Show the current model');
    } else {
      console.log('\n❌ Failed to connect to any Ollama server');
      console.log('   Please make sure Ollama is running and accessible');
      console.log('   For WSL users: curl http://host.docker.internal:11434/api/version');
      console.log('   For local users: curl http://127.0.0.1:11434/api/version');
    }
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main(); 