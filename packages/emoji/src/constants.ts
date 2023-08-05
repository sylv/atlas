export const TWITTER_EMOJI_ROOT = 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets';

export const SHEET_EMOJIS_PER_ROW = 32;
export const SHEET_EMOJI_SIZE = 24;

export const SKIN_TONE_ONE = '\u{1F3FB}';
export const SKIN_TONE_TWO = '\u{1F3FC}';
export const SKIN_TONE_THREE = '\u{1F3FD}';
export const SKIN_TONE_FOUR = '\u{1F3FE}';
export const SKIN_TONE_FIVE = '\u{1F3FF}';
export const SKIN_TONES = [SKIN_TONE_ONE, SKIN_TONE_TWO, SKIN_TONE_THREE, SKIN_TONE_FOUR, SKIN_TONE_FIVE];

export const SKIN_TONE_SUFFIX_LENGTH = '_tone1'.length;
export const SKIN_TONE_NAME_IDENTIFIER = /_tone[1-5]/gu;
export const SKIN_TONE_UNICODE_REGEX = new RegExp(
  `${SKIN_TONE_ONE}|${SKIN_TONE_TWO}|${SKIN_TONE_THREE}|${SKIN_TONE_FOUR}|${SKIN_TONE_FIVE}`,
  'gu',
);
