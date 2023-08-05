import { expect, it } from 'vitest';
import { parseColour } from './parse-colour.js';

it('should parse colours by name', () => {
  expect(parseColour('red')).toBeDefined();
  expect(parseColour('RED')).toBeDefined();
  expect(parseColour(' RED ')).toBeDefined();
  expect(parseColour('green')).toBeDefined();
});

it('should parse colours by their hex value', () => {
  expect(parseColour('#ff0000')).toBeDefined();
  expect(parseColour('#00ff00')).toBeDefined();
  expect(parseColour('#0000ff')).toBeDefined();
  expect(parseColour('0000ff')).toBeDefined();
  expect(parseColour('0x0000ff')).toBeDefined();
});

it('should handle number inputs', () => {
  const parsedString = parseColour((0xffffff).toString());
  expect(parsedString).toBeDefined();
  expect(parsedString!.value).toBe(0xffffff);
  const parsedNumber = parseColour(0xffffff);
  expect(parsedNumber).toBeDefined();
  expect(parsedNumber!.value).toBe(0xffffff);
});

it('should parse colours by their rgb value', () => {
  expect(parseColour('rgb(255, 0, 0)')).toBeDefined();
  expect(parseColour('(0, 255, 0)')).toBeDefined();
  expect(parseColour('0, 0, 255')).toBeDefined();
  const parsed = parseColour('rgb(65, 131, 196)');
  expect(parsed).toBeDefined();
  expect(parsed!.value).toBe(0x4183c4);
});

it('should populate "match" when the input is a known colour', () => {
  const colour = parseColour('red');
  expect(colour!.match).toBeDefined();
});

it('should trim inputs', () => {
  const colour = parseColour('orange\n');
  expect(colour!.match).toBeDefined();
});
