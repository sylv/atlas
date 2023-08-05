import { expect, it } from 'vitest';
import { emojis } from './emojis.js';
import { resolveEmojiOrThrow } from './functions/resolve.js';

it('should have all unicode 13.1 emojis', () => {
  expect(emojis.length).toBeGreaterThanOrEqual(3521);
});

it('should keep aliases', () => {
  const angerRight = resolveEmojiOrThrow('anger_right', null);
  expect(angerRight.aliases[0]).toBe('right_anger_bubble');
});

it('should not have duplicates', () => {
  const seen = new Set<string>();
  for (const emoji of emojis) {
    expect(seen.has(emoji.name)).toBe(false);
    seen.add(emoji.name);
  }
});
