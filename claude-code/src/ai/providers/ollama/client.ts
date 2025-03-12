/**
 * Ollama Client
 * 
 * Implementation of the AI client for Ollama LLMs.
 */

import fetch from 'node-fetch';
import { logger } from '../../../utils/logger.js';
import { 
  AIClientInterface, 
  CompletionRequest, 
  CompletionResponse, 
  StreamCallback, 
  Message,
  AIUsage
} from '../../types.js';
import { 
  OllamaConfig, 
  DEFAULT_OLLAMA_CONFIG,
  OllamaCompletionRequest,
  OllamaCompletionResponse,
  OllamaListModelsResponse,
  OllamaModel
} from './types.js';

/**
 * Client for interacting with Ollama API
 */
export class OllamaClient implements AIClientInterface {
  private _config: OllamaConfig;
  private activeModel: string;

  /**
   * Create a new Ollama client
   */
  constructor(config: Partial<OllamaConfig> = {}, defaultModel: string = 'deepseek-r1:8b') {
    this._config = { ...DEFAULT_OLLAMA_CONFIG, ...config };
    this.activeModel = defaultModel;
    logger.debug('OllamaClient initialized', { baseUrl: this._config.baseUrl, defaultModel });
  }

  /**
   * Get the current configuration
   */
  get config(): OllamaConfig {
    return this._config;
  }

  /**
   * Update the client configuration
   */
  updateConfig(config: Partial<OllamaConfig>): void {
    this._config = { ...this._config, ...config };
    logger.debug('OllamaClient configuration updated', { baseUrl: this._config.baseUrl });
  }

  /**
   * Test connection to Ollama service
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.listModels();
      return response.models.length > 0;
    } catch (error) {
      logger.error('Failed to connect to Ollama service', error);
      return false;
    }
  }

  /**
   * List available models from Ollama
   */
  async listModels(): Promise<OllamaListModelsResponse> {
    const url = `${this._config.baseUrl}/api/tags`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list models: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json() as any;
      
      // Ensure the response has the expected format
      if (!data || !Array.isArray(data.models)) {
        logger.warn('Unexpected response format from Ollama API', { data });
        // Return a safe default
        return { models: [] };
      }
      
      return data as OllamaListModelsResponse;
    } catch (error) {
      logger.error('Error listing Ollama models', { 
        error: error instanceof Error ? error.message : String(error),
        url 
      });
      // Return an empty list instead of throwing
      return { models: [] };
    }
  }

  /**
   * Get details of a specific model
   */
  async getModelInfo(modelName: string): Promise<OllamaModel | null> {
    try {
      const result = await this.listModels();
      
      if (!result || !Array.isArray(result.models)) {
        logger.warn(`Failed to get model info for ${modelName}: Invalid response format`);
        return null;
      }
      
      return result.models.find(model => model.name === modelName) || null;
    } catch (error) {
      logger.error(`Failed to get model info for ${modelName}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Set the active model
   */
  setActiveModel(modelName: string): void {
    this.activeModel = modelName;
    logger.debug(`Active model set to ${modelName}`);
  }

  /**
   * Get the currently active model
   */
  getActiveModel(): string {
    return this.activeModel;
  }

  /**
   * Convert messages to Ollama prompt format
   */
  private convertMessagesToPrompt(messages: Message[]): string {
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
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const { messages, options = {} } = request;
    
    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content;
    
    // Prepare the request payload
    const ollamaRequest: OllamaCompletionRequest = {
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
    
    const ollamaResponse = await response.json() as OllamaCompletionResponse;
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
    
    const usage: AIUsage = {
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
  async generateCompletionStream(request: CompletionRequest, callback: StreamCallback): Promise<void> {
    const { messages, options = {} } = request;
    
    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content;
    
    // Prepare the request payload
    const ollamaRequest: OllamaCompletionRequest = {
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
    const reader = response.body ? (response.body as any).getReader() : null;
    if (!reader) {
      throw new Error('Failed to get stream reader');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects
        let startPos = 0;
        let endPos = buffer.indexOf('\n', startPos);
        
        while (endPos !== -1) {
          const jsonStr = buffer.substring(startPos, endPos).trim();
          if (jsonStr) {
            try {
              const chunk = JSON.parse(jsonStr) as OllamaCompletionResponse;
              
              // Call the callback with the chunk
              callback({
                text: chunk.response,
                done: chunk.done
              });
              
              if (chunk.done) {
                // End of stream
                return;
              }
            } catch (error) {
              logger.error('Failed to parse JSON from stream', error);
            }
          }
          
          startPos = endPos + 1;
          endPos = buffer.indexOf('\n', startPos);
        }
        
        // Keep the remainder for the next iteration
        buffer = buffer.substring(startPos);
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Disconnect from Ollama service
   */
  async disconnect(): Promise<void> {
    // Nothing to disconnect for Ollama
    return Promise.resolve();
  }

  /**
   * Generate a completion (backward compatibility method)
   */
  async complete(prompt: string, options: any = {}): Promise<any> {
    const message: Message = {
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