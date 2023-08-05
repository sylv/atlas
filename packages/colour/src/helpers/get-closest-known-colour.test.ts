import { expect, it } from 'vitest';
import { getClosestColour } from './get-closest-known-colour.js';

it('should get the closest known colour from a decimal value', () => {
  expect(getClosestColour(0xf44336).name).toBe('Red');
  expect(getClosestColour(0xe5493d).name).toBe('Red');
  expect(getClosestColour(0xe5493d).name).toBe('Red');
  expect(getClosestColour(0x2196f3).name).toBe('Blue');
  expect(getClosestColour(0x9c27b0).name).toBe('Purple');
});
