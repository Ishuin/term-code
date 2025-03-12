/**
 * Ollama Commands
 * 
 * Commands for interacting with Ollama LLMs.
 */

import { CommandDef as CommandDefinition } from './index.js';
import { getAIClient, getActiveProvider, AIProvider } from '../ai/index.js';
import { OllamaClient } from '../ai/providers/ollama/client.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { TerminalInterface } from '../terminal/types.js';

/**
 * Get Ollama client with type checking
 */
function getOllamaClient(): OllamaClient {
  const client = getAIClient();
  const provider = getActiveProvider();
  
  if (provider !== AIProvider.OLLAMA) {
    throw createUserError('Ollama is not the active provider', {
      category: ErrorCategory.CONFIGURATION,
      resolution: 'Configure Ollama as the active provider first.'
    });
  }
  
  if (!(client instanceof OllamaClient)) {
    throw createUserError('Current AI client is not an Ollama client', {
      category: ErrorCategory.CONFIGURATION,
      resolution: 'Initialize the AI module with the Ollama provider.'
    });
  }
  
  // If OLLAMA_BASE_URL environment variable is set, update client config
  if (process.env.OLLAMA_BASE_URL && client.config.baseUrl !== process.env.OLLAMA_BASE_URL) {
    // Update the client's configuration with the new URL
    logger.debug(`Updating Ollama client URL to ${process.env.OLLAMA_BASE_URL}`);
    
    // Create a new configuration with the updated URL
    const updatedConfig = {
      ...client.config,
      baseUrl: process.env.OLLAMA_BASE_URL
    };
    
    // Update the client's configuration
    client.updateConfig(updatedConfig);
  }
  
  return client as OllamaClient;
}

/**
 * List available Ollama models
 */
export const listModelsCommand: CommandDefinition = {
  name: 'ollama:list',
  description: 'List available Ollama models. Usage: ollama:list',
  examples: ['ollama:list'],
  handler: async (args: Record<string, any>) => {
    const terminal = args._terminal;
    
    try {
      terminal.info('Fetching Ollama models...');
      
      const client = getOllamaClient();
      const response = await client.listModels();
      
      if (!response.models || response.models.length === 0) {
        terminal.warn('No models found. Make sure Ollama is running and has models installed.');
        terminal.info('You can install models with: ollama pull <model_name>');
        return 0;
      }
      
      terminal.emphasize(`Found ${response.models.length} models:`);
      
      // Format model list as a table
      const data = response.models.map(model => {
        // Format size in GB or MB
        const sizeGB = model.size / (1024 * 1024 * 1024);
        const size = sizeGB >= 1 
          ? `${sizeGB.toFixed(2)} GB` 
          : `${(model.size / (1024 * 1024)).toFixed(2)} MB`;
          
        return [
          model.name,
          size,
          model.details?.parameter_size || 'Unknown',
          model.details?.quantization_level || 'N/A',
          model.modified_at?.substring(0, 10) || 'Unknown' // Just the date part
        ];
      });
      
      terminal.table(data, {
        header: ['Model', 'Size', 'Parameters', 'Quantization', 'Last Modified']
      });
      
      return 0;
    } catch (error) {
      logger.error('Failed to list Ollama models', error);
      terminal.error(`Error listing models: ${error instanceof Error ? error.message : String(error)}`);
      terminal.info('Make sure Ollama is running and accessible at: ' + process.env.OLLAMA_BASE_URL);
      return 1;
    }
  }
};

/**
 * Set the active Ollama model
 */
