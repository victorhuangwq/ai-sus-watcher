import { BaseLLMAdapter } from './base.js';

export class OpenAIAdapter extends BaseLLMAdapter {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async summarize(diff, prompt) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `${prompt}\n\nChanges detected:\n${diff}`
        }],
        max_tokens: 150,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'Unable to summarize changes';
  }
}