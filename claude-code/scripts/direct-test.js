#!/usr/bin/env node

/**
 * Direct test of Ollama API
 * Bypasses our client implementation completely
 */

import fetch from 'node-fetch';

// Config from command line arguments
const serverUrl = process.argv[2] || 'http://127.0.0.1:11434';

console.log(`Testing direct connection to Ollama at: ${serverUrl}`);

async function main() {
  try {
    // Test version endpoint
    console.log('Testing version endpoint...');
    const versionResponse = await fetch(`${serverUrl}/api/version`);
    
    if (versionResponse.ok) {
      const version = await versionResponse.json();
      console.log(`✅ Ollama version: ${version.version}`);
      
      // Test models endpoint
      console.log('\nTesting models endpoint...');
      const modelsResponse = await fetch(`${serverUrl}/api/tags`);
      
      if (modelsResponse.ok) {
        const models = await modelsResponse.json();
        console.log(`✅ Models available: ${models.models.length}`);
        console.log('Model names:');
        for (const model of models.models) {
          console.log(`- ${model.name}`);
        }
      } else {
        console.error(`❌ Models endpoint failed: ${modelsResponse.status} ${modelsResponse.statusText}`);
      }
    } else {
      console.error(`❌ Version endpoint failed: ${versionResponse.status} ${versionResponse.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 