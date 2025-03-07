/**
 * AI Prompts
 *
 * Contains prompt templates and utilities for formatting prompts
 * for different AI tasks and scenarios.
 */
import { Message } from './types.js';
/**
 * System prompt for code assistance
 */
export declare const CODE_ASSISTANT_SYSTEM_PROMPT = "\nYou are Claude, an AI assistant with expertise in programming and software development.\nYour task is to assist with coding-related questions, debugging, refactoring, and explaining code.\n\nGuidelines:\n- Provide clear, concise, and accurate responses\n- Include code examples where helpful\n- Prioritize modern best practices\n- If you're unsure, acknowledge limitations instead of guessing\n- Focus on understanding the user's intent, even if the question is ambiguous\n";
/**
 * System prompt for code generation
 */
export declare const CODE_GENERATION_SYSTEM_PROMPT = "\nYou are Claude, an AI assistant focused on helping write high-quality code.\nYour task is to generate code based on user requirements and specifications.\n\nGuidelines:\n- Write clean, efficient, and well-documented code\n- Follow language-specific best practices and conventions\n- Include helpful comments explaining complex sections\n- Prioritize maintainability and readability\n- Structure code logically with appropriate error handling\n- Consider edge cases and potential issues\n";
/**
 * System prompt for code review
 */
export declare const CODE_REVIEW_SYSTEM_PROMPT = "\nYou are Claude, an AI code reviewer with expertise in programming best practices.\nYour task is to analyze code, identify issues, and suggest improvements.\n\nGuidelines:\n- Look for bugs, security issues, and performance problems\n- Suggest improvements for readability and maintainability\n- Identify potential edge cases and error handling gaps\n- Point out violations of best practices or conventions\n- Provide constructive feedback with clear explanations\n- Be thorough but prioritize important issues over minor stylistic concerns\n";
/**
 * System prompt for explaining code
 */
export declare const CODE_EXPLANATION_SYSTEM_PROMPT = "\nYou are Claude, an AI assistant that specializes in explaining code.\nYour task is to break down and explain code in a clear, educational manner.\n\nGuidelines:\n- Explain the purpose and functionality of the code\n- Break down complex parts step by step\n- Define technical terms and concepts when relevant\n- Use analogies or examples to illustrate concepts\n- Focus on the core logic rather than trivial details\n- Adjust explanation depth based on the apparent complexity of the question\n";
/**
 * Interface for prompt templates
 */
export interface PromptTemplate {
    /**
     * Template string with {placeholders}
     */
    template: string;
    /**
     * Optional system message to set context
     */
    system?: string;
    /**
     * Default values for placeholders
     */
    defaults?: Record<string, string>;
}
/**
 * Collection of prompt templates for common tasks
 */
export declare const PROMPT_TEMPLATES: Record<string, PromptTemplate>;
/**
 * Format a prompt by replacing placeholders with values
 *
 * @param template The prompt template with {placeholders}
 * @param values Values to replace placeholders with
 * @param defaults Default values for placeholders not in values
 * @returns Formatted prompt string
 */
export declare function formatPrompt(template: string, values: Record<string, string | number | boolean>, defaults?: Record<string, string>): string;
/**
 * Format a prompt using a predefined template
 *
 * @param templateName Name of the template from PROMPT_TEMPLATES
 * @param values Values to replace placeholders with
 * @returns Object with formatted prompt and system message
 */
export declare function usePromptTemplate(templateName: string, values: Record<string, string | number | boolean>): {
    prompt: string;
    system?: string;
};
/**
 * Create a conversation from a prompt
 *
 * @param prompt User prompt string
 * @param system Optional system message
 * @returns Array of messages for the conversation
 */
export declare function createConversation(prompt: string, system?: string): Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
}>;
/**
 * Create a user message
 */
export declare function createUserMessage(content: string): Message;
/**
 * Create a system message
 */
export declare function createSystemMessage(content: string): Message;
/**
 * Create an assistant message
 */
export declare function createAssistantMessage(content: string): Message;
/**
 * Create a message with file context
 */
export declare function createFileContextMessage(filePath: string, content: string, language?: string): string;
