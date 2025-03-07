/**
 * Ollama API Types
 * 
 * Type definitions for the Ollama API integration.
 */

/**
 * Ollama model information
 */
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

/**
 * Ollama completion request
 */
export interface OllamaCompletionRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
    seed?: number;
  };
}

/**
 * Ollama completion response
 */
export interface OllamaCompletionResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Ollama list models response
 */
export interface OllamaListModelsResponse {
  models: OllamaModel[];
}

/**
 * Ollama client configuration
 */
export interface OllamaConfig {
  baseUrl: string;
  timeout?: number;
}

/**
 * Default Ollama configuration
 */
export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  // Use environment variable or localhost by default
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
  timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10)
}; 