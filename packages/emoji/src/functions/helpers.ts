/* eslint-disable unicorn/prefer-code-point */
const VS16_REGEX = /\uFE0F/gu;
const ZERO_WIDTH_JOINER = String.fromCodePoint(0x200d);

// https://en.wikipedia.org/wiki/Variation_Selectors_(Unicode_block)
// without stripping these, emojis that are the same wont match eachother.
// THe VS16 character(s) are just changing how the emoji is displayed and
// get in the way for things like comparison or lookup.
// https://github.com/twitter/twemoji-parser/blob/a97ef3994e4b88316812926844d51c296e889f76/src/index.js#L56
export function removeVS16s(emoji: string): string {
  if (!emoji.includes(ZERO_WIDTH_JOINER)) return emoji.replaceAll(VS16_REGEX, '');
  return emoji;
}

export function toCodePointsWithoutVS16s(emoji: string): string[] {
  return toCodePoints(removeVS16s(emoji));
}

export function toCodePoints(emoji: string): string[] {
  const points = [];
  let previous;
  for (let index = 0; index < emoji.length; index++) {
    const char = emoji.charCodeAt(index);
    if (previous) {
      points.push((0x1_00_00 + ((previous - 0xd8_00) << 10) + (char - 0xdc_00)).toString(16));
      previous = 0;
    } else if (char > 0xd8_00 && char <= 0xdb_ff) {
      previous = char;
    } else {
      points.push(char.toString(16));
    }
  }
  return points;
}
