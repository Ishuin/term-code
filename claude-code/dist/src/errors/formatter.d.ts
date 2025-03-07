/**
 * Error Formatter
 *
 * Utilities for formatting errors and creating user-friendly error messages.
 */
import { ErrorCategory, ErrorLevel, UserError, UserErrorOptions } from './types.js';
/**
 * Create a user-friendly error from any error
 */
export declare function createUserError(message: string, options?: UserErrorOptions): UserError;
/**
 * Format an error for display to the user
 */
export declare function formatErrorForDisplay(error: unknown): string;
/**
 * Convert an error to a UserError if it isn't already
 */
export declare function ensureUserError(error: unknown, defaultMessage?: string, options?: UserErrorOptions): UserError;
/**
 * Get a category name for an error
 */
export declare function getErrorCategoryName(category: ErrorCategory): string;
/**
 * Get an error level name
 */
export declare function getErrorLevelName(level: ErrorLevel): string;
/**
 * Get detailed information about an error
 */
export declare function getErrorDetails(error: unknown): string;
