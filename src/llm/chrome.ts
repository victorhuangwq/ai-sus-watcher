import { BaseLLMAdapter } from './base.js';
import { ChromeAISession, ChromeAIModelParams, ChromeAICreateOptions } from './types.js';

export class ChromeAIAdapter extends BaseLLMAdapter {
  private session: ChromeAISession | null = null;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    // Check if Chrome AI is available (following official sample pattern)
    if (!('LanguageModel' in self)) {
      throw new Error('Chrome AI Prompt API not available. Please enable it in chrome://flags/#prompt-api-for-gemini-nano');
    }

    try {
      // Get default parameters
      const defaults: ChromeAIModelParams = await LanguageModel!.params();
      console.log('Chrome AI defaults:', defaults);

      // Create session with default parameters (following sample pattern)
      const options: ChromeAICreateOptions = {
        temperature: defaults.defaultTemperature,
        topK: defaults.defaultTopK
      };
      
      this.session = await LanguageModel!.create(options);
      
      console.log('Chrome AI session created successfully');
    } catch (error) {
      console.error('Chrome AI initialization error:', error);
      this.reset();
      throw new Error(`Failed to initialize Chrome AI: ${(error as Error).message}`);
    }
  }

  reset(): void {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }

  async runPrompt(prompt: string): Promise<string> {
    try {
      if (!this.session) {
        await this.initialize();
      }
      return await this.session!.prompt(prompt);
    } catch (error) {
      console.error('Chrome AI prompt error:', error);
      this.reset();
      throw error;
    }
  }

  async summarize(diff: string, prompt: string): Promise<string> {
    try {
      const fullPrompt = `${prompt}\n\nChanges detected:\n${diff}`;

      console.log('Sending prompt to Chrome AI...');
      const response = await this.runPrompt(fullPrompt);
      console.log('Chrome AI response received:', response);
      
      return response?.trim() || 'Unable to summarize changes';
    } catch (error) {
      console.error('Chrome AI summarization failed:', error);
      throw new Error(`Chrome AI summarization failed: ${(error as Error).message}`);
    }
  }

  // Clean up resources
  destroy(): void {
    this.reset();
  }
}