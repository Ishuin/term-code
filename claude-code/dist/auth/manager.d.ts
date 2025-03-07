/**
 * Authentication Manager
 *
 * Manages authentication processes, token handling, and authentication state.
 */
import { AuthToken, AuthMethod, AuthState, AuthResult } from './types.js';
import { EventEmitter } from 'events';
export declare const AUTH_EVENTS: {
    STATE_CHANGED: string;
    LOGGED_IN: string;
    LOGGED_OUT: string;
    TOKEN_REFRESHED: string;
    ERROR: string;
};
/**
 * Authentication Manager Class
 *
 * Centralizes all authentication-related functionality
 */
export declare class AuthManager extends EventEmitter {
    private state;
    private tokenStorage;
    private currentToken;
    private refreshTimer;
    private readonly tokenKey;
    private readonly config;
    /**
     * Create a new AuthManager instance
     */
    constructor(config: any);
    /**
     * Initialize the authentication manager
     */
    initialize(): Promise<void>;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get the current authentication state
     */
    getState(): AuthState;
    /**
     * Get the current authentication token
     */
    getToken(): AuthToken | null;
    /**
     * Get the authorization header value for API requests
     */
    getAuthorizationHeader(): string | null;
    /**
     * Authenticate the user
     */
    authenticate(method?: AuthMethod): Promise<AuthResult>;
    /**
     * Log out the current user
     */
    logout(): Promise<void>;
    /**
     * Authenticate using API key
     */
    private authenticateWithApiKey;
    /**
     * Authenticate using OAuth flow
     */
    private authenticateWithOAuth;
    /**
     * Refresh the current token
     */
    private refreshToken;
    /**
     * Refresh the OAuth token
     */
    private refreshOAuthToken;
    /**
     * Schedule a token refresh
     */
    private scheduleTokenRefresh;
    /**
     * Update the authentication state
     */
    private setState;
}
