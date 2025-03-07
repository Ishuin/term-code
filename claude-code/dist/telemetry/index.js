/**
 * Telemetry System
 *
 * Collects anonymous usage data and error reports to help improve the tool.
 * Respects user privacy and can be disabled.
 */
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCategory } from '../errors/types.js';
import { logger } from '../utils/logger.js';
/**
 * Telemetry event types
 */
export var TelemetryEventType;
(function (TelemetryEventType) {
    TelemetryEventType["CLI_START"] = "cli_start";
    TelemetryEventType["CLI_EXIT"] = "cli_exit";
    TelemetryEventType["COMMAND_EXECUTE"] = "command_execute";
    TelemetryEventType["COMMAND_SUCCESS"] = "command_success";
    TelemetryEventType["COMMAND_ERROR"] = "command_error";
    TelemetryEventType["AI_REQUEST"] = "ai_request";
    TelemetryEventType["AI_RESPONSE"] = "ai_response";
    TelemetryEventType["AI_ERROR"] = "ai_error";
    TelemetryEventType["AUTH_SUCCESS"] = "auth_success";
    TelemetryEventType["AUTH_ERROR"] = "auth_error";
})(TelemetryEventType || (TelemetryEventType = {}));
/**
 * Default telemetry configuration
 */
const DEFAULT_CONFIG = {
    enabled: true,
    clientId: '',
    endpoint: 'https://telemetry.anthropic.com/claude-code/events'
};
/**
 * Telemetry manager
 */
