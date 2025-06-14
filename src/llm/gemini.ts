import { BaseLLMAdapter } from './base.js';
import { GeminiRequest, GeminiResponse } from './types.js';

const GEMINI_MODEL = 'gemini-2.0-flash';

export class GeminiAdapter extends BaseLLMAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async summarize(diff: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key required');
    }

    const fullPrompt = `${prompt}\n\nChanges detected:\n${diff}`;
    
    const request: GeminiRequest = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3
      }
    };

    try {
      console.log('Calling Gemini API with model:', GEMINI_MODEL);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('Gemini API response received');
      
      return data.candidates[0]?.content?.parts[0]?.text?.trim() || 'Unable to summarize changes';
      
    } catch (error) {
      console.error('Error generating Gemini summary:', error);
      throw new Error(`Gemini summarization failed: ${(error as Error).message}`);
    }
  }
}