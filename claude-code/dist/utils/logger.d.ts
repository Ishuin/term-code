/**
 * Logger
 *
 * Provides a consistent logging interface across the application.
 * Supports multiple log levels, formatting, and output destinations.
 */
import { ErrorLevel } from '../errors/types.js';
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}
/**
 * Logger configuration
 */
export interface LoggerConfig {
    /**
     * Minimum log level to display
     */
    level: LogLevel;
    /**
     * Whether to include timestamps in logs
     */
    timestamps: boolean;
    /**
     * Whether to colorize output
     */
    colors: boolean;
    /**
     * Whether to include additional context in logs
     */
    verbose: boolean;
    /**
     * Custom output destination (defaults to console)
     */
    destination?: (message: string, level: LogLevel) => void;
}
/**
 * Logger class
 */
declare class Logger {
    private config;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * Set logger configuration
     */
    configure(config: Partial<LoggerConfig>): void;
    /**
     * Set log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Log a debug message
     */
    debug(message: string, context?: any): void;
    /**
     * Log an info message
     */
    info(message: string, context?: any): void;
    /**
     * Log a warning message
     */
    warn(message: string, context?: any): void;
    /**
     * Log an error message
     */
    error(message: string, context?: any): void;
    /**
     * Log a message with level
     */
    private log;
    /**
     * Format a log message
     */
    private formatMessage;
    /**
     * Get the name of a log level
     */
    private getLevelName;
    /**
     * Colorize a string if colors are enabled
     */
    private colorize;
    /**
     * Log to console
     */
    private logToConsole;
    /**
     * Convert ErrorLevel to LogLevel
     */
    errorLevelToLogLevel(level: ErrorLevel): LogLevel;
}
export declare const logger: Logger;
export default logger;
