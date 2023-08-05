import { type Emoji } from '../classes/emoji.js';

export const HAS_SKIN_TONE_SUPPORT = new Set<string>();

export const hasSkinToneSupport = (emoji: Emoji) => {
  if (HAS_SKIN_TONE_SUPPORT.has(emoji.id)) return true;
  return false;
};
