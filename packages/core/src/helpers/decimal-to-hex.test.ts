import { expect, it } from 'vitest';
import { decimalToHex } from './decimal-to-hex.js';

it('should not default a null prefix', () => {
  expect(decimalToHex(0xffffff, true, null)).toBe('ffffff');
  expect(decimalToHex(0x000000, false, null)).toBe('000000');
  expect(decimalToHex(0x343b29, true, null)).toBe('343b29');
  expect(decimalToHex(0x99aab5, true, null)).toBe('99aab5');
  expect(decimalToHex(0xed760e, false, null)).toBe('ed760e');
  expect(decimalToHex(0x26252d, false, null)).toBe('26252d');
});
