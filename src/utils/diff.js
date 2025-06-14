import { diffWordsWithSpace } from 'diff';

function textFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || doc.body.innerText || '';
}

function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function hammingDistance(hash1, hash2) {
  let xor = hash1 ^ hash2;
  let distance = 0;
  while (xor !== 0) {
    distance += xor & 1;
    xor >>>= 1;
  }
  return distance;
}

export async function computeDiff(prevHtml, newHtml) {
  const prevText = textFromHtml(prevHtml);
  const newText = textFromHtml(newHtml);
  
  const prevHash = simpleHash(prevText);
  const newHash = simpleHash(newText);
  
  if (hammingDistance(prevHash, newHash) <= 3) {
    return null;
  }
  
  const diff = diffWordsWithSpace(prevText, newText)
    .filter(part => part.added || part.removed)
    .map(part => (part.added ? '+ ' : '- ') + part.value.trim())
    .filter(part => part.length > 2)
    .join('\n');
  
  return diff.length > 0 ? diff : null;
}