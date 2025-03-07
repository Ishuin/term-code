/**
 * Terminal Prompts
 *
 * Provides functions for creating and handling user prompts in the terminal.
 */
import { Answers } from 'inquirer';
import { TerminalConfig } from './types.js';
/**
 * Create and display a prompt for user input
 */
export declare function createPrompt<T extends Answers>(options: any, config: TerminalConfig): Promise<T>;
/**
 * Create a text input prompt
 */
export declare function promptText(message: string, options?: {
    name?: string;
    default?: string;
    required?: boolean;
    validate?: (input: string) => boolean | string | Promise<boolean | string>;
}): Promise<string>;
/**
 * Create a password input prompt
 */
export declare function promptPassword(message: string, options?: {
    name?: string;
    mask?: string;
    required?: boolean;
}): Promise<string>;
/**
 * Create a confirmation prompt
 */
export declare function promptConfirm(message: string, options?: {
    name?: string;
    default?: boolean;
}): Promise<boolean>;
/**
 * Create a selection list prompt
 */
export declare function promptList<T>(message: string, choices: Array<string | {
    name: string;
    value: T;
    short?: string;
}>, options?: {
    name?: string;
    default?: T;
    pageSize?: number;
}): Promise<T>;
/**
 * Create a multi-select checkbox prompt
 */
export declare function promptCheckbox<T>(message: string, choices: Array<string | {
    name: string;
    value: T;
    checked?: boolean;
    disabled?: boolean | string;
}>, options?: {
    name?: string;
    pageSize?: number;
}): Promise<T[]>;
/**
 * Create an editor prompt
 */
export declare function promptEditor(message: string, options?: {
    name?: string;
    default?: string;
    postfix?: string;
}): Promise<string>;
