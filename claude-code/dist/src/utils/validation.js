/**
 * Validation Utilities
 *
 * Provides utilities for validating inputs, checking types,
 * and ensuring data conforms to expected formats.
 */
/**
 * Check if a value is defined (not undefined or null)
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * Check if a value is a non-empty string
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Check if a value is a number (and optionally within range)
 */
export function isNumber(value, options = {}) {
    if (typeof value !== 'number' || isNaN(value)) {
        return false;
    }
    const { min, max } = options;
    if (min !== undefined && value < min) {
        return false;
    }
    if (max !== undefined && value > max) {
        return false;
    }
    return true;
}
/**
 * Check if a value is a boolean
 */
export function isBoolean(value) {
    return typeof value === 'boolean';
}
/**
 * Check if a value is an object (and not an array or null)
 */
export function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Check if a value is an array
 */
export function isArray(value, itemValidator) {
    if (!Array.isArray(value)) {
        return false;
    }
    if (itemValidator) {
        return value.every(item => itemValidator(item));
    }
    return true;
}
/**
 * Check if a value is a valid date
 */
export function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
/**
 * Check if a string is a valid email address
 */
export function isEmail(value) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
}
/**
 * Check if a string is a valid URL
 */
export function isUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/**
 * Check if a string is a valid path
 */
export function isValidPath(value) {
    // Basic path validation
    return /^[a-zA-Z0-9\/\\\._\-~]+$/.test(value) && !value.includes('..') && value.length > 0;
}
/**
 * Check if a string is a valid file path
 */
export function isValidFilePath(value) {
    return isValidPath(value) && !value.endsWith('/') && !value.endsWith('\\');
}
/**
 * Check if a string is a valid directory path
 */
export function isValidDirectoryPath(value) {
    return isValidPath(value);
}
/**
 * Check if a string is valid JSON
 */
export function isValidJson(value) {
    try {
        JSON.parse(value);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validate an object against a schema
 */
export function validateObject(obj, schema, options = {}) {
    const errors = [];
    if (!isObject(obj)) {
        return { valid: false, errors: ['Expected an object'] };
    }
    // Check required fields
    if (options.required) {
        for (const key of options.required) {
            if (!(key in obj)) {
                errors.push(`Missing required field: ${String(key)}`);
            }
        }
    }
    // Check each field against schema
    for (const [key, validator] of Object.entries(schema)) {
        if (key in obj) {
            const value = obj[key];
            if (!validator(value)) {
                errors.push(`Invalid value for field: ${key}`);
            }
        }
    }
    // Check for extra properties
    if (options.allowExtraProps === false) {
        for (const key of Object.keys(obj)) {
            if (!(key in schema)) {
                errors.push(`Unexpected field: ${key}`);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Create a validator function for an enum
 */
export function createEnumValidator(enumObj) {
    const validValues = Object.values(enumObj);
    return function isValidEnum(value) {
        return validValues.includes(value);
    };
}
/**
 * Create a validator that ensures a value is one of the allowed values
 */
export function createOneOfValidator(allowedValues) {
    return function isOneOf(value) {
        return allowedValues.includes(value);
    };
}
/**
 * Create a validator that combines multiple validators with AND logic
 */
export function createAllValidator(...validators) {
    return function validateAll(value) {
        return validators.every(validator => validator(value));
    };
}
/**
 * Create a validator that combines multiple validators with OR logic
 */
export function createAnyValidator(...validators) {
    return function validateAny(value) {
        return validators.some(validator => validator(value));
    };
}
export default {
    isDefined,
    isNonEmptyString,
    isNumber,
    isBoolean,
    isObject,
    isArray,
    isValidDate,
    isEmail,
    isUrl,
    isValidPath,
    isValidFilePath,
    isValidDirectoryPath,
    isValidJson,
    validateObject,
    createEnumValidator,
    createOneOfValidator,
    createAllValidator,
    createAnyValidator
};
//# sourceMappingURL=validation.js.map