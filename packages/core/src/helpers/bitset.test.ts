import { expect, it } from 'vitest';
import { clearBit, setBit, testBit, testPermission } from './bitset.js';

const ManageMessages = 0x0000000000002000n;
const Administrator = 0x0000000000000008n;
const SendMessages = 0x0000000000000800n;

it('should properly check bits', () => {
  const none = 0n;
  expect(testBit(none, ManageMessages)).toBe(false);
  expect(testBit(none, Administrator)).toBe(false);
  const manageMessages = SendMessages | ManageMessages;
  expect(testBit(manageMessages, SendMessages)).toBe(true);
  expect(testBit(manageMessages, ManageMessages)).toBe(true);
  expect(testBit(manageMessages, Administrator)).toBe(false);
});

it('should properly set bits', () => {
  let base = 0n;
  expect(testBit(base, ManageMessages)).toBe(false);
  base = setBit(base, ManageMessages);
  expect(testBit(base, ManageMessages)).toBe(true);
});

it('should properly clear bits', () => {
  let base = ManageMessages;
  expect(testBit(base, ManageMessages)).toBe(true);
  base = clearBit(base, ManageMessages);
  expect(testBit(base, ManageMessages)).toBe(false);
});

it('should support number strings', () => {
  const base = String(ManageMessages);
  expect(testBit(base, ManageMessages)).toBe(true);
  expect(testBit(base, Administrator)).toBe(false);
});

it('should support numbers', () => {
  const base = Number(ManageMessages);
  expect(testBit(base, ManageMessages)).toBe(true);
  expect(testBit(base, Administrator)).toBe(false);
});

it('should throw on invalid permissions', () => {
  expect(() => testBit(ManageMessages, 'invalid')).toThrow();
  expect(() => testBit('invalid', ManageMessages)).toThrow();
  expect(() => testBit('invalid', 'invalid')).toThrow();
});

it('should return the same type as the first parameter', () => {
  expect(typeof setBit('0', ManageMessages)).toBe('string');
  expect(typeof setBit(0, ManageMessages)).toBe('number');
  expect(typeof setBit(0n, ManageMessages)).toBe('bigint');
});

it('should support administrator checks with testPermission', () => {
  // sanity checks
  expect(testPermission(0, Administrator)).toBe(false);
  expect(testPermission(0, ManageMessages)).toBe(false);

  // both of these are true since administrator grants all other permissions
  expect(testPermission(Administrator, Administrator)).toBe(true);
  // this will only be true if we're short circuiting administrator checks
  expect(testPermission(Administrator, ManageMessages)).toBe(true);
});
