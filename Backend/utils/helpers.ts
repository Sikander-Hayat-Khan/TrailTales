/**
 * Concepts Implemented:
 * 1. Recursion: sanitizeObject function recursively traverses the object to remove sensitive fields.
 * 2. Debugging: assert function for runtime checks (Preconditions).
 */

/**
 * Recursively removes keys starting with '_' (except '_id') and 'password' fields.
 * @param {Object} obj - The object to sanitize.
 * @returns {Object} - The sanitized object.
 */
export const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const newObj: any = {};
    for (const key in obj) {
        if (key === 'password' || (key.startsWith('_') && key !== '_id')) {
            continue;
        }
        newObj[key] = sanitizeObject(obj[key]);
    }
    return newObj;
};

/**
 * Simple assertion function.
 * @param {boolean} condition - The condition to check.
 * @param {string} message - The error message if assertion fails.
 */
export const assert = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
};
