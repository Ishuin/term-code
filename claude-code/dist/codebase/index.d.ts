/**
 * Codebase Analysis Module
 *
 * This module provides utilities for analyzing and understanding code structure,
 * dependencies, and metrics about a codebase.
 */
import { analyzeCodebase, FileInfo, DependencyInfo, ProjectStructure, analyzeProjectDependencies, findFilesByContent } from './analyzer.js';
export { analyzeCodebase, FileInfo, DependencyInfo, ProjectStructure, analyzeProjectDependencies, findFilesByContent };
/**
 * Analyze a codebase and return a summary of its structure
 *
 * @param directoryPath - Path to the directory to analyze
 * @param options - Analysis options
 * @returns Promise resolving to the project structure
 */
export declare function analyzeProject(directoryPath: string, options?: {
    ignorePatterns?: string[];
    maxFiles?: number;
    maxSizePerFile?: number;
}): Promise<ProjectStructure>;
/**
 * Initialize the codebase analysis subsystem
 *
 * @param config Configuration options for the codebase analysis
 * @returns The initialized codebase analysis system
 */
export declare function initCodebaseAnalysis(config?: any): {
    /**
     * Analyze the current working directory
     */
    analyzeCurrentDirectory: (options?: {}) => Promise<ProjectStructure>;
    /**
     * Analyze a specific directory
     */
    analyzeDirectory: (directoryPath: string, options?: {}) => Promise<ProjectStructure>;
    /**
     * Find files by content pattern
     */
    findFiles: (pattern: string, directoryPath?: string, options?: {}) => Promise<{
        path: string;
        line: number;
        content: string;
    }[]>;
    /**
     * Analyze project dependencies
     */
    analyzeDependencies: (directoryPath?: string) => Promise<Record<string, string>>;
    /**
     * Start background analysis of the current directory
     */
    startBackgroundAnalysis: (interval?: number) => void;
    /**
     * Stop background analysis
     */
    stopBackgroundAnalysis: () => void;
    /**
     * Get the latest background analysis results
     */
    getBackgroundAnalysisResults: () => ProjectStructure | null;
};
