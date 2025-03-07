/**
 * Ollama Commands
 *
 * Commands for interacting with Ollama LLMs.
 */
import { getAIClient, getActiveProvider, AIProvider } from '../ai/index.js';
import { OllamaClient } from '../ai/providers/ollama/client.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
/**
 * Get Ollama client with type checking
 */
function getOllamaClient() {
    try {
        const client = getAIClient();
        
        if (!client) {
            throw createUserError('AI client is not initialized', {
                category: ErrorCategory.CONFIGURATION,
                resolution: 'Make sure Term-Code is properly installed and Ollama is configured.'
            });
        }
        
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
        
        return client;
    } catch (error) {
        // Properly handle and log any errors
        logger.error('Error initializing Ollama client', error);
        throw error; // Re-throw to allow proper handling by caller
    }
}
/**
 * List available Ollama models
 */
export const listModelsCommand = {
    name: 'ollama:list',
    description: 'List available Ollama models. Usage: ollama:list',
    examples: ['ollama:list'],
    handler: async (args) => {
        const terminal = args._terminal;
        try {
            terminal.info('Fetching Ollama models...');
            const client = getOllamaClient();
            const response = await client.listModels();
            
            // Handle case where models might be undefined or not an array
            if (!response || !response.models || !Array.isArray(response.models)) {
                terminal.warning('No models found or invalid response from Ollama server');
                terminal.info('Make sure Ollama is running and properly configured');
                return 1;
            }
            
            terminal.emphasize(`Found ${response.models.length} models:`);
            
            // If no models, show a message
            if (response.models.length === 0) {
                terminal.info('No models found. You may need to pull models using the Ollama CLI:');
                terminal.info('  ollama pull deepseek-r1:8b');
                return 0;
            }
            
            // Format model list as a table
            const data = response.models.map(model => {
                // Safely handle potentially missing fields
                if (!model) return ['Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown'];
                
                // Format size in GB or MB
                const sizeGB = (model.size || 0) / (1024 * 1024 * 1024);
                const size = sizeGB >= 1
                    ? `${sizeGB.toFixed(2)} GB`
                    : `${((model.size || 0) / (1024 * 1024)).toFixed(2)} MB`;
                
                // Safely access nested properties
                const details = model.details || {};
                const modified = model.modified_at ? model.modified_at.substring(0, 10) : 'Unknown';
                
                return [
                    model.name || 'Unknown',
                    size,
                    details.parameter_size || 'Unknown',
                    details.quantization_level || 'N/A',
                    modified // Just the date part
                ];
            });
            
            terminal.table(data, {
                header: ['Model', 'Size', 'Parameters', 'Quantization', 'Last Modified']
            });
            
            return 0;
        }
        catch (error) {
            logger.error('Failed to list Ollama models', error);
            terminal.error(`Failed to list Ollama models: ${error instanceof Error ? error.message : String(error)}`);
            terminal.info('Please check that Ollama is running and the server URL is correct');
            terminal.info(`Current Ollama server URL: ${process.env.OLLAMA_BASE_URL || 'Not set'}`);
            
            return 1;
        }
    }
};
/**
 * Set the active Ollama model
 */
export const setModelCommand = {
    name: 'ollama:use',
    description: 'Set the active Ollama model to use. Usage: ollama:use <model_name>',
    examples: ['ollama:use deepseek-r1:8b'],
    handler: async (args) => {
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
        }
        catch (error) {
            logger.error(`Failed to set Ollama model to ${modelName}`, error);
            terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return 1;
        }
    }
};
/**
 * Show the currently active Ollama model
 */
export const showModelCommand = {
    name: 'ollama:current',
    description: 'Show the currently active Ollama model. Usage: ollama:current',
    examples: ['ollama:current'],
    handler: async (args) => {
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
        }
        catch (error) {
            logger.error('Failed to show current Ollama model', error);
            terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return 1;
        }
    }
};
/**
 * Set the Ollama server URL
 */
export const setServerCommand = {
    name: 'ollama:server',
    description: 'Set the Ollama server URL. Usage: ollama:server <url>',
    examples: ['ollama:server http://host.docker.internal:11434', 'ollama:server http://192.168.1.100:11434'],
    handler: async (args) => {
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
                }
                else {
                    terminal.error('Failed to connect to Ollama server');
                    terminal.info('Please check the URL and make sure the server is running');
                    return 1;
                }
            }
            catch (clientError) {
                // Fallback to direct fetch if client initialization fails
                try {
                    // Use node-fetch directly as a fallback
                    const { default: fetch } = await import('node-fetch');
                    const response = await fetch(`${serverUrl}/api/tags`);
                    if (response.ok) {
                        terminal.success('Successfully connected to Ollama server!');
                        terminal.info('Environment variable set. Restart the application to use this server.');
                        return 0;
                    }
                    else {
                        terminal.error(`Failed to connect to Ollama server: ${response.statusText}`);
                        return 1;
                    }
                }
                catch (fetchError) {
                    terminal.error(`Failed to connect to Ollama server at ${serverUrl}`);
                    terminal.error(`Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
                    return 1;
                }
            }
        }
        catch (error) {
            logger.error(`Failed to set Ollama server to ${serverUrl}`, error);
            terminal.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return 1;
        }
    }
};
/**
 * All Ollama commands
 */
export const ollamaCommands = [
    listModelsCommand,
    setModelCommand,
    showModelCommand,
    setServerCommand
];
//# sourceMappingURL=ollama.js.map