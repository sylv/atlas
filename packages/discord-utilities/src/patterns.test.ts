import { describe, expect, it } from 'vitest';
import { DISCORD_SNOWFLAKE_REGEX, DISCORD_SNOWFLAKE_REGEX_STRICT } from './patterns.js';

describe('patterns/DISCORD_SNOWFLAKE_REGEX', () => {
  it('should match valid snowflakes', () => {
    expect(DISCORD_SNOWFLAKE_REGEX.test('341680387979870219')).toBe(true);
    expect(DISCORD_SNOWFLAKE_REGEX.test('753697457229267044')).toBe(true);
    expect(DISCORD_SNOWFLAKE_REGEX.test('111372124383428608')).toBe(true);
    expect(DISCORD_SNOWFLAKE_REGEX.test('3416803879798702199')).toBe(true); // 19 chars, 2040
    expect(DISCORD_SNOWFLAKE_REGEX.test('some text 111372124383428608 lol')).toBe(true);
  });

  it('should match invalid snowflakes', () => {
    // https://www.reddit.com/r/discordapp/comments/a5wtl4/lowest_id_on_discord/
    // max length is 19 chars for the foreseeable future, min is 17
    expect(DISCORD_SNOWFLAKE_REGEX.test('3416803879798702')).toBe(false); // 16 chars, 2015
    expect(DISCORD_SNOWFLAKE_REGEX.test('34168038797987021999')).toBe(false); // 20 chars, 2273
    expect(DISCORD_SNOWFLAKE_REGEX.test('1')).toBe(false);
    expect(DISCORD_SNOWFLAKE_REGEX.test('')).toBe(false);
    expect(DISCORD_SNOWFLAKE_REGEX.test('123098123098123091823091823098123')).toBe(false);
    expect(DISCORD_SNOWFLAKE_REGEX.test('aaa')).toBe(false);

    // this is valid but the "a" shouldn't match because of the boundary breaks
    // this is intentional or else 123098123098123091823091823098123 would match because
    // the start of it would be a valid snowflake.
    expect(DISCORD_SNOWFLAKE_REGEX.test('341680387979870219a')).toBe(false);
    expect(DISCORD_SNOWFLAKE_REGEX.test('text341680387979870219')).toBe(false);
  });
});

describe('patterns/DISCORD_SNOWFLAKE_REGEX_STRICT', () => {
  it('should match snowflakes that are standalone', () => {
    expect(DISCORD_SNOWFLAKE_REGEX_STRICT.test('111372124383428608')).toBe(true);
  });

  it('should not match snowflakes with additional text', () => {
    expect(DISCORD_SNOWFLAKE_REGEX_STRICT.test('some text 111372124383428608 lol')).toBe(false);
  });
});
