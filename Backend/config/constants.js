/**
 * Concepts Implemented:
 * 1. Mutability: Using Object.freeze to create immutable configuration objects.
 *    This prevents accidental modification of configuration values at runtime.
 */

export const MEMORY_CONFIG = Object.freeze({
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    MAX_TAGS: 10,
    VISIBILITY_OPTIONS: ['public', 'private', 'friends']
});

export const USER_CONFIG = Object.freeze({
    MIN_PASSWORD_LENGTH: 6,
    MAX_BIO_LENGTH: 150
});
