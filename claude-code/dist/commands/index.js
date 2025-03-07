/**
 * Command System
 *
 * Provides a framework for registering, managing, and executing
 * CLI commands. Handles argument parsing, validation, and help text.
 */
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { logger } from '../utils/logger.js';
import { isNonEmptyString } from '../utils/validation.js';
import { registerCommands } from './register.js';
/**
 * Command argument types
 */
export var ArgType;
(function (ArgType) {
    ArgType["STRING"] = "string";
    ArgType["NUMBER"] = "number";
    ArgType["BOOLEAN"] = "boolean";
    ArgType["ARRAY"] = "array";
})(ArgType || (ArgType = {}));
/**
 * Command registry
 */
class CommandRegistry {
    commands = new Map();
    aliases = new Map();
    /**
     * Register a command
     */
    register(command) {
        // Validate command definition
        if (!isNonEmptyString(command.name)) {
            throw new Error('Command name is required');
        }
        if (!isNonEmptyString(command.description)) {
            throw new Error(`Command ${command.name} requires a description`);
        }
        if (!command.handler || typeof command.handler !== 'function') {
            throw new Error(`Command ${command.name} requires a handler function`);
        }
        // Check for duplicate command names
        if (this.commands.has(command.name) || this.aliases.has(command.name)) {
            throw new Error(`Command or alias '${command.name}' is already registered`);
        }
        // Register the command
        this.commands.set(command.name, command);
        logger.debug(`Registered command: ${command.name}`);
        // Register aliases
        if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
                if (this.commands.has(alias) || this.aliases.has(alias)) {
                    logger.warn(`Skipping duplicate alias '${alias}' for command '${command.name}'`);
                    continue;
                }
                this.aliases.set(alias, command.name);
                logger.debug(`Registered alias '${alias}' for command '${command.name}'`);
            }
        }
    }
    /**
     * Get a command by name or alias
     */
    get(nameOrAlias) {
        // Check if it's a direct command name
        if (this.commands.has(nameOrAlias)) {
            return this.commands.get(nameOrAlias);
        }
        // Check if it's an alias
        const commandName = this.aliases.get(nameOrAlias);
        if (commandName) {
            return this.commands.get(commandName);
        }
        return undefined;
    }
    /**
     * List all commands
     */
    list(options = {}) {
        const { includeHidden = false } = options;
        return Array.from(this.commands.values())
            .filter(cmd => includeHidden || !cmd.hidden);
    }
    /**
     * Check if a command exists
     */
    exists(nameOrAlias) {
        return this.commands.has(nameOrAlias) || this.aliases.has(nameOrAlias);
    }
    /**
     * Get command categories
     */
    getCategories() {
        const categories = new Set();
        for (const command of this.commands.values()) {
            if (command.category) {
                categories.add(command.category);
            }
        }
        return Array.from(categories).sort();
    }
    /**
     * Get commands by category
     */
    getByCategory(category, options = {}) {
        const { includeHidden = false } = options;
        return Array.from(this.commands.values())
            .filter(cmd => (includeHidden || !cmd.hidden) && cmd.category === category);
    }
}
// Create a singleton command registry
export const commandRegistry = new CommandRegistry();
/**
 * Parse command-line arguments
 */
