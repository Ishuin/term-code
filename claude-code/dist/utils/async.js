/**
 * Async Utilities
 *
 * Provides utilities for handling asynchronous operations,
 * timeouts, retries, and other async patterns.
 */
import { logger } from './logger.js';
/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
};
/**
 * Sleep for the specified number of milliseconds
 */
export async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Execute a function with a timeout
 *
 * @param fn Function to execute with timeout
 * @param timeoutMs Timeout in milliseconds
 * @returns A function that wraps the original function with timeout
 */
export function withTimeout(fn, timeoutMs) {
    return async (...args) => {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const error = new Error(`Operation timed out after ${timeoutMs}ms`);
                error.name = 'TimeoutError';
                reject(error);
            }, timeoutMs);
            fn(...args)
                .then(result => {
                clearTimeout(timeoutId);
                resolve(result);
            })
                .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    };
}
/**
 * Execute a function with retry logic
 *
 * @param fn Function to execute with retry logic
 * @param options Retry options
 * @returns A function that wraps the original function with retry logic
 */
export function withRetry(fn, options = {}) {
    // Set default retry options
    const retryOptions = {
        maxRetries: options.maxRetries ?? 3,
        initialDelayMs: options.initialDelayMs ?? 1000,
        maxDelayMs: options.maxDelayMs ?? 10000,
        backoff: options.backoff ?? true,
        isRetryable: options.isRetryable,
        onRetry: options.onRetry
    };
    // Return a function that wraps the original function with retry logic
    return async (...args) => {
        let lastError = new Error('Unknown error');
        for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
            try {
                // First attempt (attempt = 0) doesn't count as a retry
                if (attempt === 0) {
                    return await fn(...args);
                }
                // Wait before retry
                const delayMs = calculateRetryDelay(attempt, retryOptions);
                await delay(delayMs);
                // Execute retry callback if provided
                if (retryOptions.onRetry) {
                    retryOptions.onRetry(lastError, attempt);
                }
                // Execute the function
                return await fn(...args);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                // Check if we've reached the maximum number of retries
                if (attempt >= retryOptions.maxRetries) {
                    throw lastError;
                }
                // Check if the error is retryable
                if (retryOptions.isRetryable && !retryOptions.isRetryable(lastError)) {
                    throw lastError;
                }
            }
        }
        // This should never be reached, but TypeScript needs a return
        throw lastError;
    };
}
/**
 * Calculate the delay time for a retry attempt
 */
function calculateRetryDelay(attempt, options) {
    if (!options.backoff) {
        return options.initialDelayMs;
    }
    // Exponential backoff: initialDelay * 2^(attempt-1)
    const exponentialDelay = options.initialDelayMs * Math.pow(2, attempt - 1);
    // Add some jitter (±10%) to avoid retry stampedes
    const jitter = 0.1 * exponentialDelay;
    const jitteredDelay = exponentialDelay - jitter + (Math.random() * jitter * 2);
    // Cap at maximum delay
    return Math.min(jitteredDelay, options.maxDelayMs);
}
/**
 * Run operations in parallel with a concurrency limit
 */
export async function withConcurrency(items, fn, concurrency = 5) {
    if (!items.length)
        return [];
    const results = new Array(items.length);
    let currentIndex = 0;
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async (_, workerId) => {
        while (currentIndex < items.length) {
            const index = currentIndex++;
            logger.debug(`Worker ${workerId} processing item ${index}`);
            try {
                results[index] = await fn(items[index], index);
            }
            catch (error) {
                logger.error(`Error processing item ${index}`, error);
                throw error; // Fail fast
            }
        }
    });
    await Promise.all(workers);
    return results;
}
/**
 * Create a debounced version of a function
 *
 * @param fn Function to debounce
 * @param waitMs Wait time in milliseconds
 * @param options Debounce options
 * @returns Debounced function
 */
export function debounce(fn, waitMs, options = {}) {
    let timeout = null;
    let lastArgs = null;
    let lastCallTime = null;
    let lastInvokeTime = 0;
    const leading = options.leading ?? false;
    const trailing = options.trailing ?? true;
    const maxWait = options.maxWait;
    // Check if we should invoke the function
    function shouldInvoke(time) {
        if (lastCallTime === null) {
            return true;
        }
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        // Invoke if:
        // 1. It's the first call, or
        // 2. We've waited long enough since the last call, or
        // 3. We've reached the maximum wait time (if defined)
        return (lastCallTime === null ||
            timeSinceLastCall >= waitMs ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
    }
    // Invoke the function
    function invokeFunc(time) {
        const args = lastArgs;
        lastArgs = null;
        lastInvokeTime = time;
        fn(...args);
    }
    // Handle the trailing edge invocation
    function trailingEdge(time) {
        timeout = null;
        if (trailing && lastArgs) {
            invokeFunc(time);
        }
        lastArgs = null;
    }
    // Start the timer for the trailing edge
    function startTimer() {
        timeout = setTimeout(() => {
            const time = Date.now();
            trailingEdge(time);
        }, waitMs);
    }
    // Handle a new function call
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        // Restart the timer
        timeout = setTimeout(timerExpired, Math.min(waitMs - (time - lastCallTime), maxWait !== undefined ? maxWait - (time - lastInvokeTime) : waitMs));
    }
    // Leading edge invocation
    function leadingEdge(time) {
        lastInvokeTime = time;
        // Start the timer for trailing edge
        startTimer();
        // Invoke the function
        if (leading) {
            invokeFunc(time);
        }
    }
    // The debounced function
    return function debouncedFunction(...args) {
        const time = Date.now();
        lastArgs = args;
        lastCallTime = time;
        const isInvoking = shouldInvoke(time);
        if (isInvoking) {
            if (timeout === null) {
                leadingEdge(time);
                return;
            }
            if (maxWait !== undefined) {
                // Handle maxWait
                timeout = setTimeout(timerExpired, maxWait);
            }
        }
        else if (timeout === null && trailing) {
            // Start timer for trailing edge
            startTimer();
        }
    };
}
/**
 * Create a throttled version of a function
 *
 * @param fn Function to throttle
 * @param waitMs Wait time in milliseconds
 * @param options Throttle options
 * @returns Throttled function
 */
export function throttle(fn, waitMs, options = {}) {
    const leading = options.leading ?? true;
    const trailing = options.trailing ?? true;
    // Use debounce with maxWait equal to waitMs
    return debounce(fn, waitMs, {
        leading,
        trailing,
        maxWait: waitMs
    });
}
/**
 * Create a deferred promise
 */
export function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
/**
 * Run functions in sequence
 */
export async function runSequentially(fns) {
    const results = [];
    for (const fn of fns) {
        results.push(await fn());
    }
    return results;
}
export default {
    delay,
    withTimeout,
    withRetry,
    withConcurrency,
    debounce,
    throttle,
    createDeferred,
    runSequentially
};
//# sourceMappingURL=async.js.map