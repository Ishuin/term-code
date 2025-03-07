/**
 * Codebase Analyzer
 *
 * Provides utilities for analyzing and understanding code structure,
 * dependencies, and metrics about a codebase.
 */
/**
 * File info with language detection and stats
 */
export interface FileInfo {
    /**
     * File path relative to project root
     */
    path: string;
    /**
     * File extension
     */
    extension: string;
    /**
     * Detected language
     */
    language: string;
    /**
     * File size in bytes
     */
    size: number;
    /**
     * Line count
     */
    lineCount: number;
    /**
     * Last modified timestamp
     */
    lastModified: Date;
}
/**
 * Code dependency information
 */
export interface DependencyInfo {
    /**
     * Module/package name
     */
    name: string;
    /**
     * Type of dependency (import, require, etc.)
     */
    type: string;
    /**
     * Source file path
     */
    source: string;
    /**
     * Import path
     */
    importPath: string;
    /**
     * Whether it's an external dependency
     */
    isExternal: boolean;
}
/**
 * Project structure information
 */
export interface ProjectStructure {
    /**
     * Root directory
     */
    root: string;
    /**
     * Total file count
     */
    totalFiles: number;
    /**
     * Files by language
     */
    filesByLanguage: Record<string, number>;
    /**
     * Total lines of code
     */
    totalLinesOfCode: number;
    /**
     * Files organized by directory
     */
    directories: Record<string, string[]>;
    /**
     * Dependencies identified in the project
     */
    dependencies: DependencyInfo[];
}
/**
 * Analyze a codebase
 */
export declare function analyzeCodebase(directory: string, options?: {
    ignorePatterns?: string[];
    maxFiles?: number;
    maxSizePerFile?: number;
}): Promise<ProjectStructure>;
/**
 * Analyze project dependencies from package files
 */
export declare function analyzeProjectDependencies(directory: string): Promise<Record<string, string>>;
/**
 * Find files by content search
 */
export declare function findFilesByContent(directory: string, searchTerm: string, options?: {
    caseSensitive?: boolean;
    fileExtensions?: string[];
    maxResults?: number;
    ignorePatterns?: string[];
}): Promise<Array<{
    path: string;
    line: number;
    content: string;
}>>;
declare const _default: {
    analyzeCodebase: typeof analyzeCodebase;
    analyzeProjectDependencies: typeof analyzeProjectDependencies;
    findFilesByContent: typeof findFilesByContent;
};
export default _default;
