import { it, expect } from 'vitest';
import { parseList } from './list.parser.js';

it('should parse one|two|three', () => {
  expect(parseList('one|two|three')).toEqual(['one', 'two', 'three']);
  expect(parseList('one | two | three')).toEqual(['one', 'two', 'three']);
});

it('should parse one, two, three', () => {
  const result = parseList('one, two, three');
  expect(result).toEqual(['one', 'two', 'three']);
});

it('should strip quotes from "one one", "two", "three"', () => {
  const result = parseList('"one one", "two", "three"');
  expect(result).toEqual(['one one', 'two', 'three']);
});
