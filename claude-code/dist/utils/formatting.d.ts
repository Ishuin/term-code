/**
 * Formatting Utilities
 *
 * Provides utilities for formatting text, truncating strings,
 * handling terminal output, and other formatting tasks.
 */
/**
 * Truncate a string to a maximum length
 */
export declare function truncate(text: string, maxLength: number, suffix?: string): string;
/**
 * Format a number with commas as thousands separators
 */
export declare function formatNumber(num: number): string;
/**
 * Format a date to ISO string without milliseconds
 */
export declare function formatDate(date: Date): string;
/**
 * Format a file size in bytes to a human-readable string
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format a duration in milliseconds to a human-readable string
 */
export declare function formatDuration(ms: number): string;
/**
 * Indent a string with a specified number of spaces
 */
export declare function indent(text: string, spaces?: number): string;
/**
 * Strip ANSI escape codes from a string
 */
export declare function stripAnsi(text: string): string;
/**
 * Wrap text to a specified width
 */
export declare function wrapText(text: string, width?: number): string;
/**
 * Pad a string to a fixed width
 */
export declare function padString(text: string, width: number, padChar?: string, padRight?: boolean): string;
/**
 * Center a string within a fixed width
 */
export declare function centerString(text: string, width: number, padChar?: string): string;
/**
 * Create a simple text table
 */
export declare function createTextTable(rows: string[][], headers?: string[]): string;
/**
 * Format a key-value object as a string
 */
export declare function formatKeyValue(obj: Record<string, any>, options?: {
    indent?: number;
    keyValueSeparator?: string;
    includeEmpty?: boolean;
}): string;
/**
 * Convert camelCase to Title Case
 */
export declare function camelToTitleCase(text: string): string;
/**
 * Format error details
 */
export declare function formatErrorDetails(error: Error): string;
declare const _default: {
    truncate: typeof truncate;
    formatNumber: typeof formatNumber;
    formatDate: typeof formatDate;
    formatFileSize: typeof formatFileSize;
    formatDuration: typeof formatDuration;
    indent: typeof indent;
    stripAnsi: typeof stripAnsi;
    wrapText: typeof wrapText;
    padString: typeof padString;
    centerString: typeof centerString;
    createTextTable: typeof createTextTable;
    formatKeyValue: typeof formatKeyValue;
    camelToTitleCase: typeof camelToTitleCase;
    formatErrorDetails: typeof formatErrorDetails;
};
export default _default;
