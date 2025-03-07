/**
 * File Operations Module
 *
 * Provides utilities for reading, writing, and manipulating files
 * with proper error handling and security considerations.
 */
/**
 * Result of a file operation
 */
interface FileOperationResult {
    success: boolean;
    error?: Error;
    path?: string;
    content?: string;
    created?: boolean;
}
/**
 * File Operations Manager
 */
declare class FileOperationsManager {
    private config;
    private workspacePath;
    /**
     * Create a new file operations manager
     */
    constructor(config: any);
    /**
     * Initialize file operations
     */
    initialize(): Promise<void>;
    /**
     * Get absolute path relative to workspace
     */
    getAbsolutePath(relativePath: string): string;
    /**
     * Get relative path from workspace
     */
    getRelativePath(absolutePath: string): string;
    /**
     * Read a file
     */
    readFile(filePath: string): Promise<FileOperationResult>;
    /**
     * Write a file
     */
    writeFile(filePath: string, content: string, options?: {
        createDirs?: boolean;
    }): Promise<FileOperationResult>;
    /**
     * Delete a file
     */
    deleteFile(filePath: string): Promise<FileOperationResult>;
    /**
     * Check if a file exists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Create a directory
     */
    createDirectory(dirPath: string, options?: {
        recursive?: boolean;
    }): Promise<FileOperationResult>;
    /**
     * List directory contents
     */
    listDirectory(dirPath: string): Promise<FileOperationResult & {
        files?: string[];
    }>;
    /**
     * Generate a diff between two strings
     */
    generateDiff(original: string, modified: string): string;
    /**
     * Apply a patch to a file
     */
    applyPatch(filePath: string, patch: string): Promise<FileOperationResult>;
}
/**
 * Initialize the file operations system
 */
export declare function initFileOperations(config: any): Promise<FileOperationsManager>;
export default FileOperationsManager;
