// @ts-ignore - diff library doesn't have type definitions  
import { diffWordsWithSpace } from '../lib/diff.js';

interface DiffPart {
  added?: boolean;
  removed?: boolean;
  value: string;
}

function textFromHtml(html: string): string {
  // Simple HTML tag removal for service worker environment
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Collapse multiple whitespace
    .trim(); // Remove leading/trailing whitespace
}

function simpleHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function hammingDistance(hash1: number, hash2: number): number {
  let xor = hash1 ^ hash2;
  let distance = 0;
  while (xor !== 0) {
    distance += xor & 1;
    xor >>>= 1;
  }
  return distance;
}

export async function computeDiff(prevHtml: string, newHtml: string): Promise<string | null> {
  const prevText = textFromHtml(prevHtml);
  const newText = textFromHtml(newHtml);
  
  const prevHash = simpleHash(prevText);
  const newHash = simpleHash(newText);
  
  if (hammingDistance(prevHash, newHash) <= 3) {
    return null;
  }
  
  const diff = (diffWordsWithSpace(prevText, newText) as DiffPart[])
    .filter(part => part.added || part.removed)
    .map(part => (part.added ? '+ ' : '- ') + part.value.trim())
    .filter(part => part.length > 2)
    .join('\n');
  
  return diff.length > 0 ? diff : null;
}