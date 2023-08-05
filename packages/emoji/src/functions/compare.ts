import { isPlainObject } from '@atlasbot/core';
import { Emoji } from '../classes/emoji.js';
import { type APIEmojiLike } from '../types.js';
import { type ResolvableInputs } from './resolve.js';
import { resolveEmoji } from './resolve.js';

function getComparableString(input: unknown): string | undefined {
  if (input instanceof Emoji) return input.id;
  if (typeof input === 'string') return input;
  if (isPlainObject(input)) {
    if (typeof input.id === 'string') return input.id;
    if (typeof input.name === 'string') return input.name;
    if (typeof input.name === 'string') return input.name;
  }
}

export function compareEmoji(
  one: ResolvableInputs,
  two: ResolvableInputs,
  guildEmojis: APIEmojiLike[] | null | undefined,
): boolean {
  if (one === null || one === undefined) return false;
  if (two === null || two === undefined) return false;
  if (one === two) return true;
  const oneResolved = resolveEmoji(one, guildEmojis);
  const twoResolved = resolveEmoji(two, guildEmojis);
  if (!oneResolved || !twoResolved) {
    const oneString = getComparableString(oneResolved ?? one);
    const twoString = oneString && getComparableString(twoResolved ?? two);
    if (oneString && twoString) return oneString === twoString;
    return false;
  }

  if (oneResolved.custom || twoResolved.custom) {
    return oneResolved.id === twoResolved.id;
  }

  return oneResolved.name === twoResolved.name;
}
