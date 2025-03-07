/**
 * AI Client
 *
 * Handles interaction with Anthropic's Claude API, including
 * text completion, chat, and code assistance features.
 */
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    stream?: boolean;
    system?: string;
}
export interface CompletionRequest {
    model: string;
    messages: Message[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    stop_sequences?: string[];
    stream?: boolean;
    system?: string;
}
export interface CompletionResponse {
    id: string;
    model: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
    content: {
        type: string;
        text: string;
    }[];
    stop_reason?: string;
    stop_sequence?: string;
}
export interface StreamEvent {
    type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
    message?: {
        id: string;
        model: string;
        content: {
            type: string;
            text: string;
        }[];
        stop_reason?: string;
        stop_sequence?: string;
    };
    index?: number;
    delta?: {
        type: string;
        text: string;
    };
    usage_metadata?: {
        input_tokens: number;
        output_tokens: number;
    };
}
declare const DEFAULT_CONFIG: {
    apiBaseUrl: string;
    apiVersion: string;
    timeout: number;
    retryOptions: {
        maxRetries: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };
    defaultModel: string;
    defaultMaxTokens: number;
    defaultTemperature: number;
};
/**
 * Claude AI client for interacting with Anthropic's Claude API
 */
export declare class AIClient {
    private config;
    private authToken;
    /**
     * Create a new AI client
     */
    constructor(config: Partial<typeof DEFAULT_CONFIG> | undefined, authToken: string);
    /**
     * Format API request headers
     */
    private getHeaders;
    /**
     * Send a completion request to Claude
     */
    complete(prompt: string | Message[], options?: CompletionOptions): Promise<CompletionResponse>;
    /**
     * Send a streaming completion request to Claude
     */
    completeStream(prompt: string | Message[], options: CompletionOptions | undefined, onEvent: (event: StreamEvent) => void): Promise<void>;
    /**
     * Test the connection to the Claude API
     */
    testConnection(): Promise<boolean>;
    /**
     * Send a request to the Claude API
     */
    private sendRequest;
    /**
     * Send a streaming request to the Claude API
     */
    private sendStreamRequest;
    /**
     * Handle error responses from the API
     */
    private handleErrorResponse;
}
export {};
