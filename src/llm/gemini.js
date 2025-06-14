import { BaseLLMAdapter } from './base.js';

export class GeminiAdapter extends BaseLLMAdapter {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async summarize(diff, prompt) {
    if (!this.apiKey) {
      throw new Error('Gemini API key required');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nChanges detected:\n${diff}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text?.trim() || 'Unable to summarize changes';
  }
}