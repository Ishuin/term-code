/**
 * AI Module
 *
 * Provides AI capabilities using Claude, Anthropic's large language model.
 * This module handles initialization, configuration, and access to AI services.
 */
import { AIClient } from './client.js';
/**
 * Initialize the AI module
 */
export declare function initAI(config?: any): Promise<AIClient>;
/**
 * Get the AI client instance
 */
export declare function getAIClient(): AIClient;
/**
 * Check if AI module is initialized
 */
export declare function isAIInitialized(): boolean;
export * from './client.js';
export * from './prompts.js';
