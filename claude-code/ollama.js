#!/usr/bin/env node

/**
 * Direct Ollama Command-line Interface
 * For quick access to Ollama functionality without the full Term-Code CLI
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG_FILE = os.homedir() + '/.ollama_config';
let SERVER_URL = 'http://host.docker.internal:11434';  // Changed from localhost to host.docker.internal for WSL

// Read config if exists
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const serverLine = config.split('\n').find(line => line.startsWith('SERVER_URL='));
    if (serverLine) {
      SERVER_URL = serverLine.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('Error reading config:', error.message);
}

// Helper function to make HTTP requests
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SERVER_URL);
    const options = {
      method,
      headers: {}
    };
    
    if (data) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Format file size
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

// Commands
const commands = {
  list: async () => {
    try {
      const response = await makeRequest('/api/tags');
      
      if (!response.models || response.models.length === 0) {
        console.log('No models found.');
        return;
      }
      
      console.log('\nAvailable models:');
      console.log('--------------------------------------------------');
      console.log('Name                      | Size     | Modified   ');
      console.log('--------------------------------------------------');
      
      response.models.forEach(model => {
        const size = formatSize(model.size);
        const modified = new Date(model.modified).toLocaleDateString();
        console.log(`${model.name.padEnd(25)} | ${size.padEnd(9)} | ${modified}`);
      });
      
      console.log('--------------------------------------------------');
    } catch (error) {
      console.error('Error listing models:', error.message);
    }
  },
  
  info: async (model) => {
    if (!model) {
      console.error('Error: Model name is required');
      return;
    }
    
    try {
      const response = await makeRequest('/api/show', 'POST', { name: model });
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(`Error getting info for model ${model}:`, error.message);
    }
  },
  
  use: async (model) => {
    if (!model) {
      console.error('Error: Model name is required');
      return;
    }
    
    try {
      // We're just setting it as the default model
      // A real implementation would need to interact with the Term-Code config
      console.log(`Setting ${model} as the active model`);
      console.log(`To use this model in Term-Code, run: tcode ollama:use ${model}`);
    } catch (error) {
      console.error(`Error setting model ${model}:`, error.message);
    }
  },
  
  server: async (url) => {
    if (!url) {
      console.log(`Current Ollama server URL: ${SERVER_URL}`);
      return;
    }
    
    try {
      fs.writeFileSync(CONFIG_FILE, `SERVER_URL=${url}\n`);
      console.log(`Server URL set to: ${url}`);
      SERVER_URL = url;
      
      // Test connection
      await commands.test();
    } catch (error) {
      console.error('Error saving server URL:', error.message);
    }
  },
  
  test: async () => {
    try {
      await makeRequest('/api/tags');
      console.log(`✅ Successfully connected to Ollama server at ${SERVER_URL}`);
    } catch (error) {
      console.error(`❌ Failed to connect to Ollama server at ${SERVER_URL}`);
      console.error(`   Error: ${error.message}`);
      console.error('\nPossible solutions:');
      console.error('1. Make sure Ollama is running');
      console.error('2. Check the server URL (try "server http://host.docker.internal:11434")');
      console.error('3. If running in WSL, check Windows Firewall settings');
    }
  },
  
  help: () => {
    console.log('\nOllama Command-line Interface\n');
    console.log('Usage:');
    console.log('  node ollama.js <command> [args]\n');
    console.log('Commands:');
    console.log('  list           - List available models');
    console.log('  info <model>   - Get information about a specific model');
    console.log('  use <model>    - Set a model as active');
    console.log('  server <url>   - Set the Ollama server URL');
    console.log('  test           - Test connectivity to Ollama server');
    console.log('  help           - Show this help message\n');
    console.log('Examples:');
    console.log('  node ollama.js list');
    console.log('  node ollama.js server http://host.docker.internal:11434');
    console.log('  node ollama.js info deepseek-r1:8b');
  }
};

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  if (commands[command]) {
    await commands[command](...args.slice(1));
  } else {
    console.error(`Unknown command: ${command}`);
    commands.help();
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
}); 