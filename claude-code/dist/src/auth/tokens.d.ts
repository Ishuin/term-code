/**
 * Authentication Tokens
 *
 * Handles token storage, validation, and refreshing for authentication.
 */
import { AuthToken, TokenStorage } from './types.js';
/**
 * Create a token storage provider
 */
export declare function createTokenStorage(): TokenStorage;
/**
 * Check if a token is expired
 */
export declare function isTokenExpired(token: AuthToken, thresholdSeconds?: number): boolean;
/**
 * Validate a token
 */
export declare function validateToken(token: AuthToken): boolean;
/**
 * Format an expiration timestamp
 */
export declare function formatTokenExpiration(expiresAt: number): string;
/**
 * Get token details for display
 */
export declare function getTokenDetails(token: AuthToken): Record<string, string>;
/**
 * Extract token from an authorization header
 */
export declare function extractTokenFromHeader(header: string): string | null;
/**
 * Create an authorization header from a token
 */
export declare function createAuthorizationHeader(token: AuthToken): string;
