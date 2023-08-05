import { afterEach, expect, it, vi } from 'vitest';
import { parseSchedule } from './schedule.parser.js';

afterEach(() => {
  vi.useRealTimers();
});

const realDate = new Date();
it('should ensure dates are in the future', () => {
  // this test is placed before "testRef" because we are augmenting system time in it,
  // which could cause tests to fail if we used testRef.
  for (let i = 0; i < 24; i++) {
    const fauxDate = new Date(realDate.getFullYear(), realDate.getMonth(), realDate.getDate(), i, 0, 0, 0);
    vi.useFakeTimers().setSystemTime(fauxDate);
    const result = parseSchedule('every 1 minute', fauxDate);
    const expected = new Date(fauxDate.getTime() + 1 * 60 * 1000);
    expect(result).toEqual(expected);
    vi.useRealTimers();
  }
});

const testRef = new Date();
const isPast4pm = testRef.getHours() >= 16;
const tests = [
  {
    // the next 4pm
    input: 'every day at 4pm',
    date: isPast4pm
      ? new Date(testRef.getFullYear(), testRef.getMonth(), testRef.getDate() + 1, 16, 0, 0, 0)
      : new Date(testRef.getFullYear(), testRef.getMonth(), testRef.getDate(), 16, 0, 0, 0),
  },
  {
    input: 'every 5 minutes',
    date: new Date(testRef.getTime() + 5 * 60 * 1000),
  },
  {
    input: 'every 1 minute',
    date: new Date(testRef.getTime() + 1 * 60 * 1000),
  },
  {
    // we "punish" the user for doing <1m
    input: 'every 30 seconds',
    date: new Date(testRef.getTime() + 2 * 60 * 1000),
  },
  {
    input: 'every 1 hour',
    date: new Date(testRef.getTime() + 1 * 60 * 60 * 1000),
  },
  {
    input: 'every 1 day',
    date: new Date(testRef.getTime() + 1 * 24 * 60 * 60 * 1000),
  },
];

for (const test of tests) {
  it(`should parse "${test.input}"`, () => {
    const result = parseSchedule(test.input, testRef);
    expect(result).toEqual(test.date);
  });
}

it('should not punish cron schedules that might be under 1m in the future but really run every 1m', async () => {
  const result = parseSchedule('*/1 * * * *', testRef);
  expect(result!.getMinutes()).toEqual(testRef.getMinutes() + 1);
  expect(result!.getSeconds()).toEqual(0);
});