export const setModelCommand: CommandDefinition = {
  name: 'ollama:use',
  description: 'Set the active Ollama model to use. Usage: ollama:use <model_name>',
  examples: ['ollama:use deepseek-r1:8b'],
  handler: async (args: Record<string, any>) => {
    const terminal = args._terminal;
    
    if (!args.name && (!args._ || args._.length < 1)) {
      terminal.error('Error: Model name is required');
      terminal.info('Usage: ollama:use <model_name>');
      return 1;
    }
    
    const modelName = args.name || args._[0];
    
    try {
      const client = getOllamaClient();
      
      // Check if model exists
      terminal.info(`Checking if model '${modelName}' exists...`);
      const allModels = await client.listModels();
      
      if (!allModels.models || allModels.models.length === 0) {
        terminal.error('Error: Could not retrieve model list from Ollama');
        terminal.info('Make sure Ollama is running and accessible at: ' + process.env.OLLAMA_BASE_URL);
        return 1;
      }
      
      const modelExists = allModels.models.some(m => m.name === modelName);
      
      if (!modelExists) {
        terminal.error(`Error: Model '${modelName}' not found`);
        terminal.info('Use the ollama:list command to see available models');
        terminal.info('You can install models with: ollama pull <model_name>');
        return 1;
      }
      
      // Set active model
      client.setActiveModel(modelName);
      terminal.success(`Active model set to '${modelName}'`);
      
      // Show model details
      const info = allModels.models.find(m => m.name === modelName);
      if (info) {
        terminal.emphasize('Model details:');
        terminal.info(`Name: ${info.name}`);
        terminal.info(`Size: ${(info.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        terminal.info(`Parameters: ${info.details?.parameter_size || 'Unknown'}`);
        terminal.info(`Quantization: ${info.details?.quantization_level || 'None'}`);
        terminal.info(`Family: ${info.details?.family || 'Unknown'}`);
      }
      
      return 0;
    } catch (error) {
      logger.error(`Failed to set Ollama model to ${modelName}`, error);
      terminal.error(`Error setting model: ${error instanceof Error ? error.message : String(error)}`);
      terminal.info('Make sure Ollama is running and accessible at: ' + process.env.OLLAMA_BASE_URL);
      return 1;
    }
  }
};

/**
 * Show the currently active Ollama model
 */
export const showModelCommand: CommandDefinition = {
  name: 'ollama:current',
  description: 'Show the currently active Ollama model. Usage: ollama:current',
  examples: ['ollama:current'],
  handler: async (args: Record<string, any>) => {
    const terminal = args._terminal;
    
    try {
      const client = getOllamaClient();
      const modelName = client.getActiveModel();
      
      terminal.emphasize(`Current Ollama model: ${modelName}`);
      
      // Get model details
      const info = await client.getModelInfo(modelName);
      
      if (info) {
        terminal.info(`Size: ${(info.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        terminal.info(`Parameters: ${info.details.parameter_size || 'Unknown'}`);
        terminal.info(`Quantization: ${info.details.quantization_level || 'None'}`);
        terminal.info(`Family: ${info.details.family || 'Unknown'}`);
      }
      
      return 0;
    } catch (error) {
      logger.error('Failed to show current Ollama model', error);
      terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return 1;
    }
  }
};

/**
 * Set the Ollama server URL
 */
export const setServerCommand: CommandDefinition = {
  name: 'ollama:server',
  description: 'Set the Ollama server URL. Usage: ollama:server <url>',
  examples: ['ollama:server http://host.docker.internal:11434', 'ollama:server http://192.168.1.100:11434'],
  handler: async (args: Record<string, any>) => {
    const terminal = args._terminal;
    
    if (!args.url && (!args._ || args._.length < 1)) {
      terminal.error('Error: Server URL is required');
      terminal.info('Usage: ollama:server <url>');
      terminal.info('Examples:');
      terminal.info('  ollama:server http://host.docker.internal:11434  (for WSL)');
      terminal.info('  ollama:server http://localhost:11434            (for local)');
      terminal.info('  ollama:server http://192.168.1.100:11434        (specific IP)');
      return 1;
    }
    
    // Get URL from args
    const serverUrl = args.url || args._[0];
    
    try {
      // Validate URL format
      try {
        new URL(serverUrl);
      } catch (e) {
        terminal.error(`Error: Invalid URL format: ${serverUrl}`);
        terminal.info('URL must be in the format: http://hostname:port');
        return 1;
      }
      
      // Set environment variable for this process
      process.env.OLLAMA_BASE_URL = serverUrl;
      
      terminal.success(`Ollama server URL set to: ${serverUrl}`);
      
      // Test the connection
      terminal.info('Testing connection to Ollama server...');
      
      // Import fetch here to avoid any module resolution issues
      const { default: fetch } = await import('node-fetch');
      
      try {
        // Use AbortController for timeout instead of timeout option
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${serverUrl}/api/tags`, { 
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json() as { models?: Array<{ name: string }> };
          const modelCount = data?.models?.length || 0;
          
          terminal.success('Successfully connected to Ollama server!');
          terminal.info(`Found ${modelCount} models available.`);
          
          if (modelCount === 0) {
            terminal.warn('No models found. You may need to pull models:');
            terminal.info('Run "ollama pull <model>" on your Ollama server');
          } else if (data.models) {
            terminal.info('Available models:');
            data.models.slice(0, 5).forEach((model) => {
              terminal.info(`  - ${model.name}`);
            });
            
            if (data.models.length > 5) {
              terminal.info(`  ... and ${data.models.length - 5} more.`);
            }
          }
          
          // Save the URL to the config file
          try {
            const configPath = process.env.HOME ? `${process.env.HOME}/.ollama_config` : './.ollama_config';
            const fs = await import('fs');
            fs.writeFileSync(configPath, `SERVER_URL=${serverUrl}\nOLLAMA_BASE_URL=${serverUrl}\n`);
            terminal.success(`URL saved to ${configPath} for future sessions.`);
          } catch (writeError) {
            terminal.warn(`Could not save URL to config file: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
            terminal.info('URL is set for this session only.');
          }
          
          return 0;
        } else {
          terminal.error(`Failed to connect to Ollama server: ${response.statusText} (${response.status})`);
          terminal.info('Make sure the Ollama service is running on the target server.');
          
          if (serverUrl.includes('host.docker.internal')) {
            terminal.info('For WSL users:');
            terminal.info('1. Make sure Ollama is running on Windows host');
            terminal.info('2. Try accessing your Windows host IP directly');
            terminal.info('   Run "cat /etc/resolv.conf" to find your Windows IP');
          }
          
          return 1;
        }
      } catch (fetchError) {
        terminal.error(`Failed to connect to Ollama server: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        
        // Give helpful diagnostics
        terminal.info('\nConnection diagnostics:');
        
        if (serverUrl.includes('localhost') && process.env.WSL_DISTRO_NAME) {
          terminal.info('⚠️  Using "localhost" inside WSL may not work as expected.');
          terminal.info('💡 Try using "host.docker.internal" instead of "localhost":');
          terminal.info(`   ollama:server http://host.docker.internal:11434`);
        }
        
        if (serverUrl.includes('host.docker.internal')) {
          terminal.info('For WSL users:');
          terminal.info('1. Make sure Ollama is running on your Windows host');
          terminal.info('2. Check Windows firewall settings');
          terminal.info('3. Verify the port (11434) is correct and not blocked');
        }
        
        return 1;
      }
    } catch (error) {
      terminal.error(`Error setting server URL: ${error instanceof Error ? error.message : String(error)}`);
      return 1;
    }
  }
};

/**
 * All Ollama commands
 */
export const ollamaCommands: CommandDefinition[] = [
  listModelsCommand,
  setModelCommand,
  showModelCommand,
  setServerCommand
]; 