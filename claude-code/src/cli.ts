#!/usr/bin/env node
/**
 * Claude Code CLI
 * 
 * Main entry point for the Claude Code CLI tool. Handles command-line
 * argument parsing, command dispatching, and error handling.
 */

import { commandRegistry, executeCommand, generateCommandHelp } from './commands/index.js';
import { logger } from './utils/logger.js';
import { formatErrorForDisplay } from './errors/formatter.js';
import { initAI, setTerminalInstance } from './ai/index.js';
import { authManager } from './auth/index.js';
import { registerCommands } from './commands/register.js';
import { UserError } from './errors/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initTerminal } from './terminal/index.js';
import { initCommandProcessor } from './commands/index.js';
import { initCodebase } from './codebase/index.js';
import { initFileOps } from './fileops/index.js';
import { initExecution } from './execution/index.js';
import { ErrorManager } from './errors/manager.js';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));

// Get version from package.json
const version = pkg.version;

// Maximum width of the help output
const HELP_WIDTH = 100;

/**
 * Display help information
 */
function displayHelp(commandName?: string): void {
  if (commandName && commandName !== 'help') {
    // Display help for a specific command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.error('Use "claude-code help" to see available commands.');
      process.exit(1);
    }
    
    console.log(generateCommandHelp(command));
    return;
  }
  
  // Display general help
  console.log(`
Claude Code CLI v${version}

A command-line interface for interacting with Claude AI for code assistance,
generation, refactoring, and more.

Usage:
  claude-code <command> [arguments] [options]

Available Commands:`);
  
  // Group commands by category
  const categories = commandRegistry.getCategories();
  
  // Commands without a category
  const uncategorizedCommands = commandRegistry.list()
    .filter(cmd => !cmd.category && !cmd.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  if (uncategorizedCommands.length > 0) {
    for (const command of uncategorizedCommands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    console.log('');
  }
  
  // Commands with categories
  for (const category of categories) {
    console.log(`${category}:`);
    
    const commands = commandRegistry.getByCategory(category)
      .filter(cmd => !cmd.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    for (const command of commands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    
    console.log('');
  }
  
  console.log(`For more information on a specific command, use:
  claude-code help <command>

Examples:
  $ claude-code ask "How do I implement a binary search tree in TypeScript?"
  $ claude-code explain path/to/file.js
  $ claude-code refactor path/to/file.py --focus=performance
  $ claude-code fix path/to/code.ts
`);
}

/**
 * Display version information
 */
function displayVersion(): void {
  console.log(`Claude Code CLI v${version}`);
}

/**
 * Parse command-line arguments
 */
function parseCommandLineArgs(): { commandName: string; args: string[]; isInteractive: boolean } {
  // Get arguments, excluding node and script path
  const args = process.argv.slice(2);
  
  // Check for interactive mode flag
  const interactiveIndex = args.findIndex(arg => 
    arg === '--start-command-loop' || arg === '--interactive' || arg === '-i'
  );
  
  const isInteractive = interactiveIndex >= 0;
  
  // Remove the interactive flag from args if found
  if (interactiveIndex >= 0) {
    args.splice(interactiveIndex, 1);
  }
  
  // Handle empty command
  if (args.length === 0) {
    if (isInteractive) {
      // If interactive mode, return special command name
      return { commandName: 'interactive', args: [], isInteractive: true };
    }
    
    displayHelp();
    process.exit(0);
  }
  
  // Extract command name
  const commandName = args[0].toLowerCase();
  
  // Handle help command
  if (commandName === 'help') {
    displayHelp(args[1]);
    process.exit(0);
  }
  
  // Handle version command
  if (commandName === 'version' || commandName === '--version' || commandName === '-v') {
    displayVersion();
    process.exit(0);
  }
  
  return { commandName, args: args.slice(1), isInteractive };
}

/**
 * Initialize the CLI
 */
async function initCLI(): Promise<void> {
  try {
    // Register commands
    registerCommands();
    
    // Initialize authentication
    await authManager.initialize();
    
    // Parse command-line arguments
    const { commandName, args, isInteractive } = parseCommandLineArgs();
    
    // Determine provider from environment or default
    const providerFromEnv = process.env.TERM_CODE_PROVIDER?.toLowerCase();
    let selectedProvider = null;
    
    if (providerFromEnv === 'ollama' || process.env.OLLAMA_PROVIDER === 'true') {
      selectedProvider = 'ollama';
    } else if (providerFromEnv === 'claude') {
      selectedProvider = 'claude';
    }
    
    // Initialize terminal with provider information
    const terminal = await initTerminal({
      terminal: {
        useColors: true,
        showProgressIndicators: true
      },
      provider: selectedProvider
    });
    
    // Handle interactive mode
    if (isInteractive || commandName === 'interactive') {
      // Initialize AI, codebase, and other dependencies for interactive mode
      const ai = await initAI({ provider: selectedProvider }, terminal);
      const codebase = await initCodebase();
      const fileOps = await initFileOps();
      const execution = await initExecution();
      const errors = new ErrorManager();
      
      // Set up error handler
      errors.setHandleError((error) => {
        const formattedError = formatErrorForDisplay(error);
        terminal.error(formattedError);
      });
      
      // Initialize command processor
      const commandProcessor = await initCommandProcessor({}, {
        terminal,
        auth: authManager,
        ai,
        codebase,
        fileOps,
        execution,
        errors
      });
      
      // Display welcome message
      terminal.displayWelcome();
      
      // Start interactive command loop
      await commandProcessor.startCommandLoop();
      return;
    }
    
    // Single command mode (original behavior)
    // Get the command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      terminal.error(`Unknown command: ${commandName}`);
      terminal.info('Use "help" to see available commands.');
      process.exit(1);
    }
    
    // Check if command requires authentication
    if (command.requiresAuth && !authManager.isAuthenticated()) {
      terminal.error(`Command '${commandName}' requires authentication.`);
      terminal.info('Please log in using the "login" command first.');
      process.exit(1);
    }
    
    // Initialize AI if required with terminal reference
    if (command.requiresAuth) {
      await initAI({ provider: selectedProvider }, terminal);
    } else {
      // Set terminal in AI module even if not initializing AI yet
      setTerminalInstance(terminal);
    }
    
    // Add terminal to command args
    args._terminal = terminal;
    
    // Execute the command
    await executeCommand(commandName, args);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Handle errors
 */
function handleError(error: unknown): void {
  const formattedError = formatErrorForDisplay(error);
  
  console.error(formattedError);
  
  // Exit with error code
  if (error instanceof UserError) {
    process.exit(1);
  } else {
    // Unexpected error, use a different exit code
    process.exit(2);
  }
}

// Run the CLI
initCLI().catch(handleError); 