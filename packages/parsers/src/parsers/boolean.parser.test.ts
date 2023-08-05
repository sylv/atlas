import { it, expect } from 'vitest';
import { parseBoolean } from './boolean.parser.js';

it('parsing "true"-like values', () => {
  expect(parseBoolean('true')).toBe(true);
  expect(parseBoolean('yes')).toBe(true);
  expect(parseBoolean('YES')).toBe(true);
  expect(parseBoolean('YeS')).toBe(true);
});

it('parsing "false"-like values', () => {
  expect(parseBoolean('false')).toBe(false);
  expect(parseBoolean('FALSE')).toBe(false);
  expect(parseBoolean('no')).toBe(false);
});

it('should reject parsing ambiguous or invalid values', () => {
  expect(parseBoolean('0')).toBeUndefined();
  expect(parseBoolean('1.0')).toBeUndefined();
  expect(parseBoolean('balls')).toBeUndefined();
  expect(parseBoolean('')).toBeUndefined();
});
