/**
 * AI Provider Factory
 * 
 * Central module for managing different AI providers.
 */

import { AIClientInterface } from '../types.js';
import { OllamaClient } from './ollama/client.js';
import { logger } from '../../utils/logger.js';

/**
 * Supported AI providers
 */
export enum AIProvider {
  CLAUDE = 'claude',
  OLLAMA = 'ollama'
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  provider: AIProvider;
  options?: Record<string, any>;
}

/**
 * Default provider configuration
 */
export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  provider: AIProvider.OLLAMA,
  options: {}
};

/**
 * Create an AI client for the specified provider
 */
export function createAIClient(config: Partial<ProviderConfig> = {}): AIClientInterface {
  const fullConfig = { ...DEFAULT_PROVIDER_CONFIG, ...config };
  
  logger.debug('Creating AI client for provider', { provider: fullConfig.provider });
  
  switch (fullConfig.provider) {
    case AIProvider.OLLAMA:
      return new OllamaClient(fullConfig.options);
    
    case AIProvider.CLAUDE:
      // Preserve original Claude integration - this would normally use your AIClient from before
      // For now, just throw an error since we haven't integrated with the real client yet
      throw new Error('Claude provider not implemented yet');
    
    default:
      throw new Error(`Unsupported AI provider: ${fullConfig.provider}`);
  }
}

/**
 * Get provider name from an AIClientInterface instance
 */
export function getProviderName(client: AIClientInterface): AIProvider {
  if (client instanceof OllamaClient) {
    return AIProvider.OLLAMA;
  }
  
  // Add more checks for other provider types
  
  return AIProvider.CLAUDE; // Default
} 