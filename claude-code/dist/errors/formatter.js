/**
 * Error Formatter
 *
 * Utilities for formatting errors and creating user-friendly error messages.
 */
import { ErrorCategory, ErrorLevel, UserError } from './types.js';
import { logger } from '../utils/logger.js';
import { formatErrorDetails } from '../utils/formatting.js';
/**
 * Create a user-friendly error from any error
 */
export function createUserError(message, options = {}) {
    // Create UserError instance
    const userError = new UserError(message, options);
    // Log the error with appropriate level
    const level = userError.level === ErrorLevel.FATAL ? 'error' : 'warn';
    logger[level](`User error: ${message}`, {
        category: userError.category,
        details: userError.details,
        resolution: userError.resolution
    });
    return userError;
}
/**
 * Format an error for display to the user
 */
export function formatErrorForDisplay(error) {
    // Handle undefined or null errors
    if (error === undefined) {
        return 'Undefined error occurred';
    }
    
    if (error === null) {
        return 'Null error occurred';
    }
    
    // Handle different error types
    if (error instanceof UserError) {
        return formatUserError(error);
    }
    
    if (error instanceof Error) {
        return formatSystemError(error);
    }
    
    // For any other type (objects, strings, numbers, etc.)
    try {
        return `Unknown error: ${typeof error === 'object' ? JSON.stringify(error) : String(error)}`;
    } catch (e) {
        return `Unknown error of type: ${typeof error}`;
    }
}
/**
 * Format a UserError for display
 */
function formatUserError(error) {
    let message = `Error: ${error.message}`;
    // Add resolution steps if available
    if (error.resolution) {
        const resolutionSteps = Array.isArray(error.resolution)
            ? error.resolution
            : [error.resolution];
        message += '\n\nTo resolve this:';
        resolutionSteps.forEach(step => {
            message += `\n• ${step}`;
        });
    }
    // Add details if available
    if (error.details && Object.keys(error.details).length > 0) {
        message += '\n\nDetails:';
        for (const [key, value] of Object.entries(error.details)) {
            const formattedValue = typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value);
            message += `\n${key}: ${formattedValue}`;
        }
    }
    return message;
}
/**
 * Format a system Error for display
 */
function formatSystemError(error) {
    // Handle case where error might be undefined or not have a message property
    if (!error) {
        return `System error: Unknown error (undefined)`;
    }
    
    const errorMessage = error.message || String(error);
    let message = `System error: ${errorMessage}`;
    
    // Add stack trace for certain categories of errors
    if (process.env.DEBUG === 'true') {
        message += `\n\nStack trace:\n${error.stack || 'No stack trace available'}`;
    }
    
    return message;
}
/**
 * Convert an error to a UserError if it isn't already
 */
export function ensureUserError(error, defaultMessage = 'An unexpected error occurred', options = {}) {
    if (error instanceof UserError) {
        return error;
    }
    const message = error instanceof Error
        ? error.message
        : typeof error === 'string'
            ? error
            : defaultMessage;
    return createUserError(message, {
        ...options,
        cause: error
    });
}
/**
 * Get a category name for an error
 */
export function getErrorCategoryName(category) {
    return ErrorCategory[category] || 'Unknown';
}
/**
 * Get an error level name
 */
export function getErrorLevelName(level) {
    return ErrorLevel[level] || 'Unknown';
}
/**
 * Get detailed information about an error
 */
export function getErrorDetails(error) {
    if (error instanceof UserError) {
        return formatUserError(error);
    }
    if (error instanceof Error) {
        return formatErrorDetails(error);
    }
    return String(error);
}
//# sourceMappingURL=formatter.js.map