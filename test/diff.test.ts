/**
 * @jest-environment jsdom
 */

import { computeDiff } from '../src/utils/diff';

describe('computeDiff', () => {
  test('should return null for identical content', async () => {
    const html = '<html><body><p>Same content</p></body></html>';
    const result = await computeDiff(html, html);
    expect(result).toBeNull();
  });

  test('should detect minor changes', async () => {
    const html1 = '<html><body><p>Content with minor change</p></body></html>';
    const html2 = '<html><body><p>Content with minor changes</p></body></html>';
    const result = await computeDiff(html1, html2);
    expect(result).toContain('change');
  });

  test('should detect significant changes', async () => {
    const html1 = '<html><body><p>Original content here</p></body></html>';
    const html2 = '<html><body><p>Completely different content with new information</p></body></html>';
    const result = await computeDiff(html1, html2);
    expect(result).not.toBeNull();
    expect(result).toContain('different');
  });

  test('should handle HTML tags properly', async () => {
    const html1 = '<html><body><div><h1>Title</h1><p>Paragraph 1</p></div></body></html>';
    const html2 = '<html><body><div><h1>New Title</h1><p>Paragraph 1</p><p>New paragraph</p></div></body></html>';
    const result = await computeDiff(html1, html2);
    expect(result).not.toBeNull();
    expect(result).toContain('New');
  });

  test('should return null for empty input', async () => {
    const result1 = await computeDiff('', '');
    
    expect(result1).toBeNull();
  });
});