class TelemetryManager {
    config;
    initialized = false;
    eventQueue = [];
    batchSendTimeout = null;
    flushPromise = null;
    /**
     * Create a new telemetry manager
     */
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
    }
    /**
     * Initialize telemetry
     */
    async initialize(userPreferences) {
        if (this.initialized) {
            return;
        }
        try {
            // Check if telemetry is explicitly disabled in user preferences
            if (userPreferences?.telemetry === false) {
                this.config.enabled = false;
            }
            else if (process.env.CLAUDE_CODE_TELEMETRY === 'false') {
                // Also check environment variable
                this.config.enabled = false;
            }
            // Generate client ID if not already set
            if (!this.config.clientId) {
                this.config.clientId = this.generateClientId();
            }
            // Get CLI version from package.json
            this.config.additionalData = {
                ...this.config.additionalData,
                cliVersion: process.env.npm_package_version || '0.1.0'
            };
            this.initialized = true;
            // Only log if telemetry is enabled
            if (this.config.enabled) {
                logger.debug('Telemetry initialized', { clientId: this.config.clientId });
                // Send CLI start event
                this.trackEvent(TelemetryEventType.CLI_START);
                // Setup exit handlers
                this.setupExitHandlers();
            }
        }
        catch (error) {
            logger.error('Failed to initialize telemetry', error);
            this.config.enabled = false; // Disable telemetry on error
        }
    }
    /**
     * Generate an anonymous client ID
     */
    generateClientId() {
        return uuidv4();
    }
    /**
     * Setup process exit handlers to ensure telemetry is sent
     */
    setupExitHandlers() {
        // Handle normal exit
        process.on('exit', () => {
            this.trackEvent(TelemetryEventType.CLI_EXIT);
            this.flushSync();
        });
        // Handle SIGINT (Ctrl+C)
        process.on('SIGINT', () => {
            this.trackEvent(TelemetryEventType.CLI_EXIT, { reason: 'SIGINT' });
            this.flushSync();
            process.exit(0);
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.trackError(error, { fatal: true });
            this.flushSync();
        });
    }
    /**
     * Track an event
     */
    trackEvent(type, properties = {}) {
        if (!this.initialized) {
            this.eventQueue.push(this.createEvent(type, properties));
            return;
        }
        if (!this.config.enabled) {
            return;
        }
        const event = this.createEvent(type, properties);
        this.queueEvent(event);
    }
    /**
     * Track a command execution
     */
    trackCommand(commandName, args = {}, successful = true) {
        // Don't track sensitive commands
        if (commandName === 'login' || commandName === 'logout') {
            return;
        }
        // Create sanitized args (remove sensitive data)
        const sanitizedArgs = {};
        // Only include safe argument types and names
        for (const [key, value] of Object.entries(args)) {
            // Skip sensitive fields
            if (key.includes('key') || key.includes('token') || key.includes('password') || key.includes('secret')) {
                continue;
            }
            // Include only primitive values and sanitize them
            if (typeof value === 'string') {
                // Truncate long strings and remove potential sensitive data
                sanitizedArgs[key] = value.length > 100 ? `${value.substring(0, 100)}...` : value;
            }
            else if (typeof value === 'number' || typeof value === 'boolean') {
                sanitizedArgs[key] = value;
            }
            else if (value === null || value === undefined) {
                sanitizedArgs[key] = value;
            }
            else if (Array.isArray(value)) {
                sanitizedArgs[key] = `Array(${value.length})`;
            }
            else if (typeof value === 'object') {
                sanitizedArgs[key] = 'Object';
            }
        }
        const eventType = successful
            ? TelemetryEventType.COMMAND_SUCCESS
            : TelemetryEventType.COMMAND_ERROR;
        this.trackEvent(eventType, {
            command: commandName,
            args: sanitizedArgs
        });
    }
    /**
     * Track an error
     */
    trackError(error, context = {}) {
        if (!this.config.enabled) {
            return;
        }
        const errorObj = {
            name: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message : String(error),
            category: error instanceof Error &&
                'category' in error ?
                error.category :
                ErrorCategory.UNKNOWN
        };
        this.trackEvent(TelemetryEventType.COMMAND_ERROR, {
            error: errorObj,
            ...context
        });
    }
    /**
     * Create a telemetry event
     */
    createEvent(type, properties = {}) {
        // Ensure client info doesn't have any PII
        const filteredProperties = { ...properties };
        // Basic client information
        const event = {
            type,
            timestamp: new Date().toISOString(),
            properties: filteredProperties,
            client: {
                version: this.config.additionalData?.cliVersion || '0.1.0',
                id: this.config.clientId,
                nodeVersion: process.version,
                os: os.platform(),
                osVersion: os.release()
            }
        };
        return event;
    }
    /**
     * Queue an event for sending
     */
    queueEvent(event) {
        this.eventQueue.push(event);
        // Schedule batch sending if not already scheduled
        if (!this.batchSendTimeout && this.eventQueue.length > 0) {
            this.batchSendTimeout = setTimeout(() => {
                this.flushEvents();
            }, 5000);
        }
        // Immediately send if queue reaches threshold
        if (this.eventQueue.length >= 10) {
            this.flushEvents();
        }
    }
    /**
     * Flush events asynchronously
     */
    async flush() {
        if (this.flushPromise) {
            return this.flushPromise;
        }
        if (this.eventQueue.length === 0) {
            return Promise.resolve();
        }
        this.flushPromise = this.flushEvents();
        return this.flushPromise;
    }
    /**
     * Flush events synchronously (for exit handlers)
     */
    flushSync() {
        if (this.eventQueue.length === 0) {
            return;
        }
        if (!this.config.enabled || !this.config.endpoint) {
            this.eventQueue = [];
            return;
        }
        try {
            const eventsToSend = [...this.eventQueue];
            this.eventQueue = [];
            // Using a synchronous request would be added here
            // This is a simplified implementation
            logger.debug(`Would send ${eventsToSend.length} telemetry events synchronously`);
        }
        catch (error) {
            logger.debug('Failed to send telemetry events synchronously', error);
        }
    }
    /**
     * Flush events to the telemetry endpoint
     */
    async flushEvents() {
        if (this.batchSendTimeout) {
            clearTimeout(this.batchSendTimeout);
            this.batchSendTimeout = null;
        }
        if (this.eventQueue.length === 0) {
            this.flushPromise = null;
            return;
        }
        if (!this.config.enabled || !this.config.endpoint) {
            this.eventQueue = [];
            this.flushPromise = null;
            return;
        }
        try {
            const eventsToSend = [...this.eventQueue];
            this.eventQueue = [];
            logger.debug(`Sending ${eventsToSend.length} telemetry events`);
            // Send events
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventsToSend)
            });
            if (!response.ok) {
                throw new Error(`Failed to send telemetry events: ${response.status} ${response.statusText}`);
            }
            logger.debug('Successfully sent telemetry events');
        }
        catch (error) {
            logger.debug('Failed to send telemetry events', error);
            // Add events back to queue for retry
            // this.eventQueue.unshift(...eventsToSend);
        }
        finally {
            this.flushPromise = null;
        }
    }
    /**
     * Enable telemetry
     */
    enable() {
        this.config.enabled = true;
        logger.info('Telemetry enabled');
    }
    /**
     * Disable telemetry
     */
    disable() {
        this.config.enabled = false;
        logger.info('Telemetry disabled');
        // Clear event queue
        this.eventQueue = [];
        if (this.batchSendTimeout) {
            clearTimeout(this.batchSendTimeout);
            this.batchSendTimeout = null;
        }
    }
    /**
     * Check if telemetry is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
}
// Create singleton instance
export const telemetry = new TelemetryManager();
// Export default
export default telemetry;
/**
 * Initialize the telemetry system
 *
 * @param config Configuration options for telemetry
 * @returns The initialized telemetry manager
 */
