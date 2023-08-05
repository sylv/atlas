import { expect, it } from 'vitest';
import { Emoji } from '../classes/emoji.js';
import { SKIN_TONE_FIVE } from '../constants.js';
import { emojis } from '../emojis.js';
import emoji from '../emojis.json';
import { type APIEmojiLike } from '../types.js';
import { resolveEmoji, resolveEmojiOrThrow } from './resolve.js';

const FORTNITE_EMOJI = new Emoji('538224338269372438', 'fortnitedefaultdance', true);
const GUILD_EMOJIS: APIEmojiLike[] = [
  {
    name: 'hidethepainharold',
    id: '563866972614557721',
    animated: false,
  },
  {
    name: 'shidded',
    id: '578531733910192138',
    animated: false,
  },
  {
    name: 'thanosdaddy',
    id: '581126554629832715',
    animated: true,
  },
  {
    name: 'sansdance',
    id: '581128825014976513',
    animated: true,
  },
  {
    name: 'fortnitedefaultdance',
    id: '538224338269372438',
    animated: true,
  },
  {
    name: '123',
    id: '538224338269372439',
    animated: true,
  },
];
it('should handle native emojis', () => {
  expect(resolveEmoji('🥺', null)).toMatchInlineSnapshot(
    '{"id":"🥺","name":"pleading_face","codePoints":["1f97a"],"hasSkinTone":false,"category":"people"}',
  );

  // unicode 13.0
  expect(resolveEmoji('🥲', null)).toMatchInlineSnapshot(
    '{"id":"🥲","name":"smiling_face_with_tear","codePoints":["1f972"],"hasSkinTone":false,"category":"people"}',
  );

  // unicode 13.1
  expect(resolveEmoji('❤️‍🩹', null)).toMatchInlineSnapshot(
    '{"id":"❤️‍🩹","name":"mending_heart","codePoints":["2764","fe0f","200d","1fa79"],"hasSkinTone":false,"category":"symbols"}',
  );
});

it('should resolve emojis from a discord markdown string', () => {
  expect(resolveEmoji('<:iospleading:814124432678322207>', null)).toMatchInlineSnapshot(
    '{"id":"814124432678322207","name":"iospleading","animated":false,"custom":true}',
  );

  expect(resolveEmoji('<a:fortnitedefaultdance:538224338269372438>', null)).toMatchInlineSnapshot(
    '{"id":"538224338269372438","name":"fortnitedefaultdance","animated":true,"custom":true}',
  );

  expect(resolveEmoji(':eggplant:', null)).toMatchInlineSnapshot(
    '{"id":"🍆","name":"eggplant","codePoints":["1f346"],"hasSkinTone":false,"category":"food"}',
  );

  expect(resolveEmoji('EGGPLANT', null)).toMatchInlineSnapshot(
    '{"id":"🍆","name":"eggplant","codePoints":["1f346"],"hasSkinTone":false,"category":"food"}',
  );
});

it('should resolve an emoji from a discord emoji object', () => {
  expect(resolveEmoji({ id: '693452780672778250', name: 'elrisitas' }, null)).toMatchInlineSnapshot(
    '{"id":"693452780672778250","name":"elrisitas","animated":false,"custom":true}',
  );

  expect(resolveEmoji({ id: null, name: '🍆' }, null)).toMatchInlineSnapshot(
    '{"id":"🍆","name":"eggplant","codePoints":["1f346"],"hasSkinTone":false,"category":"food"}',
  );
});

it('should correctly handle emojis with VS16 characters', () => {
  // https://stackoverflow.com/questions/38100329/some-emojis-e-g-have-two-unicode-u-u2601-and-u-u2601-ufe0f-what-does
  // the variation only effects how the emoji is rendered, and since we use twemoji
  // all it did was get in the way. specifically, the url generated would include the vs16 character
  // as "263a-fe0f" which would result in a not found error, so we have to trim those when generating the url.
  const expectedEmoji = expect.objectContaining({
    name: 'relaxed',
  });

  expect(resolveEmoji('\u{263A}', null)).toEqual(expectedEmoji);
  expect(resolveEmoji('\u{263A}\u{FE0F}', null)).toEqual(expectedEmoji);
});

