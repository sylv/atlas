import { decimalToHex } from '@atlasbot/core';
import { type RgbaObject } from 'hex-rgb';
import hexRgb from 'hex-rgb';
import { type Colour } from './known-colours.js';
import { KNOWN_COLOURS } from './known-colours.js';

/**
 * Get the distance between two colours (in rgb)
 */
function distance(one: RgbaObject, two: RgbaObject) {
  return Math.hypot(one.red - two.red, one.green - two.green, one.blue - two.blue);
}

/**
 * Get the closest known colour to the given decimal colour.
 */
export function getClosestColour(decimal: number): Colour {
  const rgb = hexRgb(decimalToHex(decimal));

  return KNOWN_COLOURS.reduce((previous, current) => {
    const distanceToCurrent = distance(rgb, hexRgb(current.hex));
    const distanceToPrevious = distance(rgb, hexRgb(previous.hex));
    return distanceToCurrent < distanceToPrevious ? current : previous;
  });
}
