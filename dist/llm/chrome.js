import { BaseLLMAdapter } from './base.js';

export class ChromeAIAdapter extends BaseLLMAdapter {
  constructor() {
    super();
    this.session = null;
  }

  async initialize() {
    // Check if Chrome AI is available (following official sample pattern)
    if (!('LanguageModel' in self)) {
      throw new Error('Chrome AI Prompt API not available. Please enable it in chrome://flags/#prompt-api-for-gemini-nano');
    }

    try {
      // Get default parameters
      const defaults = await LanguageModel.params();
      console.log('Chrome AI defaults:', defaults);

      // Create session with default parameters (following sample pattern)
      this.session = await LanguageModel.create({
        temperature: defaults.defaultTemperature,
        topK: defaults.defaultTopK
      });
      
      console.log('Chrome AI session created successfully');
    } catch (error) {
      console.error('Chrome AI initialization error:', error);
      this.reset();
      throw new Error(`Failed to initialize Chrome AI: ${error.message}`);
    }
  }

  reset() {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }

  async runPrompt(prompt) {
    try {
      if (!this.session) {
        await this.initialize();
      }
      return await this.session.prompt(prompt);
    } catch (error) {
      console.error('Chrome AI prompt error:', error);
      this.reset();
      throw error;
    }
  }

  async summarize(diff, prompt) {
    try {
      const fullPrompt = `${prompt}\n\nChanges detected:\n${diff}`;

      console.log('Sending prompt to Chrome AI...');
      const response = await this.runPrompt(fullPrompt);
      console.log('Chrome AI response received:', response);
      
      return response?.trim() || 'Unable to summarize changes';
    } catch (error) {
      console.error('Chrome AI summarization failed:', error);
      throw new Error(`Chrome AI summarization failed: ${error.message}`);
    }
  }

  // Clean up resources
  destroy() {
    this.reset();
  }
}