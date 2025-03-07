/**
 * Configuration Schema
 *
 * Defines the structure and validation rules for the application configuration.
 * Uses Zod for runtime type validation.
 */
import { z } from 'zod';
declare const LogLevel: z.ZodEnum<["error", "warn", "info", "verbose", "debug", "trace"]>;
declare const ApiConfigSchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    key?: string | undefined;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    version?: string | undefined;
}, {
    key?: string | undefined;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    version?: string | undefined;
}>;
declare const TelemetryConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    anonymizeData: z.ZodDefault<z.ZodBoolean>;
    errorReporting: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    anonymizeData: boolean;
    errorReporting: boolean;
}, {
    enabled?: boolean | undefined;
    anonymizeData?: boolean | undefined;
    errorReporting?: boolean | undefined;
}>;
declare const TerminalConfigSchema: z.ZodObject<{
    theme: z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>;
    showProgressIndicators: z.ZodDefault<z.ZodBoolean>;
    useColors: z.ZodDefault<z.ZodBoolean>;
    codeHighlighting: z.ZodDefault<z.ZodBoolean>;
    maxHeight: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    theme: "system" | "dark" | "light";
    codeHighlighting: boolean;
    showProgressIndicators: boolean;
    useColors: boolean;
    maxHeight?: number | undefined;
    maxWidth?: number | undefined;
}, {
    theme?: "system" | "dark" | "light" | undefined;
    codeHighlighting?: boolean | undefined;
    showProgressIndicators?: boolean | undefined;
    useColors?: boolean | undefined;
    maxHeight?: number | undefined;
    maxWidth?: number | undefined;
}>;
declare const CodeAnalysisConfigSchema: z.ZodObject<{
    indexDepth: z.ZodDefault<z.ZodNumber>;
    excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxFileSize: z.ZodDefault<z.ZodNumber>;
    scanTimeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    indexDepth: number;
    excludePatterns: string[];
    includePatterns: string[];
    maxFileSize: number;
    scanTimeout: number;
}, {
    indexDepth?: number | undefined;
    excludePatterns?: string[] | undefined;
    includePatterns?: string[] | undefined;
    maxFileSize?: number | undefined;
    scanTimeout?: number | undefined;
}>;
declare const GitConfigSchema: z.ZodObject<{
    preferredRemote: z.ZodDefault<z.ZodString>;
    preferredBranch: z.ZodOptional<z.ZodString>;
    useSsh: z.ZodDefault<z.ZodBoolean>;
    useGpg: z.ZodDefault<z.ZodBoolean>;
    signCommits: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    preferredRemote: string;
    useSsh: boolean;
    useGpg: boolean;
    signCommits: boolean;
    preferredBranch?: string | undefined;
}, {
    preferredRemote?: string | undefined;
    preferredBranch?: string | undefined;
    useSsh?: boolean | undefined;
    useGpg?: boolean | undefined;
    signCommits?: boolean | undefined;
}>;
declare const EditorConfigSchema: z.ZodObject<{
    preferredLauncher: z.ZodOptional<z.ZodString>;
    tabWidth: z.ZodDefault<z.ZodNumber>;
    insertSpaces: z.ZodDefault<z.ZodBoolean>;
    formatOnSave: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tabWidth: number;
    insertSpaces: boolean;
    formatOnSave: boolean;
    preferredLauncher?: string | undefined;
}, {
    preferredLauncher?: string | undefined;
    tabWidth?: number | undefined;
    insertSpaces?: boolean | undefined;
    formatOnSave?: boolean | undefined;
}>;
declare const PathsConfigSchema: z.ZodObject<{
    home: z.ZodOptional<z.ZodString>;
    app: z.ZodOptional<z.ZodString>;
    cache: z.ZodOptional<z.ZodString>;
    logs: z.ZodOptional<z.ZodString>;
    workspace: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    home?: string | undefined;
    app?: string | undefined;
    cache?: string | undefined;
    logs?: string | undefined;
    workspace?: string | undefined;
}, {
    home?: string | undefined;
    app?: string | undefined;
    cache?: string | undefined;
    logs?: string | undefined;
    workspace?: string | undefined;
}>;
export declare const configSchema: z.ZodObject<{
    workspace: z.ZodOptional<z.ZodString>;
    logLevel: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "verbose", "debug", "trace"]>>;
    api: z.ZodDefault<z.ZodObject<{
        key: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        key?: string | undefined;
        timeout?: number | undefined;
        baseUrl?: string | undefined;
        version?: string | undefined;
    }, {
        key?: string | undefined;
        timeout?: number | undefined;
        baseUrl?: string | undefined;
        version?: string | undefined;
    }>>;
    telemetry: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        anonymizeData: z.ZodDefault<z.ZodBoolean>;
        errorReporting: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        anonymizeData: boolean;
        errorReporting: boolean;
    }, {
        enabled?: boolean | undefined;
        anonymizeData?: boolean | undefined;
        errorReporting?: boolean | undefined;
    }>>;
    terminal: z.ZodDefault<z.ZodObject<{
        theme: z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>;
        showProgressIndicators: z.ZodDefault<z.ZodBoolean>;
        useColors: z.ZodDefault<z.ZodBoolean>;
        codeHighlighting: z.ZodDefault<z.ZodBoolean>;
        maxHeight: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        theme: "system" | "dark" | "light";
        codeHighlighting: boolean;
        showProgressIndicators: boolean;
        useColors: boolean;
        maxHeight?: number | undefined;
        maxWidth?: number | undefined;
    }, {
        theme?: "system" | "dark" | "light" | undefined;
        codeHighlighting?: boolean | undefined;
        showProgressIndicators?: boolean | undefined;
        useColors?: boolean | undefined;
        maxHeight?: number | undefined;
        maxWidth?: number | undefined;
    }>>;
    codeAnalysis: z.ZodDefault<z.ZodObject<{
        indexDepth: z.ZodDefault<z.ZodNumber>;
        excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maxFileSize: z.ZodDefault<z.ZodNumber>;
        scanTimeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        indexDepth: number;
        excludePatterns: string[];
        includePatterns: string[];
        maxFileSize: number;
        scanTimeout: number;
    }, {
        indexDepth?: number | undefined;
        excludePatterns?: string[] | undefined;
        includePatterns?: string[] | undefined;
        maxFileSize?: number | undefined;
        scanTimeout?: number | undefined;
    }>>;
    git: z.ZodDefault<z.ZodObject<{
        preferredRemote: z.ZodDefault<z.ZodString>;
        preferredBranch: z.ZodOptional<z.ZodString>;
        useSsh: z.ZodDefault<z.ZodBoolean>;
        useGpg: z.ZodDefault<z.ZodBoolean>;
        signCommits: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        preferredRemote: string;
        useSsh: boolean;
        useGpg: boolean;
        signCommits: boolean;
        preferredBranch?: string | undefined;
    }, {
        preferredRemote?: string | undefined;
        preferredBranch?: string | undefined;
        useSsh?: boolean | undefined;
        useGpg?: boolean | undefined;
        signCommits?: boolean | undefined;
    }>>;
    editor: z.ZodDefault<z.ZodObject<{
        preferredLauncher: z.ZodOptional<z.ZodString>;
        tabWidth: z.ZodDefault<z.ZodNumber>;
        insertSpaces: z.ZodDefault<z.ZodBoolean>;
        formatOnSave: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        tabWidth: number;
        insertSpaces: boolean;
        formatOnSave: boolean;
        preferredLauncher?: string | undefined;
    }, {
        preferredLauncher?: string | undefined;
        tabWidth?: number | undefined;
        insertSpaces?: boolean | undefined;
        formatOnSave?: boolean | undefined;
    }>>;
    paths: z.ZodOptional<z.ZodObject<{
        home: z.ZodOptional<z.ZodString>;
        app: z.ZodOptional<z.ZodString>;
        cache: z.ZodOptional<z.ZodString>;
        logs: z.ZodOptional<z.ZodString>;
        workspace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        home?: string | undefined;
        app?: string | undefined;
        cache?: string | undefined;
        logs?: string | undefined;
        workspace?: string | undefined;
    }, {
        home?: string | undefined;
        app?: string | undefined;
        cache?: string | undefined;
        logs?: string | undefined;
        workspace?: string | undefined;
    }>>;
    forceLogin: z.ZodDefault<z.ZodBoolean>;
    forceLogout: z.ZodDefault<z.ZodBoolean>;
    lastUpdateCheck: z.ZodOptional<z.ZodNumber>;
    auth: z.ZodOptional<z.ZodObject<{
        tokens: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        lastAuth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tokens?: Record<string, string> | undefined;
        lastAuth?: number | undefined;
    }, {
        tokens?: Record<string, string> | undefined;
        lastAuth?: number | undefined;
    }>>;
    recentWorkspaces: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    editor: {
        tabWidth: number;
        insertSpaces: boolean;
        formatOnSave: boolean;
        preferredLauncher?: string | undefined;
    };
    telemetry: {
        enabled: boolean;
        anonymizeData: boolean;
        errorReporting: boolean;
    };
    git: {
        preferredRemote: string;
        useSsh: boolean;
        useGpg: boolean;
        signCommits: boolean;
        preferredBranch?: string | undefined;
    };
    terminal: {
        theme: "system" | "dark" | "light";
        codeHighlighting: boolean;
        showProgressIndicators: boolean;
        useColors: boolean;
        maxHeight?: number | undefined;
        maxWidth?: number | undefined;
    };
    logLevel: "verbose" | "error" | "warn" | "info" | "debug" | "trace";
    api: {
        key?: string | undefined;
        timeout?: number | undefined;
        baseUrl?: string | undefined;
        version?: string | undefined;
    };
    codeAnalysis: {
        indexDepth: number;
        excludePatterns: string[];
        includePatterns: string[];
        maxFileSize: number;
        scanTimeout: number;
    };
    forceLogin: boolean;
    forceLogout: boolean;
    recentWorkspaces: string[];
    auth?: {
        tokens?: Record<string, string> | undefined;
        lastAuth?: number | undefined;
    } | undefined;
    workspace?: string | undefined;
    paths?: {
        home?: string | undefined;
        app?: string | undefined;
        cache?: string | undefined;
        logs?: string | undefined;
        workspace?: string | undefined;
    } | undefined;
    lastUpdateCheck?: number | undefined;
}, {
    editor?: {
        preferredLauncher?: string | undefined;
        tabWidth?: number | undefined;
        insertSpaces?: boolean | undefined;
        formatOnSave?: boolean | undefined;
    } | undefined;
    telemetry?: {
        enabled?: boolean | undefined;
        anonymizeData?: boolean | undefined;
        errorReporting?: boolean | undefined;
    } | undefined;
    git?: {
        preferredRemote?: string | undefined;
        preferredBranch?: string | undefined;
        useSsh?: boolean | undefined;
        useGpg?: boolean | undefined;
        signCommits?: boolean | undefined;
    } | undefined;
    terminal?: {
        theme?: "system" | "dark" | "light" | undefined;
        codeHighlighting?: boolean | undefined;
        showProgressIndicators?: boolean | undefined;
        useColors?: boolean | undefined;
        maxHeight?: number | undefined;
        maxWidth?: number | undefined;
    } | undefined;
    auth?: {
        tokens?: Record<string, string> | undefined;
        lastAuth?: number | undefined;
    } | undefined;
    workspace?: string | undefined;
    logLevel?: "verbose" | "error" | "warn" | "info" | "debug" | "trace" | undefined;
    api?: {
        key?: string | undefined;
        timeout?: number | undefined;
        baseUrl?: string | undefined;
        version?: string | undefined;
    } | undefined;
    codeAnalysis?: {
        indexDepth?: number | undefined;
        excludePatterns?: string[] | undefined;
        includePatterns?: string[] | undefined;
        maxFileSize?: number | undefined;
        scanTimeout?: number | undefined;
    } | undefined;
    paths?: {
        home?: string | undefined;
        app?: string | undefined;
        cache?: string | undefined;
        logs?: string | undefined;
        workspace?: string | undefined;
    } | undefined;
    forceLogin?: boolean | undefined;
    forceLogout?: boolean | undefined;
    lastUpdateCheck?: number | undefined;
    recentWorkspaces?: string[] | undefined;
}>;
export type ConfigType = z.infer<typeof configSchema>;
export { LogLevel, ApiConfigSchema, TelemetryConfigSchema, TerminalConfigSchema, CodeAnalysisConfigSchema, GitConfigSchema, EditorConfigSchema, PathsConfigSchema };
