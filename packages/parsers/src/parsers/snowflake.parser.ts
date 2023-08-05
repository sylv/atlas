import {
  DISCORD_EPOCH,
  DISCORD_PREFIXED_SNOWFLAKE_REGEX,
  DISCORD_YOUNGEST_ID_TIMESTAMP,
  DISCORD_SNOWFLAKE_REGEX_STRICT,
} from '@atlasbot/discord-utilities';

export enum SnowflakeTypes {
  USER,
  CHANNEL,
  ROLE,
  EMOJI,
}

export interface ParsedSnowflake {
  id: string;
  timestamp: number;
  startIndex: number;
  endIndex: number;
  type?: SnowflakeTypes;
}

// https://discord.com/developers/docs/reference#message-formatting-formats
export function parseSnowflakeType(prefix?: string): SnowflakeTypes | undefined {
  if (!prefix) return;
  switch (prefix) {
    case '!':
    case '@': {
      return SnowflakeTypes.USER;
    }
    case '#': {
      return SnowflakeTypes.CHANNEL;
    }
    case '&': {
      return SnowflakeTypes.ROLE;
    }
    case ':': {
      return SnowflakeTypes.EMOJI;
    }
  }
}

/**
 * Parse a snowflake and return its parsed representation.
 */
export function parseSnowflake(input: string | bigint): ParsedSnowflake | undefined {
  const match = DISCORD_PREFIXED_SNOWFLAKE_REGEX.exec(input.toString());
  if (!match) return;
  const id = match.groups!.id;
  const timestamp = Number((BigInt(id) >> 22n) + DISCORD_EPOCH);
  const type = parseSnowflakeType(match.groups!.prefix);
  const snowflake: ParsedSnowflake = {
    id: id,
    timestamp: timestamp,
    type: type,
    startIndex: match.index,
    endIndex: match.index + match[0].length,
  };

  // discard snowflakes that are from the future because someone invented
  // time travel but refuses to share with the class.
  if (snowflake.timestamp > Date.now() + 30_000) return;
  // discord snowflakes from before the youngest known id are invalid
  if (snowflake.timestamp < DISCORD_YOUNGEST_ID_TIMESTAMP) return;
  return snowflake;
}

/**
 * Check whether a given value is a snowflake.
 * Unlike "parseSnowflake", this will only return true if the entire input is a snowflake.
 */
export function isSnowflake(input: unknown): input is `${bigint}` {
  if (typeof input !== 'bigint' && typeof input !== 'string') return false;
  return DISCORD_SNOWFLAKE_REGEX_STRICT.test(input.toString());
}
