import { BaseLLMAdapter } from './base.js';

export class ChromeAIAdapter extends BaseLLMAdapter {
  constructor() {
    super();
    this.session = null;
  }

  async initialize() {
    if (!('ai' in self) || !('languageModel' in self.ai)) {
      throw new Error('Chrome AI not available');
    }

    try {
      this.session = await self.ai.languageModel.create({
        temperature: 0.7,
        topK: 3
      });
    } catch (error) {
      throw new Error('Failed to initialize Chrome AI session');
    }
  }

  async summarize(diff, prompt) {
    if (!this.session) {
      await this.initialize();
    }

    try {
      const response = await this.session.prompt(`${prompt}\n\nChanges detected:\n${diff}`);
      return response.trim() || 'Unable to summarize changes';
    } catch (error) {
      throw new Error('Chrome AI summarization failed');
    }
  }
}