export function parseArgs(args, command) {
    const result = {};
    const positionalArgs = [];
    const flagArgs = new Map();
    const errors = [];
    // Initialize defaults
    if (command.args) {
        for (const arg of command.args) {
            if (arg.default !== undefined) {
                result[arg.name] = arg.default;
            }
            // Map flags to arg definitions
            if (arg.position === undefined) {
                // Flag argument (--name or -n)
                flagArgs.set(`--${arg.name}`, arg);
                if (arg.shortFlag) {
                    flagArgs.set(`-${arg.shortFlag}`, arg);
                }
            }
        }
    }
    // Parse args
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--') || (arg.startsWith('-') && arg.length === 2)) {
            // Flag argument
            const argDef = flagArgs.get(arg);
            if (!argDef) {
                errors.push(`Unknown argument: ${arg}`);
                continue;
            }
            if (argDef.type === ArgType.BOOLEAN) {
                // Boolean flags don't need a value
                result[argDef.name] = true;
            }
            else {
                // Other flags need a value
                if (i + 1 >= args.length || args[i + 1].startsWith('-')) {
                    errors.push(`Missing value for argument: ${arg}`);
                    continue;
                }
                const value = args[++i];
                // Convert value based on type
                result[argDef.name] = convertArgValue(value, argDef);
                // Validate choices
                if (argDef.choices && !argDef.choices.includes(String(result[argDef.name]))) {
                    errors.push(`Invalid value for ${argDef.name}: ${value}. Valid values are: ${argDef.choices.join(', ')}`);
                }
            }
        }
        else {
            // Positional argument
            positionalArgs.push(arg);
        }
    }
    // Process positional args
    if (command.args) {
        const positionalArgDefs = command.args
            .filter(arg => arg.position !== undefined)
            .sort((a, b) => (a.position || 0) - (b.position || 0));
        for (let i = 0; i < positionalArgDefs.length; i++) {
            const argDef = positionalArgDefs[i];
            if (i < positionalArgs.length) {
                // Value provided
                result[argDef.name] = convertArgValue(positionalArgs[i], argDef);
                // Validate choices
                if (argDef.choices && !argDef.choices.includes(String(result[argDef.name]))) {
                    errors.push(`Invalid value for ${argDef.name}: ${positionalArgs[i]}. Valid values are: ${argDef.choices.join(', ')}`);
                }
            }
            else if (argDef.required) {
                // Required value not provided
                errors.push(`Missing required argument: ${argDef.name}`);
            }
        }
    }
    // Check for missing required flag args
    if (command.args) {
        for (const arg of command.args) {
            if (arg.required && result[arg.name] === undefined) {
                errors.push(`Missing required argument: ${arg.name}`);
            }
        }
    }
    // Throw if there are errors
    if (errors.length > 0) {
        throw createUserError(`Invalid arguments: ${errors.join('; ')}`, {
            category: ErrorCategory.VALIDATION,
            resolution: `Use 'claude-code help ${command.name}' to see usage information.`
        });
    }
    return result;
}
/**
 * Convert an argument value based on its type
 */
function convertArgValue(value, argDef) {
    switch (argDef.type) {
        case ArgType.NUMBER:
            const num = Number(value);
            if (isNaN(num)) {
                throw createUserError(`Invalid number: ${value}`, {
                    category: ErrorCategory.VALIDATION
                });
            }
            return num;
        case ArgType.BOOLEAN:
            return value.toLowerCase() === 'true';
        case ArgType.ARRAY:
            return value.split(',').map(v => v.trim());
        case ArgType.STRING:
        default:
            return value;
    }
}
/**
 * Generate help text for a command
 */
export function generateCommandHelp(command) {
    let help = `\n${command.name} - ${command.description}\n\n`;
    // Usage
    help += 'Usage:\n';
    help += `  claude-code ${command.name}`;
    // Add positional args to usage
    if (command.args) {
        const positionalArgs = command.args
            .filter(arg => arg.position !== undefined)
            .sort((a, b) => (a.position || 0) - (b.position || 0));
        for (const arg of positionalArgs) {
            const argDisplay = arg.required
                ? `<${arg.name}>`
                : `[${arg.name}]`;
            help += ` ${argDisplay}`;
        }
    }
    // Add flag options to usage
    if (command.args) {
        const flagArgs = command.args.filter(arg => arg.position === undefined);
        if (flagArgs.length > 0) {
            help += ' [options]';
        }
    }
    help += '\n\n';
    // Arguments section
    if (command.args && command.args.length > 0) {
        // List positional args
        const positionalArgs = command.args
            .filter(arg => arg.position !== undefined && !arg.hidden)
            .sort((a, b) => (a.position || 0) - (b.position || 0));
        if (positionalArgs.length > 0) {
            help += 'Arguments:\n';
            for (const arg of positionalArgs) {
                help += `  ${arg.name.padEnd(20)} ${arg.description}`;
                if (arg.default !== undefined) {
                    help += ` (default: ${arg.default})`;
                }
                if (arg.choices) {
                    help += ` (choices: ${arg.choices.join(', ')})`;
                }
                help += '\n';
            }
            help += '\n';
        }
        // List flag options
        const flagArgs = command.args.filter(arg => arg.position === undefined && !arg.hidden);
        if (flagArgs.length > 0) {
            help += 'Options:\n';
            for (const arg of flagArgs) {
                let flag = `--${arg.name}`;
                if (arg.shortFlag) {
                    flag = `-${arg.shortFlag}, ${flag}`;
                }
                help += `  ${flag.padEnd(20)} ${arg.description}`;
                if (arg.default !== undefined) {
                    help += ` (default: ${arg.default})`;
                }
                if (arg.choices) {
                    help += ` (choices: ${arg.choices.join(', ')})`;
                }
                help += '\n';
            }
            help += '\n';
        }
    }
    // Examples
    if (command.examples && command.examples.length > 0) {
        help += 'Examples:\n';
        for (const example of command.examples) {
            help += `  $ claude-code ${example}\n`;
        }
        help += '\n';
    }
    // Aliases
    if (command.aliases && command.aliases.length > 0) {
        help += `Aliases: ${command.aliases.join(', ')}\n\n`;
    }
    return help;
}
/**
 * Execute a command
 */
