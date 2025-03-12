/**
 * Terminal Interface Module
 * 
 * Provides a user interface for interacting with Claude Code in the terminal.
 * Handles input/output, formatting, and display.
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import terminalLink from 'terminal-link';
import { table } from 'table';
import { logger } from '../utils/logger.js';
import { TerminalInterface, TerminalConfig, PromptOptions, SpinnerInstance } from './types.js';
import { formatOutput, clearScreen, getTerminalSize } from './formatting.js';
import { createPrompt } from './prompt.js';
import { getActiveProvider, AIProvider } from '../ai/index.js';

// Provider-specific terminal configurations
interface ProviderTerminalConfig {
  promptText: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeTip: string;
  providerColor: string;
}

// Provider terminal configurations
const PROVIDER_CONFIGS: Record<string, ProviderTerminalConfig> = {
  [AIProvider.CLAUDE]: {
    promptText: 'claude-code>',
    welcomeTitle: 'Claude Code CLI',
    welcomeSubtitle: 'Research Preview',
    welcomeTip: 'Pro tip: Use Ctrl+C to interrupt Claude and start over.',
    providerColor: 'blue'
  },
  [AIProvider.OLLAMA]: {
    promptText: 'ollama-code>',
    welcomeTitle: 'Term-Code with OLLAMA',
    welcomeSubtitle: 'Terminal-based AI coding assistant',
    welcomeTip: 'Pro tip: Use ollama:list to see available models.',
    providerColor: 'green'
  }
};

/**
 * Initialize the terminal interface
 */
export async function initTerminal(config: any): Promise<TerminalInterface> {
  logger.debug('Initializing terminal interface');
  
  const terminalConfig: TerminalConfig = {
    theme: config.terminal?.theme || 'system',
    useColors: config.terminal?.useColors !== false,
    showProgressIndicators: config.terminal?.showProgressIndicators !== false,
    codeHighlighting: config.terminal?.codeHighlighting !== false,
    maxHeight: config.terminal?.maxHeight,
    maxWidth: config.terminal?.maxWidth,
    provider: config.provider || AIProvider.OLLAMA // Default to Ollama
  };
  
  const terminal = new Terminal(terminalConfig);
  
  try {
    // Detect terminal capabilities
    await terminal.detectCapabilities();
    
    return terminal;
  } catch (error) {
    logger.warn('Error initializing terminal interface:', error);
    
    // Return a basic terminal interface even if there was an error
    return terminal;
  }
}

/**
 * Terminal class for handling user interaction
 */
class Terminal implements TerminalInterface {
  private config: TerminalConfig;
  private activeSpinners: Map<string, SpinnerInstance> = new Map();
  private terminalWidth: number;
  private terminalHeight: number;
  private isInteractive: boolean;
  private providerConfig: ProviderTerminalConfig;

  constructor(config: TerminalConfig) {
    this.config = config;
    
    // Get initial terminal size
    const { rows, columns } = getTerminalSize();
    this.terminalHeight = config.maxHeight || rows;
    this.terminalWidth = config.maxWidth || columns;
    
    // Assume interactive by default
    this.isInteractive = process.stdout.isTTY && process.stdin.isTTY;
    
    // Set provider configuration based on active provider or config
    const provider = config.provider || getActiveProvider() || AIProvider.OLLAMA;
    this.providerConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS[AIProvider.OLLAMA];
    
    // Listen for terminal resize events
    process.stdout.on('resize', () => {
      const { rows, columns } = getTerminalSize();
      this.terminalHeight = config.maxHeight || rows;
      this.terminalWidth = config.maxWidth || columns;
      logger.debug(`Terminal resized to ${columns}x${rows}`);
    });
  }

  /**
   * Update terminal provider configuration
   */
  updateProvider(provider: AIProvider): void {
    this.providerConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS[AIProvider.OLLAMA];
    logger.debug(`Terminal provider updated to ${provider}`);
  }

  /**
   * Detect terminal capabilities
   */
  async detectCapabilities(): Promise<void> {
    // Check if the terminal is interactive
    this.isInteractive = process.stdout.isTTY && process.stdin.isTTY;
    
    // Check color support
    if (this.config.useColors && !chalk.level) {
      logger.warn('Terminal does not support colors, disabling color output');
      this.config.useColors = false;
    }
    
    logger.debug('Terminal capabilities detected', {
      isInteractive: this.isInteractive,
      colorSupport: this.config.useColors ? 'yes' : 'no',
      size: `${this.terminalWidth}x${this.terminalHeight}`
    });
  }

  /**
   * Display the welcome message
   */
  displayWelcome(): void {
    this.clear();
    
    const version = '0.2.29'; // This should come from package.json
    const colorFn = chalk[this.providerConfig.providerColor as keyof typeof chalk] || chalk.blue;
    
    // Main logo/header
    console.log(colorFn.bold(`\n  ${this.providerConfig.welcomeTitle}`));
    console.log(chalk.gray(`  Version ${version} (${this.providerConfig.welcomeSubtitle})\n`));
    
    console.log(chalk.white(`  Welcome! Type ${chalk.cyan('/help')} to see available commands.`));
    console.log(chalk.white(`  You can ask ${getActiveProvider() || 'AI'} to explain code, fix issues, or perform tasks.`));
    console.log(chalk.white(`  Example: "${chalk.italic('Please analyze this codebase and explain its structure.')}"\n`));

    if (this.config.useColors) {
      console.log(chalk.dim(`  ${this.providerConfig.welcomeTip}\n`));
    }
  }

