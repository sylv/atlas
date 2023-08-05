import { expect, it } from 'vitest';
import { camelCaseToOptionName } from './camel-case-to-option-name.js';

it('should convert camelCase to snake_case', () => {
  expect(camelCaseToOptionName('oneTwo')).toBe('one_two');
  expect(camelCaseToOptionName('oneTwoThree')).toBe('one_two_three');
  expect(camelCaseToOptionName('urlOrID')).toBe('url_or_id');
});

it('should preserve capitalised portions', () => {
  expect(camelCaseToOptionName('toTTL')).toBe('to_ttl');
});

it('should strip spaces', () => {
  expect(camelCaseToOptionName('one two')).toBe('one_two');
  expect(camelCaseToOptionName('one   two')).toBe('one_two');
});

it('should strip numbers', () => {
  expect(camelCaseToOptionName('test1')).toBe('test');
});

it('should not throw if the name is too long', () => {
  // we use this in places other then just option names for discord,
  // eg the pella engine to convert camelCase option names to
  // snake_case for the validation engine. this ensures that no
  // one in the future changes it and potentially breaks those features.
  const value = 'a'.repeat(33);
  expect(() => camelCaseToOptionName(value)).not.toThrow();
});

it('should strip input prefixes', () => {
  expect(camelCaseToOptionName('inputOneTwo')).toBe('one_two');
  expect(camelCaseToOptionName('inputOneTwoThree')).toBe('one_two_three');
  expect(camelCaseToOptionName('input')).toBe('input');
});
