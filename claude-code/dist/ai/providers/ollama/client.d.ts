/**
 * Ollama Client
 *
 * Implementation of the AI client for Ollama LLMs.
 */
import { AIClientInterface, CompletionRequest, CompletionResponse, StreamCallback } from '../../types.js';
import { OllamaConfig, OllamaListModelsResponse, OllamaModel } from './types.js';
/**
 * Client for interacting with Ollama API
 */
export declare class OllamaClient implements AIClientInterface {
    private _config;
    private activeModel;
    /**
     * Create a new Ollama client
     */
    constructor(config?: Partial<OllamaConfig>, defaultModel?: string);
    /**
     * Get the current configuration
     */
    get config(): OllamaConfig;
    /**
     * Update the client configuration
     */
    updateConfig(config: Partial<OllamaConfig>): void;
    /**
     * Test connection to Ollama service
     */
    testConnection(): Promise<boolean>;
    /**
     * List available models from Ollama
     */
    listModels(): Promise<OllamaListModelsResponse>;
    /**
     * Get details of a specific model
     */
    getModelInfo(modelName: string): Promise<OllamaModel | null>;
    /**
     * Set the active model
     */
    setActiveModel(modelName: string): void;
    /**
     * Get the currently active model
     */
    getActiveModel(): string;
    /**
     * Convert messages to Ollama prompt format
     */
    private convertMessagesToPrompt;
    /**
     * Generate a completion
     */
    generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
    /**
     * Generate a streaming completion
     */
    generateCompletionStream(request: CompletionRequest, callback: StreamCallback): Promise<void>;
    /**
     * Disconnect from Ollama service
     */
    disconnect(): Promise<void>;
    /**
     * Generate a completion (backward compatibility method)
     */
    complete(prompt: string, options?: any): Promise<any>;
}