it('should handle emojis with a skin tone modifiers', () => {
  // discord treats these as separate emojis which is good
  // because we dont have to do anything. its still useful to test in case that
  // changes in a future update.
  expect(resolveEmojiOrThrow('👋🏿', null).getSkinTone()).toBe(SKIN_TONE_FIVE);
  expect(resolveEmoji('👋🏿', null)).toMatchInlineSnapshot(
    '{"id":"👋🏿","name":"wave_tone5","codePoints":["1f44b","1f3ff"],"hasSkinTone":true,"category":"people"}',
  );

  // just make sure we're not extracting modifiers that dont exist.
  expect(resolveEmojiOrThrow('👏', null).getSkinTone()).toBeUndefined();
});

it('should handle flag emojis', () => {
  // country flags are two regional indicators that make up the two-digit iso country
  // code, and two characters has never been a great time so we double check we dont fuck up.
  expect(resolveEmoji(emoji.flags.flag_au, null)).toMatchInlineSnapshot(
    '{"id":"🇦🇺","name":"flag_au","codePoints":["1f1e6","1f1fa"],"hasSkinTone":false,"category":"flags"}',
  );

  expect(resolveEmoji(emoji.flags.transgender_flag, null)).toMatchInlineSnapshot(
    '{"id":"🏳️‍⚧️","name":"transgender_flag","codePoints":["1f3f3","fe0f","200d","26a7","fe0f"],"hasSkinTone":false,"category":"flags"}',
  );
});

it('should trim white space around emojis', () => {
  expect(resolveEmoji(' 👋 ', null)).toMatchInlineSnapshot(
    '{"id":"👋","name":"wave","codePoints":["1f44b"],"hasSkinTone":false,"category":"people"}',
  );
});

it('should resolve guild emojis from GUILD_EMOJIS', () => {
  expect(resolveEmoji('fortnitedefaultdance', GUILD_EMOJIS)).toMatchInlineSnapshot(
    '{"id":"538224338269372438","name":"fortnitedefaultdance","animated":true,"custom":true}',
  );

  expect(resolveEmoji('FORTNITEDEFAULTDANCE', GUILD_EMOJIS)).toMatchInlineSnapshot(
    '{"id":"538224338269372438","name":"fortnitedefaultdance","animated":true,"custom":true}',
  );

  expect(resolveEmoji(':fortnitedefaultdance:', GUILD_EMOJIS)).toMatchInlineSnapshot(
    '{"id":"538224338269372438","name":"fortnitedefaultdance","animated":true,"custom":true}',
  );

  expect(resolveEmoji('538224338269372438', GUILD_EMOJIS)).toMatchInlineSnapshot(
    '{"id":"538224338269372438","name":"fortnitedefaultdance","animated":true,"custom":true}',
  );
});

it(`should resolve every emoji in "emojis" from list.emoji`, () => {
  // this is just a general sanity check and makes sure we aren't
  // doing any processing on the hashmap that prevents lookups
  for (const emoji of emojis) {
    // we cant just compare the resolved emoji to the emoji
    // as discord aliases names by duplicating them.
    // "satisfied" and "laughing" are the same emoji with different keys
    expect(resolveEmoji(emoji.name, null)?.name).toEqual(emoji.name);
    expect(resolveEmoji(emoji.name, null)?.id).toEqual(emoji.id);
    expect(resolveEmoji(emoji.id, null)?.id).toEqual(emoji.id);
  }
});

it('should resolve malformed markdown emojis', () => {
  expect(resolveEmoji('thanosdaddy:581126554629832715', null)).toBeDefined();
  expect(resolveEmoji('a:123:538224338269372439', null)).toBeDefined();
  expect(resolveEmoji(FORTNITE_EMOJI.reaction, null)).toBeDefined();
});

it('should prefer markdown emojis over GUILD_EMOJIS of the same name', () => {
  const resolved = resolveEmoji('<a:fortnitedefaultdance:112309823098102931>', GUILD_EMOJIS);
  expect(resolved?.id).not.toEqual(FORTNITE_EMOJI.id);
  expect(resolved?.id).toBe('112309823098102931');
});

it('should return the same instance of the emoji', () => {
  expect(resolveEmoji('smile', null) === resolveEmoji('smile', null)).toBe(true);
});