export async function initTelemetry(config = {}) {
    logger.info('Initializing telemetry system');
    try {
        // Create telemetry manager
        const telemetryManager = new TelemetryManager();
        // Initialize with configuration
        const telemetryConfig = config.telemetry || {};
        // Check if telemetry is enabled (prefer environment variable)
        const telemetryEnabled = process.env.CLAUDE_CODE_TELEMETRY !== 'false' &&
            telemetryConfig.enabled !== false;
        // Initialize telemetry if enabled
        if (telemetryEnabled) {
            await telemetryManager.initialize({
                telemetry: telemetryEnabled
            });
            // Track CLI start event
            telemetryManager.trackEvent(TelemetryEventType.CLI_START, {
                version: config.version || 'unknown'
            });
            // Set up process exit handler to ensure telemetry is flushed
            process.on('exit', () => {
                telemetryManager.flush();
            });
            process.on('SIGINT', () => {
                telemetryManager.trackEvent(TelemetryEventType.CLI_EXIT, {
                    reason: 'SIGINT'
                });
                telemetryManager.flush();
                process.exit(0);
            });
            process.on('SIGTERM', () => {
                telemetryManager.trackEvent(TelemetryEventType.CLI_EXIT, {
                    reason: 'SIGTERM'
                });
                telemetryManager.flush();
                process.exit(0);
            });
            logger.info('Telemetry initialized successfully');
        }
        else {
            logger.info('Telemetry is disabled');
        }
        // Return telemetry interface
        return {
            /**
             * Track an event
             */
            trackEvent: (eventType, properties = {}) => {
                if (telemetryEnabled) {
                    telemetryManager.trackEvent(eventType, properties);
                }
            },
            /**
             * Track an error
             */
            trackError: (error, context = {}) => {
                if (telemetryEnabled) {
                    telemetryManager.trackError(error, context);
                }
            },
            /**
             * Flush telemetry events
             */
            flush: async () => {
                if (telemetryEnabled) {
                    return telemetryManager.flush();
                }
            },
            /**
             * Submit telemetry data
             */
            submitTelemetry: async () => {
                if (telemetryEnabled) {
                    return telemetryManager.flush();
                }
            },
            /**
             * Check if telemetry is enabled
             */
            isEnabled: () => {
                return telemetryManager.isEnabled();
            },
            /**
             * Enable telemetry
             */
            enable: () => {
                telemetryManager.enable();
            },
            /**
             * Disable telemetry
             */
            disable: () => {
                telemetryManager.disable();
            }
        };
    }
    catch (error) {
        logger.error('Failed to initialize telemetry system', error);
        // Return a noop telemetry interface if initialization fails
        return {
            trackEvent: () => { },
            trackError: () => { },
            flush: async () => { },
            submitTelemetry: async () => { },
            isEnabled: () => false,
            enable: () => { },
            disable: () => { }
        };
    }
}
//# sourceMappingURL=index.js.map