/**
 * AI Module
 *
 * Provides AI capabilities using various language models.
 * This module handles initialization, configuration, and access to AI services.
 */
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { authManager } from '../auth/index.js';
import { createAIClient, AIProvider } from './providers/index.js';
// Singleton AI client instance
let aiClient = null;
let activeProvider = null;
/**
 * Initialize the AI module
 */
export async function initAI(config = {}) {
    logger.info('Initializing AI module');
    try {
        // Check which provider to use - first from config, then from env var
        const providerFromEnv = process.env.TERM_CODE_PROVIDER?.toLowerCase();
        let selectedProvider;
        if (config.provider) {
            selectedProvider = config.provider;
        }
        else if (providerFromEnv === 'ollama') {
            selectedProvider = AIProvider.OLLAMA;
            logger.debug('Using Ollama provider from environment variable');
        }
        else if (providerFromEnv === 'claude') {
            selectedProvider = AIProvider.CLAUDE;
            logger.debug('Using Claude provider from environment variable');
        }
        else {
            // Default to Ollama if not specified
            selectedProvider = AIProvider.OLLAMA;
        }
        const providerConfig = {
            provider: selectedProvider,
            options: config.providerOptions || {}
        };
        // Only require authentication for Claude
        if (providerConfig.provider === AIProvider.CLAUDE) {
            // Check if we have authentication
            if (!authManager.isAuthenticated()) {
                throw createUserError('Authentication required for Claude AI services', {
                    category: ErrorCategory.AUTHENTICATION,
                    resolution: 'Please log in using the login command or provide an API key, or use Ollama provider instead.'
                });
            }
            // Get the auth token
            const authToken = authManager.getToken();
            if (!authToken || !authToken.accessToken) {
                throw createUserError('No valid authentication token available', {
                    category: ErrorCategory.AUTHENTICATION,
                    resolution: 'Please log in again with the login command or use Ollama provider instead.'
                });
            }
            // Add auth token to provider options
            providerConfig.options = {
                ...providerConfig.options,
                authToken: authToken.accessToken
            };
        }
        // Create AI client based on provider
        aiClient = createAIClient(providerConfig);
        activeProvider = providerConfig.provider || AIProvider.OLLAMA;
        // Test connection
        logger.debug('Testing connection to AI service');
        const connectionSuccess = await aiClient.testConnection();
        if (!connectionSuccess) {
            throw createUserError(`Failed to connect to ${activeProvider} AI service`, {
                category: ErrorCategory.CONNECTION,
                resolution: 'Check your internet connection and try again.'
            });
        }
        logger.info('AI module initialized successfully', { provider: activeProvider });
        return aiClient;
    }
    catch (error) {
        logger.error('Failed to initialize AI module', error);
        throw createUserError('Failed to initialize AI capabilities', {
            cause: error,
            category: ErrorCategory.INITIALIZATION,
            resolution: 'Check your settings and internet connection, then try again.'
        });
    }
}
/**
 * Get the AI client instance
 */
export function getAIClient() {
    if (!aiClient) {
        throw createUserError('AI module not initialized', {
            category: ErrorCategory.INITIALIZATION,
            resolution: 'Make sure to call initAI() before using AI capabilities.'
        });
    }
    return aiClient;
}
/**
 * Get the active provider
 */
export function getActiveProvider() {
    return activeProvider;
}
/**
 * Check if AI module is initialized
 */
export function isAIInitialized() {
    return !!aiClient;
}
// Re-export types and components
export * from './client.js';
export * from './prompts.js';
export * from './providers/index.js';
//# sourceMappingURL=index.js.map