import { ILLMAdapter } from './types.js';

export abstract class BaseLLMAdapter implements ILLMAdapter {
  abstract summarize(diff: string, prompt: string): Promise<string>;
}