import { expect, it } from 'vitest';
import { createSnippet } from './create-snippet.js';

const TEST_STRING = 'This is a test string';
const TEST_STRING_LEN = TEST_STRING.length;

it('should limit the maximum lengths of strings', () => {
  expect(createSnippet(TEST_STRING, { maxLength: TEST_STRING_LEN })).toBe(TEST_STRING);
  expect(createSnippet(TEST_STRING, { maxLength: TEST_STRING_LEN * 2 })).toBe(TEST_STRING);
  expect(createSnippet(TEST_STRING, { maxLength: TEST_STRING_LEN - 1 }).length).toBeLessThanOrEqual(TEST_STRING_LEN);
});

it('should account for extra content on the end', () => {
  expect(createSnippet(TEST_STRING, { maxLength: TEST_STRING_LEN, extra: 'test' }).length).toBeLessThanOrEqual(
    TEST_STRING_LEN,
  );
});

it('should trim if it cuts after a space', () => {
  expect(
    createSnippet('a b', {
      maxLength: 2,
    }),
  ).toBe('a…');
});

it('should trim the source string', () => {
  expect(createSnippet('a ')).toBe('a');
});
