/**
 * Ollama Client
 *
 * Implementation of the AI client for Ollama LLMs.
 */
import fetch from 'node-fetch';
import { logger } from '../../../utils/logger.js';
import { DEFAULT_OLLAMA_CONFIG } from './types.js';
/**
 * Client for interacting with Ollama API
 */
export class OllamaClient {
    _config;
    activeModel;
    /**
     * Create a new Ollama client
     */
    constructor(config = {}, defaultModel = 'deepseek-r1:8b') {
        this._config = { ...DEFAULT_OLLAMA_CONFIG, ...config };
        this.activeModel = defaultModel;
        logger.debug('OllamaClient initialized', { baseUrl: this._config.baseUrl, defaultModel });
    }
    /**
     * Get the current configuration
     */
    get config() {
        return this._config;
    }
    /**
     * Update the client configuration
     */
    updateConfig(config) {
        this._config = { ...this._config, ...config };
        logger.debug('OllamaClient configuration updated', { baseUrl: this._config.baseUrl });
    }
    /**
     * Test connection to Ollama service
     */
    async testConnection() {
        try {
            const response = await this.listModels();
            return response && response.models && response.models.length > 0;
        }
        catch (error) {
            logger.error('Failed to connect to Ollama service', error);
            return false;
        }
    }
    /**
     * List available models from Ollama
     */
    async listModels() {
        try {
            const url = `${this._config.baseUrl}/api/tags`;
            logger.debug(`Fetching models from ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => response.statusText);
                throw new Error(`Failed to list models: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            
            // Ensure the response has the expected structure
            if (!data || !data.models) {
                logger.error('Invalid response from Ollama API', { data });
                return { models: [] }; // Return empty models array as fallback
            }
            
            return data;
        } catch (error) {
            logger.error('Error fetching Ollama models', error);
            throw error; // Re-throw to allow proper handling by caller
        }
    }
    /**
     * Get details of a specific model
     */
    async getModelInfo(modelName) {
        try {
            const models = await this.listModels();
            
            if (!models || !models.models || !Array.isArray(models.models)) {
                logger.error('Invalid response from listModels', { models });
                return null;
            }
            
            return models.models.find(model => model.name === modelName) || null;
        }
        catch (error) {
            logger.error(`Failed to get model info for ${modelName}`, error);
            return null;
        }
    }
    /**
     * Set the active model
     */
    setActiveModel(modelName) {
        this.activeModel = modelName;
        logger.debug(`Active model set to ${modelName}`);
    }
    /**
     * Get the currently active model
     */
    getActiveModel() {
        return this.activeModel;
    }
    /**
     * Convert messages to Ollama prompt format
     */
    convertMessagesToPrompt(messages) {
        return messages
            .filter(message => message.role !== 'system')
            .map(message => {
            const role = message.role === 'assistant' ? 'Assistant' : 'User';
            return `${role}: ${message.content}`;
        })
            .join('\n\n') + '\n\nAssistant:';
    }
    /**
     * Generate a completion
     */
    async generateCompletion(request) {
        const { messages, options = {} } = request;
        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system')?.content;
        // Prepare the request payload
        const ollamaRequest = {
            model: options.model || this.activeModel,
            prompt: this.convertMessagesToPrompt(messages),
            system: systemMessage,
            stream: false,
            options: {
                temperature: options.temperature,
                top_p: options.topP,
                top_k: options.topK,
                num_predict: options.maxTokens,
                stop: options.stopSequences
            }
        };
        // Send request to Ollama
        const url = `${this._config.baseUrl}/api/generate`;
        const startTime = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ollamaRequest)
        });
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }
        const ollamaResponse = await response.json();
        const duration = Date.now() - startTime;
        logger.debug('Ollama completion generated', {
            model: ollamaResponse.model,
            duration: `${duration}ms`
        });
        // Estimate token usage (Ollama doesn't provide token counts)
        const inputChars = ollamaRequest.prompt.length;
        const outputChars = ollamaResponse.response.length;
        // Rough approximation: average token is ~4 characters
        const inputTokens = Math.ceil(inputChars / 4);
        const outputTokens = Math.ceil(outputChars / 4);
        const usage = {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens
        };
        // Convert to standard response format
        return {
            text: ollamaResponse.response.trim(),
            model: ollamaResponse.model,
            stopReason: ollamaResponse.done ? 'stop' : 'unknown',
            usage
        };
    }
    /**
     * Generate a streaming completion
     */
    async generateCompletionStream(request, callback) {
        const { messages, options = {} } = request;
        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system')?.content;
        // Prepare the request payload
        const ollamaRequest = {
            model: options.model || this.activeModel,
            prompt: this.convertMessagesToPrompt(messages),
            system: systemMessage,
            stream: true,
            options: {
                temperature: options.temperature,
                top_p: options.topP,
                top_k: options.topK,
                num_predict: options.maxTokens,
                stop: options.stopSequences
            }
        };
        // Send request to Ollama
        const url = `${this._config.baseUrl}/api/generate`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ollamaRequest)
        });
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }
        // Process the stream
        const reader = response.body ? response.body.getReader() : null;
        if (!reader) {
            throw new Error('Failed to get stream reader');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                // Process complete JSON objects
                let startPos = 0;
                let endPos = buffer.indexOf('\n', startPos);
                while (endPos !== -1) {
                    const jsonStr = buffer.substring(startPos, endPos).trim();
                    if (jsonStr) {
                        try {
                            const chunk = JSON.parse(jsonStr);
                            // Call the callback with the chunk
                            callback({
                                text: chunk.response,
                                done: chunk.done
                            });
                            if (chunk.done) {
                                // End of stream
                                return;
                            }
                        }
                        catch (error) {
                            logger.error('Failed to parse JSON from stream', error);
                        }
                    }
                    startPos = endPos + 1;
                    endPos = buffer.indexOf('\n', startPos);
                }
                // Keep the remainder for the next iteration
                buffer = buffer.substring(startPos);
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Disconnect from Ollama service
     */
    async disconnect() {
        // Nothing to disconnect for Ollama
        return Promise.resolve();
    }
    /**
     * Generate a completion (backward compatibility method)
     */
    async complete(prompt, options = {}) {
        const message = {
            role: 'user',
            content: prompt
        };
        const response = await this.generateCompletion({
            messages: [message],
            options
        });
        // Convert to legacy format with content property
        return {
            ...response,
            content: [{
                    text: response.text,
                    role: 'assistant'
                }]
        };
    }
}
//# sourceMappingURL=client.js.map