/**
 * Matches a Discord snowflake anywhere in the string.
 * @group id
 */
export const DISCORD_SNOWFLAKE_REGEX = /\b(?<id>\d{17,19})\b/u;

/**
 * Matches a Discord snowflake if the entire string is a snowflake.
 * @group id
 * @see {@link DISCORD_SNOWFLAKE_REGEX}
 */
export const DISCORD_SNOWFLAKE_REGEX_STRICT = new RegExp(`^${DISCORD_SNOWFLAKE_REGEX.source}$`, 'u');

/**
 * Matches Discord snowflakes with an optional prefix.
 * @group id
 * @group prefix The nullable match prefix.
 * "@" for user mentions
 * "!" for nickname mentions
 * "#" for channel mentions
 * "&" for role mentions
 * ":" for emojis
 */
export const DISCORD_PREFIXED_SNOWFLAKE_REGEX = new RegExp(
  `(?<prefix>[@|!|#|&|:])?${DISCORD_SNOWFLAKE_REGEX.source}`,
  'u',
);
