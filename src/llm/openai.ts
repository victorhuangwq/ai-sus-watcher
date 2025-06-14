import { BaseLLMAdapter } from './base.js';
import { OpenAIRequest, OpenAIResponse } from './types.js';

export class OpenAIAdapter extends BaseLLMAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async summarize(diff: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const requestBody: OpenAIRequest = {
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `${prompt}\n\nChanges detected:\n${diff}`
      }],
      max_tokens: 150,
      temperature: 0.5
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'Unable to summarize changes';
  }
}