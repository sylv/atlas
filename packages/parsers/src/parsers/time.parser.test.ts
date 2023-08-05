import ms from 'ms';
import { beforeAll, expect, it } from 'vitest';
import { parseAbsoluteDate, parseRelativeTime } from './time.parser.js';

beforeAll(() => {
  process.env.TZ = 'Europe/Amsterdam';
});

it('should parse relative durations', () => {
  expect(parseRelativeTime('1s')).toBe(ms('1s'));
  expect(parseRelativeTime('1m')).toBe(ms('1m'));
  expect(parseRelativeTime('1 minutes')).toBe(ms('1m'));
  expect(parseRelativeTime('1 minutes')).toBe(ms('1m'));
  expect(parseRelativeTime('22.5 hours')).toBe(ms('22.5h'));
  expect(parseRelativeTime('22 hours 30 minutes')).toBe(ms('22h') + ms('30m'));
  expect(parseRelativeTime('1h2m')).toBe(ms('1h') + ms('2m'));
  expect(parseRelativeTime('1h 2m')).toBe(ms('1h') + ms('2m'));
});

it('should not parse misleading values', () => {
  expect(parseRelativeTime('2 million')).toBeNull();
  expect(
    parseRelativeTime('https://discord.com/channels/340583394192916492/532902669220839426/844534522976272384'),
  ).toBeNull();
  expect(
    parseRelativeTime(
      'https://discord.com/channels/340583394192916492/781067259765850145/781156375349690418 in 2 hours',
    ),
  ).toBe(7.2e6);
});

it('should parse absolute dates', () => {
  // todo: this breaks because of timezones, which is why it only tests the full year here.
  expect(parseAbsoluteDate('21/08/2002')?.getFullYear()).toBe(2002);
  expect(parseAbsoluteDate('2021-06-08T04:59:24.491Z')).toStrictEqual(new Date('2021-06-08T04:59:24.491Z'));
});

it('should parse unix timestamps in seconds and milliseconds', () => {
  // milliseconds
  expect(parseAbsoluteDate('1623125364465')).toStrictEqual(new Date(1623125364465));

  // seconds
  expect(parseAbsoluteDate('1623125364')).toStrictEqual(new Date(1623125364 * 1000));
  expect(parseAbsoluteDate('1623125364\n')).toStrictEqual(new Date(1623125364 * 1000));
  expect(parseAbsoluteDate('unrelated xd 1623125364\ntest')).toStrictEqual(new Date(1623125364 * 1000));
  expect(parseAbsoluteDate('unrelated xd 1623125364')).toStrictEqual(new Date(1623125364 * 1000));
  expect(parseAbsoluteDate('1623125364 test')).toStrictEqual(new Date(1623125364 * 1000));
  expect(parseAbsoluteDate('at <t:1623125364:R> :)')).toStrictEqual(new Date(1623125364 * 1000));

  // neither, this is garbage input and should be discarded.
  expect(parseAbsoluteDate('-12309812322')).toBeNull();
  expect(parseAbsoluteDate('22')).toBeNull();
  expect(parseAbsoluteDate('12390812312')).toBeNull(); // in the past
  expect(parseAbsoluteDate('19191191723333')).toBeNull(); // in the future

  // valid timestamps, but with garbage surrounding it that could mean its a bad match
  expect(parseAbsoluteDate('1623125364a')).toBeNull();
  expect(parseAbsoluteDate('a1623125364')).toBeNull();
});

it('should still parse with chrono when invalid timestamps are extracted', () => {
  // in the past we would extract a timestamp, and if it was invalid we return early.
  // this makes sure instead of that, we just ignore it and try parse the string as a regular date.
  expect(parseRelativeTime('1623125364a 1s')).toBe(ms('1s')); // valid timestamp with garbage after it
  expect(parseRelativeTime('19191191723333 1s')).toBe(ms('1s')); // in the future
});
