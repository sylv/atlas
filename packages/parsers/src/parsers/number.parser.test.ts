import { expect, test } from 'vitest';
import { parseNumber } from './number.parser.js';

test('it should parse numbers', () => {
  expect(parseNumber('1 thousand')).toBe(1000);
  expect(parseNumber('one thousand')).toBe(1000);
  expect(parseNumber('$50k')).toBe(50_000);
  expect(parseNumber('twenty-two thousand')).toBe(22_000);
  expect(parseNumber('tonight at eight pm')).toBe(8);
  expect(parseNumber('22 hours 15 minutes')).toBe(22);
  expect(parseNumber('10,100.20')).toBe(10_100.2);
  expect(parseNumber('10,10')).toBeNull();
});
