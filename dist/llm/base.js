export class BaseLLMAdapter {
  async summarize(diff, prompt) {
    throw new Error('summarize method must be implemented');
  }
}