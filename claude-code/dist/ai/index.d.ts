/**
 * AI Module
 *
 * Provides AI capabilities using various language models.
 * This module handles initialization, configuration, and access to AI services.
 */
import { AIClientInterface } from './types.js';
import { AIProvider } from './providers/index.js';
/**
 * Initialize the AI module
 */
export declare function initAI(config?: any): Promise<AIClientInterface>;
/**
 * Get the AI client instance
 */
export declare function getAIClient(): AIClientInterface;
/**
 * Get the active provider
 */
export declare function getActiveProvider(): AIProvider | null;
/**
 * Check if AI module is initialized
 */
export declare function isAIInitialized(): boolean;
export * from './client.js';
export * from './prompts.js';
export * from './providers/index.js';