export async function executeCommand(commandName, args) {
    const command = commandRegistry.get(commandName);
    if (!command) {
        throw createUserError(`Unknown command: ${commandName}`, {
            category: ErrorCategory.COMMAND,
            resolution: 'Use "claude-code help" to see available commands.'
        });
    }
    try {
        // Parse arguments
        const parsedArgs = parseArgs(args, command);
        // Log command execution
        logger.debug(`Executing command: ${command.name}`, { args: parsedArgs });
        // Execute the command
        return await command.handler(parsedArgs);
    }
    catch (error) {
        logger.error(`Command ${command.name} failed:`, error);
        throw error;
    }
}
/**
 * Initialize the command processor
 *
 * @param config Configuration options
 * @param dependencies Application dependencies needed by commands
 */
export async function initCommandProcessor(config, dependencies) {
    logger.info('Initializing command processor');
    try {
        // Register all commands
        registerCommands();
        // Return the command processor interface
        return {
            /**
             * Execute a command with the given arguments
             */
            executeCommand: async (commandName, args) => {
                return executeCommand(commandName, args);
            },
            /**
             * Start the interactive command loop
             */
            startCommandLoop: async () => {
                const { terminal } = dependencies;
                let running = true;
                // Command loop
                while (running) {
                    try {
                        // Get command input from user
                        const input = await terminal.prompt({
                            type: 'input',
                            name: 'command',
                            message: 'claude-code>',
                            prefix: '',
                        });
                        if (!input.command || input.command.trim() === '') {
                            continue;
                        }
                        // Handle special exit commands
                        if (['exit', 'quit', 'q', '.exit'].includes(input.command.toLowerCase())) {
                            running = false;
                            continue;
                        }
                        // Parse input into command and args
                        const parts = input.command.trim().split(/\s+/);
                        const commandName = parts[0];
                        const commandArgs = parts.slice(1);
                        // Check if command exists
                        if (!commandRegistry.exists(commandName)) {
                            terminal.error(`Unknown command: ${commandName}`);
                            terminal.info('Type "help" to see available commands.');
                            continue;
                        }
                        // Execute the command
                        await executeCommand(commandName, commandArgs);
                    }
                    catch (error) {
                        dependencies.errors.handleError(error);
                    }
                }
            },
            /**
             * Register a new command
             */
            registerCommand: (command) => {
                commandRegistry.register(command);
            },
            /**
             * Get a command by name or alias
             */
            getCommand: (nameOrAlias) => {
                return commandRegistry.get(nameOrAlias);
            },
            /**
             * List all registered commands
             */
            listCommands: (options = {}) => {
                return commandRegistry.list(options);
            },
            /**
             * Get available command categories
             */
            getCategories: () => {
                return commandRegistry.getCategories();
            },
            /**
             * Get commands by category
             */
            getCommandsByCategory: (category, options = {}) => {
                return commandRegistry.getByCategory(category, options);
            },
            /**
             * Generate help text for a command
             */
            generateCommandHelp: (command) => {
                return generateCommandHelp(command);
            }
        };
    }
    catch (error) {
        logger.error('Failed to initialize command processor', error);
        throw error;
    }
}
// Export main symbols
export default {
    commandRegistry,
    parseArgs,
    executeCommand,
    generateCommandHelp
};
//# sourceMappingURL=index.js.map