/**
 * Claude Code CLI
 *
 * Main entry point for the application.
 * This module bootstraps the application and manages the lifecycle.
 */
/**
 * Application instance that holds references to all initialized subsystems
 */
export interface AppInstance {
    config: any;
    terminal: any;
    auth: any;
    ai: any;
    codebase: any;
    commands: any;
    fileOps: any;
    execution: any;
    errors: any;
    telemetry: any;
}
/**
 * Initialize all application subsystems
 */
export declare function initialize(options?: any): Promise<AppInstance>;
/**
 * Run the application main loop
 */
export declare function run(app: AppInstance): Promise<void>;
/**
 * Gracefully shut down the application
 */
export declare function shutdown(app: AppInstance): Promise<void>;
/**
 * Main entry point function
 */
export declare function main(options?: any): Promise<void>;
