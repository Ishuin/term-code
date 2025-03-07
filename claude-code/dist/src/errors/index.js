/**
 * Error Handling Module
 *
 * Provides centralized error handling, tracking, and reporting.
 */
import { logger } from '../utils/logger.js';
import { ErrorLevel, ErrorCategory } from './types.js';
import { setupConsoleErrorHandling } from './console.js';
/**
 * Initialize error handling system
 */
export function initErrorHandling() {
    logger.debug('Initializing error handling system');
    // Create error manager instance
    const errorManager = new ErrorHandlerImpl();
    try {
        // Set up Sentry error reporting if enabled
        // We're skipping Sentry SDK as requested
        // Set up console error handling
        setupConsoleErrorHandling(errorManager);
        return errorManager;
    }
    catch (error) {
        logger.error('Failed to initialize error handling system', error);
        // Return a basic error manager even if initialization failed
        return errorManager;
    }
}
/**
 * Implementation of the ErrorManager interface
 */
class ErrorHandlerImpl {
    errorCount = new Map();
    MAX_ERRORS = 100;
    /**
     * Handle a fatal error that should terminate the application
     */
    handleFatalError(error) {
        this.handleError(error, { level: ErrorLevel.FATAL });
        process.exit(1);
    }
    /**
     * Handle an unhandled promise rejection
     */
    handleUnhandledRejection(reason, promise) {
        const err = reason instanceof Error ? reason : new Error(String(reason));
        const formattedError = this.formatError(err);
        logger.error('Unhandled rejection:', formattedError);
    }
    /**
     * Handle an uncaught exception
     */
    handleUncaughtException(error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const formattedError = this.formatError(err);
        logger.error('Uncaught exception:', formattedError);
    }
    /**
     * Handle a general error
     */
    handleError(error, options = {}) {
        const err = error instanceof Error ? error : new Error(String(error));
        const category = options.category || ErrorCategory.APPLICATION;
        const level = options.level || ErrorLevel.ERROR;
        // Track error count for rate limiting
        const errorKey = `${category}:${level}:${err.message}`;
        const count = (this.errorCount.get(errorKey) || 0) + 1;
        this.errorCount.set(errorKey, count);
        // Format the error
        const formattedError = this.formatError(err);
        // Log based on level
        if (level === ErrorLevel.FATAL || level === ErrorLevel.ERROR) {
            logger.error(`[${ErrorCategory[category]}] ${formattedError.message}`, formattedError);
        }
        else if (level === ErrorLevel.WARNING) {
            logger.warn(`[${ErrorCategory[category]}] ${formattedError.message}`, formattedError);
        }
        else {
            logger.info(`[${ErrorCategory[category]}] ${formattedError.message}`, formattedError);
        }
        // Report to telemetry/monitoring if appropriate
        if (level === ErrorLevel.FATAL || level === ErrorLevel.MAJOR) {
            this.reportError(formattedError, options);
        }
    }
    /**
     * Format an error object for consistent handling
     */
    formatError(error) {
        return error instanceof Error ? error : new Error(String(error));
    }
    /**
     * Get an error message from any error type
     */
    getErrorMessage(error) {
        return error.message;
    }
    /**
     * Report an error to monitoring/telemetry systems
     */
    reportError(error, options = {}) {
        // We're skipping Sentry SDK as requested
        // In a real implementation, this would send the error to Sentry
        // Instead, just log that we would report it
        logger.debug('Would report error to monitoring system:', {
            error: error.message,
            level: options.level,
            category: options.category
        });
    }
    logError(error, level = ErrorLevel.ERROR) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(err.message, err);
    }
}
// Export error types
export * from './types.js';
//# sourceMappingURL=index.js.map