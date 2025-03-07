/**
 * Authentication Tokens
 *
 * Handles token storage, validation, and refreshing for authentication.
 */
import { logger } from '../utils/logger.js';
/**
 * Create a token storage provider
 */
export function createTokenStorage() {
    // In a real implementation, this would use secure storage
    // like the OS keychain or encrypted file storage
    // For development, we'll use a simple in-memory storage
    const tokenStore = new Map();
    return {
        /**
         * Save a token to storage
         */
        async saveToken(key, token) {
            logger.debug(`Saving auth token for ${key}`);
            tokenStore.set(key, token);
        },
        /**
         * Get a token from storage
         */
        async getToken(key) {
            logger.debug(`Getting auth token for ${key}`);
            return tokenStore.get(key) || null;
        },
        /**
         * Delete a token from storage
         */
        async deleteToken(key) {
            logger.debug(`Deleting auth token for ${key}`);
            tokenStore.delete(key);
        },
        /**
         * Clear all tokens from storage
         */
        async clearTokens() {
            logger.debug('Clearing all auth tokens');
            tokenStore.clear();
        }
    };
}
/**
 * Check if a token is expired
 */
export function isTokenExpired(token, thresholdSeconds = 0) {
    if (!token.expiresAt) {
        return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return token.expiresAt - now <= thresholdSeconds;
}
/**
 * Validate a token
 */
export function validateToken(token) {
    // Check if token has required fields
    if (!token.accessToken) {
        return false;
    }
    // Check if token is expired
    if (isTokenExpired(token)) {
        return false;
    }
    return true;
}
/**
 * Format an expiration timestamp
 */
export function formatTokenExpiration(expiresAt) {
    if (!expiresAt) {
        return 'never';
    }
    const date = new Date(expiresAt * 1000);
    return date.toLocaleString();
}
/**
 * Get token details for display
 */
export function getTokenDetails(token) {
    const details = {};
    // Get token type
    details.type = token.tokenType || 'Bearer';
    // Get token expiration
    if (token.expiresAt) {
        details.expires = formatTokenExpiration(token.expiresAt);
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = token.expiresAt - now;
        if (expiresIn > 0) {
            details.expiresIn = `${Math.floor(expiresIn / 60)} minutes`;
        }
        else {
            details.expiresIn = 'Expired';
        }
    }
    else {
        details.expires = 'Never';
    }
    // Get token scope
    if (token.scope) {
        details.scope = token.scope;
    }
    // Get token ID if available
    if (token.id) {
        details.id = token.id;
    }
    // Mask the access token
    if (token.accessToken) {
        const tokenLength = token.accessToken.length;
        details.accessToken = `${token.accessToken.substring(0, 4)}...${token.accessToken.substring(tokenLength - 4)}`;
    }
    return details;
}
/**
 * Extract token from an authorization header
 */
export function extractTokenFromHeader(header) {
    if (!header) {
        return null;
    }
    // Check for Bearer token
    if (header.startsWith('Bearer ')) {
        return header.substring(7).trim();
    }
    // Check for token without prefix
    if (!header.includes(' ')) {
        return header.trim();
    }
    return null;
}
/**
 * Create an authorization header from a token
 */
export function createAuthorizationHeader(token) {
    const tokenType = token.tokenType || 'Bearer';
    return `${tokenType} ${token.accessToken}`;
}
//# sourceMappingURL=tokens.js.map