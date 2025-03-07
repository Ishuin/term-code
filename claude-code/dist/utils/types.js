/**
 * Type Declarations
 *
 * Re-exports and defines common types used throughout the application.
 * This helps centralize type definitions and avoid duplication.
 */
/**
 * Create a success result
 */
export function success(value) {
    return { success: true, value };
}
/**
 * Create a failure result
 */
export function failure(error) {
    return { success: false, error };
}
//# sourceMappingURL=types.js.map