/**
 * Sentry Error Reporting
 *
 * Utilities for reporting errors to Sentry.
 * Note: We're skipping the full Sentry SDK implementation as requested.
 */
import { logger } from '../utils/logger.js';
/**
 * Set up Sentry error reporting
 *
 * This is a minimal implementation that doesn't actually use the Sentry SDK.
 */
export function setupSentryReporting(errorManager, options = {}) {
    logger.debug('Sentry error reporting would be set up here');
    // In a real implementation, we would initialize Sentry here
    // For example:
    // Sentry.init({
    //   dsn: options.dsn,
    //   environment: options.environment,
    //   release: options.release,
    //   enabled: options.enabled !== false
    // });
    logger.info('Skipping Sentry SDK initialization as requested');
}
/**
 * Report an error to Sentry
 *
 * This is a minimal implementation that doesn't actually use the Sentry SDK.
 */
export function reportErrorToSentry(error, options = {}) {
    logger.debug('Would report error to Sentry:', {
        error: error instanceof Error ? error.message : String(error),
        level: options.level,
        tags: options.tags,
        user: options.user ? {
            id: options.user.id && '***',
            username: options.user.username && '***',
            email: options.user.email && '***'
        } : undefined
    });
    // In a real implementation, we would call Sentry.captureException here
    // For example:
    // Sentry.captureException(error, {
    //   level: options.level,
    //   tags: options.tags,
    //   extra: options.extra,
    //   user: options.user
    // });
}
//# sourceMappingURL=sentry.js.map