/**
 * Sentry Error Reporting
 *
 * Utilities for reporting errors to Sentry.
 * Note: We're skipping the full Sentry SDK implementation as requested.
 */
import { ErrorManager } from './types.js';
/**
 * Set up Sentry error reporting
 *
 * This is a minimal implementation that doesn't actually use the Sentry SDK.
 */
export declare function setupSentryReporting(errorManager: ErrorManager, options?: {
    enabled?: boolean;
    dsn?: string;
    environment?: string;
    release?: string;
}): void;
/**
 * Report an error to Sentry
 *
 * This is a minimal implementation that doesn't actually use the Sentry SDK.
 */
export declare function reportErrorToSentry(error: unknown, options?: {
    level?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: {
        id?: string;
        username?: string;
        email?: string;
    };
}): void;
