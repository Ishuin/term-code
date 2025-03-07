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
          model.details.parameter_size || 'Unknown',
          model.details.quantization_level || 'N/A',
          model.modified_at.substring(0, 10) // Just the date part
        ];
      });
      
      terminal.table(data, {
        header: ['Model', 'Size', 'Parameters', 'Quantization', 'Last Modified']
      });
      
      return 0;
    } catch (error) {
      logger.error('Failed to list Ollama models', error);
      terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
      const info = await client.getModelInfo(modelName);
      
      if (!info) {
        terminal.error(`Error: Model '${modelName}' not found`);
        terminal.info('Use the ollama:list command to see available models');
        return 1;
      }
      
      // Set active model
      client.setActiveModel(modelName);
      terminal.success(`Active model set to '${modelName}'`);
      
      // Show model details
      terminal.emphasize('Model details:');
      terminal.info(`Name: ${info.name}`);
      terminal.info(`Size: ${(info.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
      terminal.info(`Parameters: ${info.details.parameter_size || 'Unknown'}`);
      terminal.info(`Quantization: ${info.details.quantization_level || 'None'}`);
      terminal.info(`Family: ${info.details.family || 'Unknown'}`);
      
      return 0;
    } catch (error) {
      logger.error(`Failed to set Ollama model to ${modelName}`, error);
      terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
      return 1;
    }
    
    // Get URL from args
    const serverUrl = args.url || args._[0];
    
    try {
      // Set environment variable for this process
      process.env.OLLAMA_BASE_URL = serverUrl;
      
      terminal.success(`Ollama server URL set to: ${serverUrl}`);
      
      // Test the connection
      terminal.info('Testing connection to Ollama server...');
      
      try {
        const client = getOllamaClient();
        const connected = await client.testConnection();
        
        if (connected) {
          terminal.success('Successfully connected to Ollama server!');
          
          // Show available models
          const models = await client.listModels();
          terminal.info(`Available models: ${models.models.map(m => m.name).join(', ')}`);
          
          return 0;
        } else {
          terminal.error('Failed to connect to Ollama server');
          terminal.info('Please check the URL and make sure the server is running');
          return 1;
        }
      } catch (clientError) {
        // Fallback to direct fetch if client initialization fails
        try {
          // Use node-fetch directly as a fallback
          const { default: fetch } = await import('node-fetch');
          const response = await fetch(`${serverUrl}/api/tags`);
          
          if (response.ok) {
            terminal.success('Successfully connected to Ollama server!');
            terminal.info('Environment variable set. Restart the application to use this server.');
            return 0;
          } else {
            terminal.error(`Failed to connect to Ollama server: ${response.statusText}`);
            return 1;
          }
        } catch (fetchError) {
          terminal.error(`Failed to connect to Ollama server at ${serverUrl}`);
          terminal.error(`Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
          return 1;
        }
      }
    } catch (error) {
      logger.error(`Failed to set Ollama server to ${serverUrl}`, error);
      terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
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