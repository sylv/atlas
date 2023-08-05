import { type Colour } from './known-colours.js';
import { KNOWN_COLOURS } from './known-colours.js';

export const COLOUR_MAP = new Map<string | number, Colour>();
export const STRIP_REGEX = /^0x| |_/gu;
for (const colour of KNOWN_COLOURS) {
  COLOUR_MAP.set(colour.hex.toLowerCase(), colour);
  COLOUR_MAP.set(colour.hex.slice(1).toLowerCase(), colour);
  COLOUR_MAP.set(colour.name.toLowerCase().replaceAll(STRIP_REGEX, ''), colour);
  COLOUR_MAP.set(colour.decimal.toString(), colour);
}

export function getKnownColour(input: string): Colour | undefined {
  const query = input.toLowerCase().replaceAll(STRIP_REGEX, '');
  const result = COLOUR_MAP.get(query);
  if (result !== undefined) return result;
}

export function getKnownColourOrThrow(input: string): Colour {
  const result = getKnownColour(input);
  if (result === undefined) {
    throw new Error(`Unknown colour "${input}""`);
  }

  return result;
}
