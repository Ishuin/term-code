/**
 * Terminal Prompts
 * 
 * Provides functions for creating and handling user prompts in the terminal.
 */

import inquirer, { Question, Answers } from 'inquirer';
import { PromptOptions, TerminalConfig } from './types.js';
import { logger } from '../utils/logger.js';

/**
 * Create and display a prompt for user input
 */
export async function createPrompt<T extends Answers>(options: any, config: TerminalConfig): Promise<T> {
  logger.debug('Creating prompt', { type: options.type, name: options.name });
  
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    logger.warn('Terminal is not interactive, cannot prompt for input');
    throw new Error('Cannot prompt for input in non-interactive terminal');
  }
  
  try {
    // Create a properly typed question object
    const question = {
      type: options.type || 'input',
      name: options.name || 'value',
      message: options.message || '',
      default: options.default,
      // Only include properties that exist
      ...(options.choices && { choices: options.choices }),
      ...(options.validate && { validate: options.validate }),
      ...(options.filter && { filter: options.filter }),
      ...(options.transformer && { transformer: options.transformer }),
      ...(options.pageSize && { pageSize: options.pageSize }),
      ...(options.mask && { mask: options.mask })
    };
    
    const result = await inquirer.prompt([question]);
    logger.debug('Prompt result', { name: options.name, result });
    return result as T;
  } catch (error) {
    logger.error('Error in prompt', error);
    throw new Error(`Failed to prompt for ${options.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a text input prompt
 */
export async function promptText(message: string, options: {
  name?: string;
  default?: string;
  required?: boolean;
  validate?: (input: string) => boolean | string | Promise<boolean | string>;
} = {}): Promise<string> {
  const result = await createPrompt<{ [key: string]: string }>({
    type: 'input',
    name: options.name || 'input',
    message,
    default: options.default,
    required: options.required,
    validate: options.validate
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'input'];
}

/**
 * Create a password input prompt
 */
export async function promptPassword(message: string, options: {
  name?: string;
  mask?: string;
  required?: boolean;
} = {}): Promise<string> {
  const result = await createPrompt<{ [key: string]: string }>({
    type: 'password',
    name: options.name || 'password',
    message,
    mask: options.mask || '*',
    required: options.required
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'password'];
}

/**
 * Create a confirmation prompt
 */
export async function promptConfirm(message: string, options: {
  name?: string;
  default?: boolean;
} = {}): Promise<boolean> {
  const result = await createPrompt<{ [key: string]: boolean }>({
    type: 'confirm',
    name: options.name || 'confirm',
    message,
    default: options.default
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'confirm'];
}

/**
 * Create a selection list prompt
 */
export async function promptList<T>(message: string, choices: Array<string | { name: string; value: T; short?: string }>, options: {
  name?: string;
  default?: T;
  pageSize?: number;
} = {}): Promise<T> {
  const result = await createPrompt<{ [key: string]: T }>({
    type: 'list',
    name: options.name || 'list',
    message,
    choices,
    default: options.default,
    pageSize: options.pageSize
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'list'];
}

/**
 * Create a multi-select checkbox prompt
 */
export async function promptCheckbox<T>(message: string, choices: Array<string | { name: string; value: T; checked?: boolean; disabled?: boolean | string }>, options: {
  name?: string;
  pageSize?: number;
} = {}): Promise<T[]> {
  const result = await createPrompt<{ [key: string]: T[] }>({
    type: 'checkbox',
    name: options.name || 'checkbox',
    message,
    choices,
    pageSize: options.pageSize
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'checkbox'];
}

/**
 * Create an editor prompt
 */
export async function promptEditor(message: string, options: {
  name?: string;
  default?: string;
  postfix?: string;
} = {}): Promise<string> {
  const result = await createPrompt<{ [key: string]: string }>({
    type: 'editor',
    name: options.name || 'editor',
    message,
    default: options.default,
    postfix: options.postfix
  }, { theme: 'system', useColors: true, showProgressIndicators: true, codeHighlighting: true });
  
  return result[options.name || 'editor'];
} 