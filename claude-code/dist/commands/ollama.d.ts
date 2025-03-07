/**
 * Ollama Commands
 *
 * Commands for interacting with Ollama LLMs.
 */
import { CommandDef as CommandDefinition } from './index.js';
/**
 * List available Ollama models
 */
export declare const listModelsCommand: CommandDefinition;
/**
 * Set the active Ollama model
 */
export declare const setModelCommand: CommandDefinition;
/**
 * Show the currently active Ollama model
 */
export declare const showModelCommand: CommandDefinition;
/**
 * Set the Ollama server URL
 */
export declare const setServerCommand: CommandDefinition;
/**
 * All Ollama commands
 */
export declare const ollamaCommands: CommandDefinition[];
