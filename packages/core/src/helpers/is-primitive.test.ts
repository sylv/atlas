/* eslint-disable unicorn/no-useless-undefined */
import { expect, it } from 'vitest';
import { isPrimitive } from './is-primitive.js';

it('should return true for primitives', () => {
  expect(isPrimitive(null)).toBe(true);
  expect(isPrimitive(undefined)).toBe(true);
  expect(isPrimitive('')).toBe(true);
  expect(isPrimitive(0)).toBe(true);
});

it('should return false for objects', () => {
  expect(isPrimitive({})).toBe(false);
  expect(isPrimitive({ a: 1 })).toBe(false);
  expect(isPrimitive(new Date())).toBe(false);
  expect(isPrimitive(() => 'Hi!')).toBe(false);
});
