/**
 * File Operations
 *
 * Functions for interacting with the file system in a safe and consistent way.
 * Includes utilities for reading, writing, searching, and analyzing files.
 */
import { Stats } from 'fs';
/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Check if a directory exists
 */
export declare function directoryExists(dirPath: string): Promise<boolean>;
/**
 * Create a directory if it doesn't exist
 */
export declare function ensureDirectory(dirPath: string): Promise<void>;
/**
 * Read a file as text
 */
export declare function readTextFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
/**
 * Read specific lines from a file
 */
export declare function readFileLines(filePath: string, start: number, end: number, encoding?: BufferEncoding): Promise<string[]>;
/**
 * Write text to a file
 */
export declare function writeTextFile(filePath: string, content: string, options?: {
    encoding?: BufferEncoding;
    createDir?: boolean;
    overwrite?: boolean;
}): Promise<void>;
/**
 * Append text to a file
 */
export declare function appendTextFile(filePath: string, content: string, options?: {
    encoding?: BufferEncoding;
    createDir?: boolean;
}): Promise<void>;
/**
 * Delete a file
 */
export declare function deleteFile(filePath: string): Promise<void>;
/**
 * Rename a file or directory
 */
export declare function rename(oldPath: string, newPath: string): Promise<void>;
/**
 * Copy a file
 */
export declare function copyFile(sourcePath: string, destPath: string, options?: {
    overwrite?: boolean;
    createDir?: boolean;
}): Promise<void>;
/**
 * List files and directories in a directory
 */
export declare function listDirectory(dirPath: string): Promise<string[]>;
/**
 * Get file or directory information
 */
export declare function getFileInfo(filePath: string): Promise<Stats>;
/**
 * Find files matching a pattern
 */
export declare function findFiles(directory: string, options?: {
    pattern?: RegExp;
    recursive?: boolean;
    includeDirectories?: boolean;
}): Promise<string[]>;
/**
 * Stream a file to another location
 */
export declare function streamFile(sourcePath: string, destPath: string, options?: {
    overwrite?: boolean;
    createDir?: boolean;
}): Promise<void>;
/**
 * Create a temporary file
 */
export declare function createTempFile(options?: {
    prefix?: string;
    suffix?: string;
    content?: string;
}): Promise<string>;
