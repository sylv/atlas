import { NUMBER_REGEX } from '@atlasbot/core';
import { SKIN_TONES, TWITTER_EMOJI_ROOT } from '../constants.js';
import { hasSkinToneSupport } from '../functions/has-skin-tone-support.js';
import { toCodePoints, toCodePointsWithoutVS16s } from '../functions/helpers.js';
import { type EmojiCategory } from './emoji-category.js';

export class Emoji {
  /**
   * The ID of the emoji.
   * @warning unlike discord emojis, this will be the emoji snowflake for custom emojis or the emoji character for native emojis.
   */
  readonly id: string;

  /**
   * The name of the emoji.
   * @warning unlike discords emoji structures, this will be the emoji name even for native emojis.
   */
  readonly name: string;

  /**
   * Whether this emoji is animated.
   * @warning always false for native emojis
   */
  readonly animated: boolean;

  /**
   * The category.
   * @warning only available for native emojis.
   */
  readonly category: EmojiCategory | null;

  /**
   * Aliases for this emoji.
   * @warning only available for native emojis.
   */
  readonly aliases: string[] = [];

  /**
   * The index of this emoji in the sorted emojis list.
   * Used for determining the emoji sheet position.
   * @warning only available for native emojis.
   */
  index: number | null = null;

  /**
   * This emoji without a skin tone, if it has a skin tone.
   */
  withoutSkinTone: Emoji | null;

  constructor(
    id: string,
    name: string,
    animated = false,
    category: EmojiCategory | null = null,
    withoutSkinTone: Emoji | null = null,
  ) {
    this.id = id;
    this.name = name;
    this.animated = animated;
    this.category = category;
    this.withoutSkinTone = withoutSkinTone;
  }

  /**
   * Get the codepoints for the emoji.
   * @warning throws if this emoji is a custom emoji
   */
  get codePoints(): string[] {
    if (this.custom) throw new Error('Cannot get codepoints of custom emoji.');
    return toCodePoints(this.id);
  }

  /**
   * Whether this emoji is a custom guild emoji.
   */
  get custom(): boolean {
    return NUMBER_REGEX.test(this.id);
  }

  /**
   * The URL for the image for this emoji.
   */
  get url(): string {
    return this.getUrl('png', 'gif', 'png');
  }

  /**
   * Format this emoji for Discord
   */
  get markdown(): string {
    if (!this.custom) return this.id;
    const animatedPrefix = this.animated ? 'a' : '';
    return `<${animatedPrefix}${this.reaction}>`;
  }

  /**
   * Format this emoji for the reaction endpoints
   * https://discord.com/developers/docs/resources/channel#create-reaction
   */
  get reaction(): string {
    if (!this.custom) return this.id;
    return `:${this.name}:${this.id}`;
  }

  get hasSkinTone() {
    return !!this.withoutSkinTone;
  }

  canHaveSkinTone() {
    return hasSkinToneSupport(this);
  }

  getSkinTone() {
    if (this.custom) return;
    for (const skinTone of SKIN_TONES) {
      if (this.id.includes(skinTone)) return skinTone;
    }
  }

  getUrl(
    nativeFormat: 'png' | 'svg' = 'png',
    animatedFormat: 'gif' = 'gif',
    guildFormat: 'png' | 'webp' = 'png',
  ): string {
    if (this.custom) {
      const extension = this.animated ? animatedFormat : guildFormat;
      return `https://cdn.discordapp.com/emojis/${this.id}.${extension}`;
    }

    const assetType = nativeFormat === 'svg' ? 'svg' : '72x72';
    const codePoints = toCodePointsWithoutVS16s(this.id);
    const key = codePoints.join('-');
    return `${TWITTER_EMOJI_ROOT}/${assetType}/${key}.${nativeFormat}`;
  }

  toAPIEmoji() {
    if (this.custom) {
      return { id: this.id, animated: this.animated, name: null };
    }

    return { id: null, animated: false, name: this.id };
  }

  toComponentEmoji() {
    if (this.custom) {
      return { id: this.id, animated: this.animated, name: this.name };
    }

    return { name: this.id };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
      animated: this.animated,
      aliases: this.aliases,
      category: this.category,
    };
  }
}