  /**
   * Get the provider-specific prompt text
   */
  getPromptText(): string {
    return this.providerConfig.promptText;
  }

  /**
   * Clear the terminal screen
   */
  clear(): void {
    if (this.isInteractive) {
      clearScreen();
    }
  }

  /**
   * Display formatted content
   */
  display(content: string): void {
    const formatted = formatOutput(content, {
      width: this.terminalWidth,
      colors: this.config.useColors,
      codeHighlighting: this.config.codeHighlighting
    });
    
    console.log(formatted);
  }

  /**
   * Display a message with emphasis
   */
  emphasize(message: string): void {
    if (this.config.useColors) {
      console.log(chalk.cyan.bold(message));
    } else {
      console.log(message.toUpperCase());
    }
  }

  /**
   * Display an informational message
   */
  info(message: string): void {
    if (this.config.useColors) {
      console.log(chalk.blue(`ℹ ${message}`));
    } else {
      console.log(`INFO: ${message}`);
    }
  }

  /**
   * Display a success message
   */
  success(message: string): void {
    if (this.config.useColors) {
      console.log(chalk.green(`✓ ${message}`));
    } else {
      console.log(`SUCCESS: ${message}`);
    }
  }

  /**
   * Display a warning message
   */
  warn(message: string): void {
    if (this.config.useColors) {
      console.log(chalk.yellow(`⚠ ${message}`));
    } else {
      console.log(`WARNING: ${message}`);
    }
  }

  /**
   * Display an error message
   */
  error(message: string): void {
    if (this.config.useColors) {
      console.log(chalk.red(`✗ ${message}`));
    } else {
      console.log(`ERROR: ${message}`);
    }
  }

  /**
   * Create a clickable link in the terminal if supported
   */
  link(text: string, url: string): string {
    return terminalLink(text, url, { fallback: (text, url) => `${text} (${url})` });
  }

  /**
   * Display a table of data
   */
  table(data: any[][], options: { header?: string[]; border?: boolean } = {}): void {
    const config: any = {
      border: options.border ? {} : { topBody: '', topJoin: '', topLeft: '', topRight: '', bottomBody: '', bottomJoin: '', bottomLeft: '', bottomRight: '', bodyLeft: '', bodyRight: '', bodyJoin: '', joinBody: '', joinLeft: '', joinRight: '', joinJoin: '' }
    };
    
    // Add header row with formatting
    if (options.header) {
      if (this.config.useColors) {
        data = [options.header.map(h => chalk.bold(h)), ...data];
      } else {
        data = [options.header, ...data];
      }
    }
    
    console.log(table(data, config));
  }

  /**
   * Prompt user for input
   */
  async prompt<T>(options: PromptOptions): Promise<T> {
    return createPrompt(options, this.config) as T;
  }

  /**
   * Create a spinner for showing progress
   */
  spinner(text: string, id: string = 'default'): SpinnerInstance {
    // Clean up existing spinner with the same ID
    if (this.activeSpinners.has(id)) {
      this.activeSpinners.get(id)!.stop();
      this.activeSpinners.delete(id);
    }
    
    // Create spinner only if progress indicators are enabled and terminal is interactive
    if (this.config.showProgressIndicators && this.isInteractive) {
      const spinner = ora({
        text,
        spinner: 'dots',
        color: 'cyan'
      }).start();
      
      const spinnerInstance: SpinnerInstance = {
        id,
        update: (newText: string) => {
          spinner.text = newText;
          return spinnerInstance;
        },
        succeed: (text?: string) => {
          spinner.succeed(text);
          this.activeSpinners.delete(id);
          return spinnerInstance;
        },
        fail: (text?: string) => {
          spinner.fail(text);
          this.activeSpinners.delete(id);
          return spinnerInstance;
        },
        warn: (text?: string) => {
          spinner.warn(text);
          this.activeSpinners.delete(id);
          return spinnerInstance;
        },
        info: (text?: string) => {
          spinner.info(text);
          this.activeSpinners.delete(id);
          return spinnerInstance;
        },
        stop: () => {
          spinner.stop();
          this.activeSpinners.delete(id);
          return spinnerInstance;
        }
      };
      
      this.activeSpinners.set(id, spinnerInstance);
      return spinnerInstance;
    } else {
      // Fallback for non-interactive terminals or when progress indicators are disabled
      console.log(text);
      
      // Return a dummy spinner
      const dummySpinner: SpinnerInstance = {
        id,
        update: (newText: string) => {
          if (newText !== text) {
            console.log(newText);
          }
          return dummySpinner;
        },
        succeed: (text?: string) => {
          if (text) {
            this.success(text);
          }
          return dummySpinner;
        },
        fail: (text?: string) => {
          if (text) {
            this.error(text);
          }
          return dummySpinner;
        },
        warn: (text?: string) => {
          if (text) {
            this.warn(text);
          }
          return dummySpinner;
        },
        info: (text?: string) => {
          if (text) {
            this.info(text);
          }
          return dummySpinner;
        },
        stop: () => {
          return dummySpinner;
        }
      };
      
      return dummySpinner;
    }
  }
}

// Re-export the types
export * from './types.js'; 