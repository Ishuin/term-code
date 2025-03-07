/**
 * Telemetry System
 *
 * Collects anonymous usage data and error reports to help improve the tool.
 * Respects user privacy and can be disabled.
 */
/**
 * Telemetry event types
 */
export declare enum TelemetryEventType {
    CLI_START = "cli_start",
    CLI_EXIT = "cli_exit",
    COMMAND_EXECUTE = "command_execute",
    COMMAND_SUCCESS = "command_success",
    COMMAND_ERROR = "command_error",
    AI_REQUEST = "ai_request",
    AI_RESPONSE = "ai_response",
    AI_ERROR = "ai_error",
    AUTH_SUCCESS = "auth_success",
    AUTH_ERROR = "auth_error"
}
/**
 * Telemetry event
 */
export interface TelemetryEvent {
    /**
     * Event type
     */
    type: TelemetryEventType;
    /**
     * Event timestamp
     */
    timestamp: string;
    /**
     * Event properties
     */
    properties: Record<string, any>;
    /**
     * Client information
     */
    client: {
        /**
         * CLI version
         */
        version: string;
        /**
         * Client ID (anonymous)
         */
        id: string;
        /**
         * Node.js version
         */
        nodeVersion: string;
        /**
         * Operating system
         */
        os: string;
        /**
         * Operating system version
         */
        osVersion: string;
    };
}
/**
 * Telemetry configuration
 */
export interface TelemetryConfig {
    /**
     * Whether telemetry is enabled
     */
    enabled: boolean;
    /**
     * Client ID (anonymous)
     */
    clientId: string;
    /**
     * Endpoint for sending telemetry data
     */
    endpoint?: string;
    /**
     * Additional data to include with all events
     */
    additionalData?: Record<string, any>;
}
/**
 * Telemetry manager
 */
declare class TelemetryManager {
    private config;
    private initialized;
    private eventQueue;
    private batchSendTimeout;
    private flushPromise;
    /**
     * Create a new telemetry manager
     */
    constructor();
    /**
     * Initialize telemetry
     */
    initialize(userPreferences?: {
        telemetry?: boolean;
    }): Promise<void>;
    /**
     * Generate an anonymous client ID
     */
    private generateClientId;
    /**
     * Setup process exit handlers to ensure telemetry is sent
     */
    private setupExitHandlers;
    /**
     * Track an event
     */
    trackEvent(type: TelemetryEventType, properties?: Record<string, any>): void;
    /**
     * Track a command execution
     */
    trackCommand(commandName: string, args?: Record<string, any>, successful?: boolean): void;
    /**
     * Track an error
     */
    trackError(error: unknown, context?: Record<string, any>): void;
    /**
     * Create a telemetry event
     */
    private createEvent;
    /**
     * Queue an event for sending
     */
    private queueEvent;
    /**
     * Flush events asynchronously
     */
    flush(): Promise<void>;
    /**
     * Flush events synchronously (for exit handlers)
     */
    private flushSync;
    /**
     * Flush events to the telemetry endpoint
     */
    private flushEvents;
    /**
     * Enable telemetry
     */
    enable(): void;
    /**
     * Disable telemetry
     */
    disable(): void;
    /**
     * Check if telemetry is enabled
     */
    isEnabled(): boolean;
}
export declare const telemetry: TelemetryManager;
export default telemetry;
/**
 * Initialize the telemetry system
 *
 * @param config Configuration options for telemetry
 * @returns The initialized telemetry manager
 */
export declare function initTelemetry(config?: any): Promise<any>;
