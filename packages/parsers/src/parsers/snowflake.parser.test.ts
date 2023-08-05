import { expect, it, test } from 'vitest';
import { isSnowflake, parseSnowflake, SnowflakeTypes } from './snowflake.parser.js';

test('it should parse snowflakes', () => {
  expect(parseSnowflake('789561463634395186')).toEqual(
    expect.objectContaining({
      id: '789561463634395186',
      timestamp: 1608316522273,
      type: undefined,
    }),
  );
});

it('should fail to parse snowflakes younger than the youngest known snowflake', () => {
  expect(parseSnowflake('21154535154122751')).toBeUndefined();
  expect(parseSnowflake('21154535154122752')).toBeDefined();
});

it('should parse snowflakes in emojis', () => {
  expect(parseSnowflake('<a:fortnitedefaultdance:538224338269372438>')).toEqual(
    expect.objectContaining({
      id: '538224338269372438',
      timestamp: 1548393081968,
      type: SnowflakeTypes.EMOJI,
    }),
  );
});

it('should parse snowflakes in mentions', () => {
  expect(parseSnowflake('<@&340583973434687488>')).toEqual(
    expect.objectContaining({
      id: '340583973434687488',
      timestamp: 1501271947011,
      type: SnowflakeTypes.ROLE,
    }),
  );
});

it('should treat nicknamed and non-nicknamed mentions the same', () => {
  expect(parseSnowflake('<@111372124383428608>')).toEqual(
    expect.objectContaining({
      id: '111372124383428608',
      timestamp: 1446623583647,
      type: SnowflakeTypes.USER,
    }),
  );

  // ! = nicknamed user ping, it means nothing to us.
  expect(parseSnowflake('<@!111372124383428608>')).toEqual(
    expect.objectContaining({
      id: '111372124383428608',
      timestamp: 1446623583647,
      type: SnowflakeTypes.USER,
    }),
  );
});

test('it should NOT prefer snowflakes at the end of links', () => {
  expect(
    parseSnowflake('https://discord.com/channels/340583394192916492/532902669220839426/789561463634395186'),
  ).toEqual(
    expect.objectContaining({
      id: '340583394192916492',
      type: undefined,
    }),
  );
});

it('should support bigints', () => {
  expect(parseSnowflake(111372124383428608n)).toBeDefined();
});

it('should determine whether an input is a snowflake', () => {
  expect(isSnowflake('340583394192916492')).toBe(true);
  expect(isSnowflake('123')).toBe(false);
  expect(isSnowflake('340583394192916492n')).toBe(false);
  expect(isSnowflake(' 340583394192916492 ')).toBe(false);
});
