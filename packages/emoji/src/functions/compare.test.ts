import { expect, it } from 'vitest';
import { Emoji } from '../classes/emoji.js';
import { compareEmoji } from './compare.js';
import { resolveEmoji } from './resolve.js';

it('should do simple comparisons', () => {
  expect(compareEmoji('😈', '😈', null)).toBe(true);
  expect(compareEmoji('pleading_face', 'pleading_face', null)).toBe(true);
  expect(compareEmoji('🥺', 'pleading_face', null)).toBe(true);
  expect(compareEmoji('smiling_face_with_tear', '🥲', null)).toBe(true);
  expect(compareEmoji('😈', '🥺', null)).toBe(false);
  expect(compareEmoji('😈', 'pleading_face', null)).toBe(false);
  expect(compareEmoji('836366988670533685', '836366988670533685', null)).toBe(true);
  expect(
    compareEmoji('<a:fortnitedefaultdance:538224338269372438>', '<a:fortnitedefaultdance:538224338269372438>', null),
  ).toBe(true);
});

it('should say different skintone variants of the same emoji are not the same.', () => {
  // emojis with skintones are two separate emojis
  // joined with a zero-width joiner. skintone variants
  // should be treated as entirely different emojis for simplicity.
  expect(compareEmoji('👋🏿', '👋🏿', null)).toBe(true);
  expect(compareEmoji('👋🏿', '👋', null)).toBe(false);
});

it('should correctly compare two variants of the same emoji', () => {
  const variant = '☺️'; // ends with 0xFE0F
  const normal = '☺'; // is just a regular emoji
  // sanity check to make sure the invisible variant
  // character hasn't gone to the moon
  expect(variant).not.toBe(normal);
  expect(compareEmoji(variant, normal, null)).toBe(true);
});

it('should correctly compare flags', () => {
  expect(compareEmoji('🇦🇺', '🇦🇺', null)).toBe(true);
  expect(compareEmoji('🏳️‍⚧️', 'transgender_flag', null)).toBe(true);
  expect(compareEmoji('🇦🇺', '🇺🇸', null)).toBe(false);
});

it('should compare unresolvable inputs', () => {
  expect(resolveEmoji('836366988670533685', null)).toBeUndefined();

  // i was on the fence about this but i think its reasonable as guild emojis
  // can share the same name and be completely different.
  expect(
    compareEmoji(
      'transkitty',
      {
        name: 'transkitty',
        id: '836366988670533685',
      },
      null,
    ),
  ).toBe(false);

  // ids however are unique and are safe to compare with minimal
  // knowledge about the input.
  expect(
    compareEmoji(
      '836366988670533685',
      {
        name: 'transkitty',
        id: '836366988670533685',
      },
      null,
    ),
  ).toBe(true);

  expect(compareEmoji('836366988670533685', new Emoji('836366988670533685', 'transkitty', false), null)).toBe(true);
});

it('should not compare null-like values', () => {
  expect(compareEmoji(null, null, null)).toBe(false);
  expect((compareEmoji as any)()).toBe(false);
  expect(compareEmoji(0 as any, 0 as any, null)).toBe(true);
  expect((compareEmoji as any)(null)).toBe(false);
  expect(compareEmoji(0 as any, null, null)).toBe(false);
  expect(compareEmoji('836366988670533685', null, null)).toBe(false);
});
