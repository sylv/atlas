import { NUMBER_REGEX } from '@atlasbot/core';
import rgbToHex from 'rgb-hex';
import { HEX_REGEX, MAX_HEX_COLOUR, MIN_HEX_COLOUR, RGB_REGEX } from '../constants.js';
import { getClosestColour } from './get-closest-known-colour.js';
import { getKnownColour } from './get-known-colour.js';
import { type Colour } from './known-colours.js';

export interface ColourParseResult {
  /**
   * The decimal representation of the colour.
   * If the input was an actual hex value, this will be that parsed value.
   * Otherwise, this is the decimal value of the colour that was resolved by name.
   */
  value: number;
  /**
   * The closest known colour to the value above.
   * This can be used to determine the name of the colour or whatever else you wanna do.
   */
  closest: Colour;
  /**
   * If the input matches a known value exactly, this is that value.
   * Always the same as "closest", but this is only set if it is an exact match with a known colour.
   */
  match?: Colour;
}

/**
 * Parse a colour, attempting to resolve the input to a value no matter what.
 * Takes hex, decimal, rgb, or a known name.
 */
export function parseColour(colour: string | number): ColourParseResult | undefined {
  if (typeof colour === 'number' || NUMBER_REGEX.test(colour)) {
    const value = typeof colour === 'string' ? Number(colour) : colour;
    if (MAX_HEX_COLOUR < value || MIN_HEX_COLOUR > value) return;
    const closest = getClosestColour(value);
    const match = closest.decimal === value ? closest : undefined;
    return {
      value,
      closest,
      match,
    };
  }

  colour = colour.trim();
  const knownByName = getKnownColour(colour);
  if (knownByName) {
    return {
      value: knownByName.decimal,
      closest: knownByName,
      match: knownByName,
    };
  }

  const hex = HEX_REGEX.exec(colour);
  if (hex) {
    const value = Number.parseInt(hex.groups!.value, 16);
    const closest = getClosestColour(value);
    const match = closest.decimal === value ? closest : undefined;
    return {
      value,
      closest,
      match,
    };
  }

  const rgb = RGB_REGEX.exec(colour);
  if (rgb) {
    const { r, g, b } = rgb.groups!;
    const value = Number.parseInt(rgbToHex(Number(r), Number(g), Number(b)), 16);
    if (value >= MIN_HEX_COLOUR && value <= MAX_HEX_COLOUR) {
      const closest = getClosestColour(value);
      const match = closest.decimal === value ? closest : undefined;
      return {
        value,
        closest,
        match,
      };
    }
  }
}
