/**
 * Ollama API Types
 *
 * Type definitions for the Ollama API integration.
 */
/**
 * Default Ollama configuration
 */
export const DEFAULT_OLLAMA_CONFIG = {
    // Use environment variable or localhost by default
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10)
};
//# sourceMappingURL=types.js.map