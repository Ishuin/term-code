/**
 * AI Provider Factory
 *
 * Central module for managing different AI providers.
 */
import { AIClientInterface } from '../types.js';
/**
 * Supported AI providers
 */
export declare enum AIProvider {
    CLAUDE = "claude",
    OLLAMA = "ollama"
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
export declare const DEFAULT_PROVIDER_CONFIG: ProviderConfig;
/**
 * Create an AI client for the specified provider
 */
export declare function createAIClient(config?: Partial<ProviderConfig>): AIClientInterface;
/**
 * Get provider name from an AIClientInterface instance
 */
export declare function getProviderName(client: AIClientInterface): AIProvider;
