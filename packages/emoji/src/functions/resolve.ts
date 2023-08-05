import { Emoji } from '../classes/emoji.js';
import { emojis } from '../emojis.js';
import { type APIEmojiLike } from '../types.js';
import { removeVS16s } from './helpers.js';

export type ResolvableInputs = string | null | undefined | Emoji | APIEmojiLike;

const REACTION_REGEX = /(a:)?(?<name>\w+)(?::(?<id>\d{17,19}))?/iu;
const EMOJI_MAP = new Map<string, Emoji>();
const DISCORD_GUILD_EMOJI_REGEX = /^<?(?<animated>a)?:?(?<name>[A-z0-9_]+):(?<id>\d{17,19})>?$/u;
const DISCORD_EMOJI_MARKDOWN_REGEX = /:(?<name>\w+):/iu;

for (const emoji of emojis) {
  const key = removeVS16s(emoji.id);
  EMOJI_MAP.set(key, emoji);
  EMOJI_MAP.set(emoji.name, emoji);
}

/**
 * Convert a Discord emoji object to a resolved emoji.
 */
export function convertDiscordToResolved(emoji: APIEmojiLike): Emoji | undefined {
  if (!emoji.name) return;
  if (!emoji.id) return resolveEmojiUnicode(emoji.name);
  return new Emoji(emoji.id, emoji.name, emoji.animated ?? false);
}

/**
 * Resolve a native emoji to a Emoji.
 */
export function resolveEmojiUnicode(input: string): Emoji | undefined {
  const reactionMatch = DISCORD_EMOJI_MARKDOWN_REGEX.exec(input);
  const query = (reactionMatch?.groups?.name ?? input).trim();
  // doing toLowerCase() on the emoji name is fine,  but doing it on an actual
  // emoji can break it, so we do both where the first will handle emoji
  // characters and lowercase names and the second will handle uppercase names
  const aliased = EMOJI_MAP.get(query) ?? EMOJI_MAP.get(query.toLowerCase());
  if (aliased) return aliased;
  const key = removeVS16s(query);
  return EMOJI_MAP.get(key);
}

/**
 * Parse a guild emoji string to a resolved emoji.
 */
export function resolveEmojiGuild(input: string, guildEmojis: APIEmojiLike[] | null | undefined): Emoji | undefined {
  const guildMatch = DISCORD_GUILD_EMOJI_REGEX.exec(input);
  if (guildMatch) {
    const { id, name, animated } = guildMatch.groups!;
    return new Emoji(id, name, !!animated);
  }

  if (guildEmojis) {
    const reactionMatch = REACTION_REGEX.exec(input);
    if (reactionMatch?.groups?.id) {
      const emojiId = reactionMatch.groups.id;
      const emoji = guildEmojis.find((emoji) => emoji.id === emojiId);
      if (emoji) convertDiscordToResolved(emoji);
    }

    const query = (reactionMatch?.groups?.name ?? input).trim().toLowerCase();
    const customEmoji = guildEmojis.find((emoji) => emoji.name?.toLowerCase() === query || emoji.id === query);
    if (customEmoji) {
      return convertDiscordToResolved(customEmoji);
    }
  }
}

/**
 * Resolve a native or guild emoji to a Emoji
 * @param guildEmojis Optional emojis to be used for better custom emoji extraction.
 */
export function resolveEmoji(
  input: ResolvableInputs,
  guildEmojis: APIEmojiLike[] | null | undefined,
): Emoji | undefined {
  if (!input) return;
  if (input instanceof Emoji) return input;
  if (typeof input === 'object') return convertDiscordToResolved(input);
  return resolveEmojiGuild(input, guildEmojis) ?? resolveEmojiUnicode(input);
}

/**
 * Resolve a native or guild emoji to a Emoji, throwing
 * if one could not be resolved.
 */
export function resolveEmojiOrThrow(input: ResolvableInputs, guildEmojis: APIEmojiLike[] | null | undefined): Emoji {
  const output = resolveEmoji(input, guildEmojis);
  if (!output) {
    const error: any = new Error('Could not resolve emoji');
    error.input = input;
    throw error;
  }

  return output;
}
