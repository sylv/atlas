import { EmojiCategory } from './classes/emoji-category.js';
import { Emoji } from './classes/emoji.js';
import { SKIN_TONE_NAME_IDENTIFIER, SKIN_TONE_UNICODE_REGEX } from './constants.js';
import emojiData from './emojis.json';
import { getAllMatches } from './functions/get-all-matches.helper.js';
import { HAS_SKIN_TONE_SUPPORT } from './functions/has-skin-tone-support.js';
import { removeVS16s } from './functions/helpers.js';

const emojiMap = new Map<string, Emoji>();
const emojis: Emoji[] = [];
let emojiSheetIndex = 0;
let categoryIndex = 0;
let previousEmoji: Emoji | undefined;
for (const [categoryName, categoryValue] of Object.entries(emojiData)) {
  // typescript adds a "default" property with a clone of the original object
  // for "helpful" compatibility, which breaks everything and causes infinite loops.
  if (categoryName === 'default') continue;

  const category = new EmojiCategory(categoryName, categoryIndex);
  categoryIndex++;

  for (const [emojiName, emojiId] of Object.entries(categoryValue)) {
    const existingEmoji = emojiMap.get(emojiId);
    if (existingEmoji) {
      existingEmoji.aliases.push(emojiName);
      continue;
    }

    let withoutSkinTone: Emoji | undefined;
    const skinTones = getAllMatches(SKIN_TONE_UNICODE_REGEX, emojiId);
    if (skinTones.size > 0) {
      // emojis with skin tones are always in the list after the variant without the skin tone,
      // if there is a variant without the skin tone. so we use this to get the variant without
      // the skin tone, because its the only reliable method.
      // - stripping "_tone5" from the name breaks with some emojis like :kiss: where :kiss_tone5: renders a completely different emoji
      // - stripping the skintone from the emoji ID and using that breaks with emojis like :man_detective_tone1: for basically no reason

      // we check by ID and name because for some emojis, the base name is different to the skin tone variants
      // so checking both is more reliable
      const nameWithoutSkinTone = emojiName.replace(SKIN_TONE_NAME_IDENTIFIER, '');
      const idWithoutSkinTone = emojiId.replace(SKIN_TONE_UNICODE_REGEX, '');
      if (previousEmoji?.name === nameWithoutSkinTone) withoutSkinTone = previousEmoji;
      else if (previousEmoji?.id === idWithoutSkinTone) withoutSkinTone = previousEmoji;
      else if (previousEmoji?.withoutSkinTone?.name === nameWithoutSkinTone) {
        withoutSkinTone = previousEmoji.withoutSkinTone;
      } else if (previousEmoji?.withoutSkinTone?.id === idWithoutSkinTone) {
        withoutSkinTone = previousEmoji.withoutSkinTone;
      }

      // document that this emoji supports skintones
      HAS_SKIN_TONE_SUPPORT.add(emojiId);
      if (withoutSkinTone) {
        HAS_SKIN_TONE_SUPPORT.add(withoutSkinTone.id);
      }
    }

    const emoji = new Emoji(emojiId, emojiName, false, category, withoutSkinTone);
    emojiMap.set(emoji.name, emoji);
    emojiMap.set(emoji.id, emoji);
    emojiMap.set(removeVS16s(emoji.id), emoji);
    emojis.push(emoji);
    previousEmoji = emoji;

    emoji.index = emojiSheetIndex;
    emojiSheetIndex += 1;
  }
}

export { emojis };
