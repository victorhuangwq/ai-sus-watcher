import { OpenAIAdapter } from './openai.js';
import { GeminiAdapter } from './gemini.js';
import { ChromeAIAdapter } from './chrome.js';
import { NoLLMAdapter } from './noLlm.js';

export function createLLMAdapter(provider, apiKey) {
  switch (provider) {
    case 'openai':
      return new OpenAIAdapter(apiKey);
    case 'gemini':
      return new GeminiAdapter(apiKey);
    case 'chrome':
      return new ChromeAIAdapter();
    case 'no-llm':
    default:
      return new NoLLMAdapter();
  }
}