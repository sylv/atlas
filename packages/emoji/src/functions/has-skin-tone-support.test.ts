import { expect, it } from 'vitest';
import { resolveEmojiOrThrow } from '../functions/resolve.js';
import { hasSkinToneSupport } from './has-skin-tone-support.js';

const withoutSupport = resolveEmojiOrThrow('grinning', null);
const withSupport = resolveEmojiOrThrow('clap', null);
const withSkinTone = resolveEmojiOrThrow('clap_tone5', null);
it('should return true for emojis with skin tone support', () => {
  expect(hasSkinToneSupport(withSupport)).toBe(true);
  expect(hasSkinToneSupport(withSkinTone)).toBe(true);
  expect(hasSkinToneSupport(withoutSupport)).toBe(false);
});
