import emojis from '../emojis.json';
import { resolveEmojiOrThrow } from '../functions/resolve.js';
import { Emoji } from './emoji.js';
import { it, expect } from 'vitest';

const VS16Emoji = new Emoji('\u{263A}\u{FE0F}', 'relaxed', false);
const transFlag = new Emoji(emojis.flags.transgender_flag, 'transgender_flag', false);
const auFlag = new Emoji(emojis.flags.flag_au, 'flag_au', false);
const guildEmoji = new Emoji('538224338269372438', 'fortnitedefaultdance', true);

it('should calculate codepoints properly', () => {
  expect(transFlag.codePoints).toEqual(['1f3f3', 'fe0f', '200d', '26a7', 'fe0f']);
  expect(auFlag.codePoints).toEqual(['1f1e6', '1f1fa']);
  expect(VS16Emoji.codePoints).toEqual(['263a', 'fe0f']);
  expect(() => guildEmoji.codePoints).toThrow();
});

it('should calculate urls properly', () => {
  // make sure we're not unnecessarily stripping the vs16 character here
  // because apparently its used in some places but not others. thanks twemoji!
  expect(transFlag.url).toBe('https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f3f3-fe0f-200d-26a7-fe0f.png');
  // make sure we're stripping the vs16 character when computing the url
  expect(VS16Emoji.url).toBe('https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/263a.png');
  expect(auFlag.url).toBe('https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f1e6-1f1fa.png');
  expect(guildEmoji.url).toBe('https://cdn.discordapp.com/emojis/538224338269372438.gif');
});

it('should convert emojis to markdown properly', () => {
  // make sure we're not removing the vs16 character, because that is still important
  // as it can change how the emoji is displayed when outputting to somewhere that doesnt
  // use twemoji.
  expect(VS16Emoji.markdown).toBe('\u{263A}\u{FE0F}');
  expect(guildEmoji.markdown).toBe('<a:fortnitedefaultdance:538224338269372438>');
});

it('should support getting emojis without a skintone', () => {
  const withoutTone = resolveEmojiOrThrow('woman_factory_worker', null);
  const withTone = resolveEmojiOrThrow('woman_factory_worker_tone1', null);
  expect(withTone.withoutSkinTone?.name).toBe(withoutTone.name);
  expect(withoutTone.withoutSkinTone).toBe(null);

  // because its "person_tone5_curly_hair" this broke regex that checked for
  // "_tone5" at the end of the name. "curly_hair" is also a modifier,
  // and we want to keep it so its a good test.
  const curlyHair = resolveEmojiOrThrow('person_tone5_curly_hair', null);
  const curlyHairWithoutTone = resolveEmojiOrThrow(curlyHair.withoutSkinTone, null);
  expect(curlyHairWithoutTone.name).toBe('person_curly_hair');
  expect(curlyHair.name).toBe('person_tone5_curly_hair');
});
