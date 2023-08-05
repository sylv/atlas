import { expect, it } from 'vitest';
import { isPlainObject, isSpecialObject } from './is-object.js';

it('should return true for objects', () => {
  expect(isPlainObject({})).toBe(true);
  expect(isPlainObject({ a: 1 })).toBe(true);
});

it('should return false for rich objects', () => {
  expect(isPlainObject(new Date())).toBe(false);
});

it('should return false for arrays', () => {
  expect(isPlainObject([])).toBe(false);
  expect(isPlainObject([1, 2, 3])).toBe(false);
  expect(isSpecialObject([])).toBe(false);
  expect(isSpecialObject([], true)).toBe(true);
  expect(isPlainObject([], true)).toBe(true);
});

it('should return false for class objects', () => {
  class MyClass {
    a = 1;
  }

  const inst = new MyClass();
  expect(isPlainObject(inst)).toBe(false);
  expect(isSpecialObject(inst)).toBe(true);
});

it('should return false for non-objects', () => {
  expect(isPlainObject(null)).toBe(false);
  expect(isSpecialObject(null)).toBe(false);
  expect((isPlainObject as any)()).toBe(false);
  expect(isPlainObject(0n)).toBe(false);
  expect(isPlainObject(() => 'Hi')).toBe(false);
});
