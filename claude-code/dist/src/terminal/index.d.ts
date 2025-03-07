/**
 * Terminal Interface Module
 *
 * Provides a user interface for interacting with Claude Code in the terminal.
 * Handles input/output, formatting, and display.
 */
import { TerminalInterface } from './types.js';
/**
 * Initialize the terminal interface
 */
export declare function initTerminal(config: any): Promise<TerminalInterface>;
export * from './types.js';
