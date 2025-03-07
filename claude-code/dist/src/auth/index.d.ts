/**
 * Authentication Manager
 *
 * Main entry point for authentication functionality. Handles authentication
 * flow, token management, and coordination of OAuth and API key auth methods.
 */
import { AuthToken, AuthConfig, AuthMethod, AuthResult, OAuthConfig } from './types.js';
/**
 * Authentication Manager
 */
export declare class AuthManager {
    private config;
    private tokenStorage;
    private state;
    /**
     * Create a new auth manager
     */
    constructor(config?: Partial<AuthConfig>);
    /**
     * Initialize authentication
     */
    initialize(): Promise<boolean>;
    /**
     * Check if the current token needs refresh
     */
    checkAndRefreshToken(): Promise<boolean>;
    /**
     * Refresh the current token
     */
    refreshToken(): Promise<boolean>;
    /**
     * Authenticate with API key
     */
    authenticateWithApiKey(apiKey: string): Promise<AuthResult>;
    /**
     * Authenticate with OAuth
     */
    authenticateWithOAuth(config?: OAuthConfig): Promise<AuthResult>;
    /**
     * Log out (clear credentials)
     */
    logout(): Promise<void>;
    /**
     * Get the current auth token
     */
    getToken(): AuthToken | null;
    /**
     * Get authorization header for API requests
     */
    getAuthorizationHeader(): string | null;
    /**
     * Check if authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get the current auth method
     */
    getAuthMethod(): AuthMethod | null;
    /**
     * Get token details for display
     */
    getTokenDetails(): Record<string, string> | null;
    /**
     * Get the last error
     */
    getLastError(): Error | null;
    private authenticate;
}
export declare const authManager: AuthManager;
/**
 * Initialize the authentication system
 *
 * @param config Configuration options for authentication
 * @returns The initialized authentication manager
 */
export declare function initAuthentication(config?: any): Promise<any>;
export * from './types.js';
export * from './oauth.js';
export * from './tokens.js';
