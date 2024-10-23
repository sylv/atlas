import { expect, it } from 'vitest';
import { parseNumber } from './number.parser.js';

it('it should parse numbers', () => {
  expect(parseNumber('-10')).toBe(-10);
  expect(parseNumber('1 thousand')).toBe(1000);
  expect(parseNumber('one thousand')).toBe(1000);
  expect(parseNumber('50k')).toBe(50_000);
  expect(parseNumber('21.2k')).toBe(21_200);
  expect(parseNumber('twenty-two thousand')).toBe(22_000);
  expect(parseNumber('tonight at eight pm')).toBe(8);
  expect(parseNumber('22 hours 15 minutes')).toBe(22);
  expect(parseNumber('10,100.20')).toBe(10_100.2);
  expect(parseNumber('10,10')).toBeNull();
  expect(parseNumber('2,000')).toBe(2000);
  expect(parseNumber('\n200\n')).toBe(200);
});

it('should not parse snowflakes as numbers', () => {
  expect(parseNumber('Hello <@111372124383428608>')).toBeNull();
  expect(parseNumber('111372124383428608')).toBeNull();
});
