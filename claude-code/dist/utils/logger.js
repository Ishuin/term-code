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
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 4] = "SILENT";
})(LogLevel || (LogLevel = {}));
/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
    level: LogLevel.INFO,
    timestamps: true,
    colors: true,
    verbose: false
};
/**
 * Logger class
 */
class Logger {
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Set logger configuration
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.config.level = level;
    }
    /**
     * Log a debug message
     */
    debug(message, context) {
        this.log(message, LogLevel.DEBUG, context);
    }
    /**
     * Log an info message
     */
    info(message, context) {
        this.log(message, LogLevel.INFO, context);
    }
    /**
     * Log a warning message
     */
    warn(message, context) {
        this.log(message, LogLevel.WARN, context);
    }
    /**
     * Log an error message
     */
    error(message, context) {
        this.log(message, LogLevel.ERROR, context);
    }
    /**
     * Log a message with level
     */
    log(message, level, context) {
        // Check if this log level should be displayed
        if (level < this.config.level) {
            return;
        }
        // Format the message
        const formattedMessage = this.formatMessage(message, level, context);
        // Send to destination
        if (this.config.destination) {
            this.config.destination(formattedMessage, level);
        }
        else {
            this.logToConsole(formattedMessage, level);
        }
    }
    /**
     * Format a log message
     */
    formatMessage(message, level, context) {
        let result = '';
        // Add timestamp if enabled
        if (this.config.timestamps) {
            const timestamp = new Date().toISOString();
            result += `[${timestamp}] `;
        }
        // Add log level
        result += `${this.getLevelName(level)}: `;
        // Add message
        result += message;
        // Add context if verbose and context is provided
        if (this.config.verbose && context) {
            try {
                if (typeof context === 'object') {
                    const contextStr = JSON.stringify(context);
                    result += ` ${contextStr}`;
                }
                else {
                    result += ` ${context}`;
                }
            }
            catch (error) {
                result += ' [Context serialization failed]';
            }
        }
        return result;
    }
    /**
     * Get the name of a log level
     */
    getLevelName(level) {
        switch (level) {
            case LogLevel.DEBUG:
                return this.colorize('DEBUG', '\x1b[36m'); // Cyan
            case LogLevel.INFO:
                return this.colorize('INFO', '\x1b[32m'); // Green
            case LogLevel.WARN:
                return this.colorize('WARN', '\x1b[33m'); // Yellow
            case LogLevel.ERROR:
                return this.colorize('ERROR', '\x1b[31m'); // Red
            default:
                return 'UNKNOWN';
        }
    }
    /**
     * Colorize a string if colors are enabled
     */
    colorize(text, colorCode) {
        if (!this.config.colors) {
            return text;
        }
        return `${colorCode}${text}\x1b[0m`;
    }
    /**
     * Log to console
     */
    logToConsole(message, level) {
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(message);
                break;
            case LogLevel.INFO:
                console.info(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
                console.error(message);
                break;
        }
    }
    /**
     * Convert ErrorLevel to LogLevel
     */
    errorLevelToLogLevel(level) {
        switch (level) {
            case ErrorLevel.DEBUG:
                return LogLevel.DEBUG;
            case ErrorLevel.INFO:
                return LogLevel.INFO;
            case ErrorLevel.WARNING:
                return LogLevel.WARN;
            case ErrorLevel.ERROR:
            case ErrorLevel.CRITICAL:
            case ErrorLevel.FATAL:
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }
}
// Create singleton logger instance
export const logger = new Logger();
// Configure logger based on environment
if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
    logger.setLevel(LogLevel.DEBUG);
}
else if (process.env.VERBOSE === 'true') {
    logger.configure({ verbose: true });
}
else if (process.env.LOG_LEVEL) {
    const level = parseInt(process.env.LOG_LEVEL, 10);
    if (!isNaN(level) && level >= LogLevel.DEBUG && level <= LogLevel.SILENT) {
        logger.setLevel(level);
    }
}
export default logger;
//# sourceMappingURL=logger.js.map