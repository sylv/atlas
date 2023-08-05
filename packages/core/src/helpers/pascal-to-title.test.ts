import { expect, it } from 'vitest';
import { pascalToTitle } from './pascal-to-title.js';

it('should convert pascal case to title case', () => {
  expect(pascalToTitle('PascalCase')).toBe('Pascal Case');
  expect(pascalToTitle('SendTTSMessage')).toBe('Send TTS Message');
});
