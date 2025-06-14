// TypeScript interfaces for LLM adapters

export interface ILLMAdapter {
  /**
   * Summarizes the given diff using the provided prompt
   * @param diff - The text diff to summarize
   * @param prompt - The user-provided prompt for summarization
   * @returns Promise that resolves to the summarized text
   */
  summarize(diff: string, prompt: string): Promise<string>;
}

export type LLMProvider = 'openai' | 'gemini' | 'chrome' | 'no-llm';

// Chrome AI API types (based on the Chrome documentation)
export interface ChromeAILanguageModel {
  params(): Promise<ChromeAIModelParams>;
  create(options: ChromeAICreateOptions): Promise<ChromeAISession>;
}

export interface ChromeAIModelParams {
  defaultTemperature: number;
  defaultTopK: number;
  maxTopK: number;
  maxTemperature: number;
}

export interface ChromeAICreateOptions {
  temperature?: number;
  topK?: number;
}

export interface ChromeAISession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

// OpenAI API types
export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens: number;
  temperature: number;
}

export interface OpenAIChoice {
  message: {
    content: string;
  };
}

export interface OpenAIResponse {
  choices: OpenAIChoice[];
}

// Gemini API types
export interface GeminiPart {
  text: string;
}

export interface GeminiContent {
  parts: GeminiPart[];
}

export interface GeminiGenerationConfig {
  maxOutputTokens: number;
  temperature: number;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig: GeminiGenerationConfig;
}

export interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
  };
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
}

// Global Chrome AI declaration
declare global {
  interface Window {
    LanguageModel?: ChromeAILanguageModel;
  }
  
  const LanguageModel: ChromeAILanguageModel | undefined;
}