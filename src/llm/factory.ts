import { OpenAIAdapter } from './openai.js';
import { GeminiAdapter } from './gemini.js';
import { ChromeAIAdapter } from './chrome.js';
import { NoLLMAdapter } from './noLlm.js';
import { ILLMAdapter, LLMProvider } from './types.js';

export function createLLMAdapter(provider: LLMProvider, apiKey?: string): ILLMAdapter {
  switch (provider) {
    case 'openai':
      if (!apiKey) {
        throw new Error('API key is required for OpenAI provider');
      }
      return new OpenAIAdapter(apiKey);
    case 'gemini':
      if (!apiKey) {
        throw new Error('API key is required for Gemini provider');
      }
      return new GeminiAdapter(apiKey);
    case 'chrome':
      return new ChromeAIAdapter();
    case 'no-llm':
    default:
      return new NoLLMAdapter();
  }
}