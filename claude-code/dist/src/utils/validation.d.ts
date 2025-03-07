/**
 * Validation Utilities
 *
 * Provides utilities for validating inputs, checking types,
 * and ensuring data conforms to expected formats.
 */
/**
 * Check if a value is defined (not undefined or null)
 */
export declare function isDefined<T>(value: T | undefined | null): value is T;
/**
 * Check if a value is a non-empty string
 */
export declare function isNonEmptyString(value: unknown): value is string;
/**
 * Check if a value is a number (and optionally within range)
 */
export declare function isNumber(value: unknown, options?: {
    min?: number;
    max?: number;
}): value is number;
/**
 * Check if a value is a boolean
 */
export declare function isBoolean(value: unknown): value is boolean;
/**
 * Check if a value is an object (and not an array or null)
 */
export declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * Check if a value is an array
 */
export declare function isArray<T>(value: unknown, itemValidator?: (item: unknown) => item is T): value is T[];
/**
 * Check if a value is a valid date
 */
export declare function isValidDate(value: unknown): value is Date;
/**
 * Check if a string is a valid email address
 */
export declare function isEmail(value: string): boolean;
/**
 * Check if a string is a valid URL
 */
export declare function isUrl(value: string): boolean;
/**
 * Check if a string is a valid path
 */
export declare function isValidPath(value: string): boolean;
/**
 * Check if a string is a valid file path
 */
export declare function isValidFilePath(value: string): boolean;
/**
 * Check if a string is a valid directory path
 */
export declare function isValidDirectoryPath(value: string): boolean;
/**
 * Check if a string is valid JSON
 */
export declare function isValidJson(value: string): boolean;
/**
 * Validate an object against a schema
 */
export declare function validateObject<T>(obj: unknown, schema: Record<keyof T, (value: unknown) => boolean>, options?: {
    allowExtraProps?: boolean;
    required?: Array<keyof T>;
}): {
    valid: boolean;
    errors: string[];
};
/**
 * Create a validator function for an enum
 */
export declare function createEnumValidator<T extends string | number>(enumObj: Record<string, T>): (value: unknown) => value is T;
/**
 * Create a validator that ensures a value is one of the allowed values
 */
export declare function createOneOfValidator<T>(allowedValues: T[]): (value: unknown) => value is T;
/**
 * Create a validator that combines multiple validators with AND logic
 */
export declare function createAllValidator(...validators: Array<(value: unknown) => boolean>): (value: unknown) => boolean;
/**
 * Create a validator that combines multiple validators with OR logic
 */
export declare function createAnyValidator(...validators: Array<(value: unknown) => boolean>): (value: unknown) => boolean;
declare const _default: {
    isDefined: typeof isDefined;
    isNonEmptyString: typeof isNonEmptyString;
    isNumber: typeof isNumber;
    isBoolean: typeof isBoolean;
    isObject: typeof isObject;
    isArray: typeof isArray;
    isValidDate: typeof isValidDate;
    isEmail: typeof isEmail;
    isUrl: typeof isUrl;
    isValidPath: typeof isValidPath;
    isValidFilePath: typeof isValidFilePath;
    isValidDirectoryPath: typeof isValidDirectoryPath;
    isValidJson: typeof isValidJson;
    validateObject: typeof validateObject;
    createEnumValidator: typeof createEnumValidator;
    createOneOfValidator: typeof createOneOfValidator;
    createAllValidator: typeof createAllValidator;
    createAnyValidator: typeof createAnyValidator;
};
export default _default;
