/**
 * Terminal Formatting Utilities
 *
 * Provides functions for formatting and displaying text in the terminal.
 */
/**
 * Clear the terminal screen
 */
export declare function clearScreen(): void;
/**
 * Get the terminal size (rows and columns)
 */
export declare function getTerminalSize(): {
    rows: number;
    columns: number;
};
/**
 * Options for formatting output
 */
export interface FormatOptions {
    /**
     * Terminal width in columns
     */
    width?: number;
    /**
     * Whether to use colors
     */
    colors?: boolean;
    /**
     * Whether to highlight code
     */
    codeHighlighting?: boolean;
}
/**
 * Format output for display in the terminal
 */
export declare function formatOutput(text: string, options?: FormatOptions): string;
/**
 * Word wrap text to the specified width
 */
export declare function wordWrap(text: string, width: number): string;
