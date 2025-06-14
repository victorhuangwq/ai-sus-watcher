import { BaseLLMAdapter } from './base.js';

export class NoLLMAdapter extends BaseLLMAdapter {
  async summarize(diff, prompt) {
    const lines = diff.split('\n').slice(0, 10);
    return lines.join('\n') + (diff.split('\n').length > 10 ? '\n...(truncated)' : '');
  }
}