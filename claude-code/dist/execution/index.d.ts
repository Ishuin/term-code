/**
 * Execution Environment Module
 *
 * Provides functionality for executing shell commands and scripts
 * in a controlled environment with proper error handling.
 */
/**
 * Result of a command execution
 */
interface ExecutionResult {
    output: string;
    exitCode: number;
    error?: Error;
    command: string;
    duration: number;
}
/**
 * Command execution options
 */
interface ExecutionOptions {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    shell?: string;
    maxBuffer?: number;
    captureStderr?: boolean;
}
/**
 * Background process options
 */
interface BackgroundProcessOptions extends ExecutionOptions {
    onOutput?: (output: string) => void;
    onError?: (error: string) => void;
    onExit?: (code: number | null) => void;
}
/**
 * Background process handle
 */
interface BackgroundProcess {
    pid: number;
    kill: () => boolean;
    isRunning: boolean;
}
/**
 * Execution environment manager
 */
declare class ExecutionEnvironment {
    private config;
    private backgroundProcesses;
    private executionCount;
    private workingDirectory;
    private environmentVariables;
    /**
     * Create a new execution environment
     */
    constructor(config: any);
    /**
     * Initialize the execution environment
     */
    initialize(): Promise<void>;
    /**
     * Execute a shell command
     */
    executeCommand(command: string, options?: ExecutionOptions): Promise<ExecutionResult>;
    /**
     * Execute a command in the background
     */
    executeCommandInBackground(command: string, options?: BackgroundProcessOptions): BackgroundProcess;
    /**
     * Kill all running background processes
     */
    killAllBackgroundProcesses(): void;
    /**
     * Validate a command for safety
     */
    private validateCommand;
    /**
     * Set the working directory
     */
    setWorkingDirectory(directory: string): void;
    /**
     * Get the working directory
     */
    getWorkingDirectory(): string;
    /**
     * Set an environment variable
     */
    setEnvironmentVariable(name: string, value: string): void;
    /**
     * Get an environment variable
     */
    getEnvironmentVariable(name: string): string | undefined;
}
/**
 * Initialize the execution environment
 */
export declare function initExecutionEnvironment(config: any): Promise<ExecutionEnvironment>;
export { ExecutionResult, ExecutionOptions, BackgroundProcess, BackgroundProcessOptions };
export default ExecutionEnvironment;
