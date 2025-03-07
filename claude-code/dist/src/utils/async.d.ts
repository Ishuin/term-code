/**
 * Async Utilities
 *
 * Provides utilities for handling asynchronous operations,
 * timeouts, retries, and other async patterns.
 */
/**
 * Options for retry operations
 */
export interface RetryOptions {
    /**
     * Maximum number of retry attempts
     */
    maxRetries: number;
    /**
     * Initial delay in milliseconds before the first retry
     */
    initialDelayMs: number;
    /**
     * Maximum delay in milliseconds between retries
     */
    maxDelayMs: number;
    /**
     * Whether to use exponential backoff (true) or constant delay (false)
     */
    backoff?: boolean;
    /**
     * Optional function to determine if an error is retryable
     */
    isRetryable?: (error: Error) => boolean;
    /**
     * Optional callback to execute before each retry
     */
    onRetry?: (error: Error, attempt: number) => void;
}
/**
 * Sleep for the specified number of milliseconds
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Execute a function with a timeout
 *
 * @param fn Function to execute with timeout
 * @param timeoutMs Timeout in milliseconds
 * @returns A function that wraps the original function with timeout
 */
export declare function withTimeout<T extends (...args: any[]) => Promise<any>>(fn: T, timeoutMs: number): (...args: Parameters<T>) => Promise<ReturnType<T>>;
/**
 * Execute a function with retry logic
 *
 * @param fn Function to execute with retry logic
 * @param options Retry options
 * @returns A function that wraps the original function with retry logic
 */
export declare function withRetry<T extends (...args: any[]) => Promise<any>>(fn: T, options?: Partial<RetryOptions>): (...args: Parameters<T>) => Promise<ReturnType<T>>;
/**
 * Run operations in parallel with a concurrency limit
 */
export declare function withConcurrency<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, concurrency?: number): Promise<R[]>;
/**
 * Create a debounced version of a function
 *
 * @param fn Function to debounce
 * @param waitMs Wait time in milliseconds
 * @param options Debounce options
 * @returns Debounced function
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, waitMs: number, options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}): (...args: Parameters<T>) => void;
/**
 * Create a throttled version of a function
 *
 * @param fn Function to throttle
 * @param waitMs Wait time in milliseconds
 * @param options Throttle options
 * @returns Throttled function
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, waitMs: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: Parameters<T>) => void;
/**
 * Create a deferred promise
 */
export declare function createDeferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
};
/**
 * Run functions in sequence
 */
export declare function runSequentially<T>(fns: Array<() => Promise<T>>): Promise<T[]>;
declare const _default: {
    delay: typeof delay;
    withTimeout: typeof withTimeout;
    withRetry: typeof withRetry;
    withConcurrency: typeof withConcurrency;
    debounce: typeof debounce;
    throttle: typeof throttle;
    createDeferred: typeof createDeferred;
    runSequentially: typeof runSequentially;
};
export default _default;
