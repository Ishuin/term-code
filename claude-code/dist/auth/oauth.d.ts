/**
 * OAuth Authentication
 *
 * Handles the OAuth authentication flow, including token retrieval,
 * refresh, and authorization redirects.
 */
import { AuthResult, AuthToken, OAuthConfig } from './types.js';
/**
 * Default OAuth configuration for Anthropic API
 */
export declare const DEFAULT_OAUTH_CONFIG: OAuthConfig;
/**
 * Performs the OAuth authentication flow
 */
export declare function performOAuthFlow(config: OAuthConfig): Promise<AuthResult>;
/**
 * Refresh an OAuth token
 */
export declare function refreshOAuthToken(refreshToken: string, config: OAuthConfig): Promise<AuthToken>;
