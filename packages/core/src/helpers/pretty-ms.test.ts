import ms from 'ms';
import { expect, it } from 'vitest';
import { prettyMs } from './pretty-ms.js';

it('should prettify milliseconds', () => {
  expect(prettyMs(0)).toBe('now');
  expect(prettyMs(ms('15ms'))).toBe('a few milliseconds');
  expect(prettyMs(ms('1s'))).toBe('1s');
  expect(prettyMs(ms('1m') + ms('7s'))).toBe('1m 7s');
  expect(prettyMs(ms('41d'))).toBe('41d');
});

it('should prettify milliseconds in a "long" format', () => {
  expect(prettyMs(ms('15ms'), false)).toBe('a few milliseconds');
  expect(prettyMs(ms('1s'), false)).toBe('1 second');
  expect(prettyMs(ms('1m') + ms('7s'), false)).toBe('1 minute 7 seconds');
  expect(prettyMs(ms('41d'), false)).toBe('41 days');
});

it('should "ago" suffixes', () => {
  expect(prettyMs(ms('-1s'), false)).toBe('1 second ago');
  expect(prettyMs(ms('-60s'), false)).toBe('1 minute ago');
});

it('should parse strings', () => {
  expect(prettyMs('1000')).toBe('1s');
  expect(prettyMs('1000', false)).toBe('1 second');
});
