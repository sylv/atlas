import { parse } from 'chrono-node';

export interface TimeParseResult {
  /** The relative time from the reference date to the given time. */
  relative: number;
  /** The absolute date of the result. */
  absolute: Date;
  /** The start position for the match in the input */
  index: number;
  /** The entire input string given to the parser, with some minor changes. */
  input: string;
  /** The matched text this date is from. */
  match: string;
}

const TIMESTAMP_REGEX = /\b[0-9]{8,16}\b/u;
const STRIP_AROUND = new Set(['to', 'in', 'until', 'ago', 'at', 'next', 'for']);
const ALIAS_REGEX = /(?<= |^)(\d{1,2}) ?(s|m|h|d|w|mo)(?= |\d+|$)/giu;
const ALIASES = new Map<string, string>([
  ['s', 'second'],
  ['m', 'minute'],
  ['h', 'hour'],
  ['d', 'day'],
  ['w', 'week'],
  ['mo', 'month'],
]);

/**
 * Returns true if the date is essentially invalid
 * Checks for actual invalid dates, dates too close to the
 * timestamp epoch and dates in the far away future.
 */
export const isGarbageDate = (date: Date): boolean => {
  if (!Number.isFinite(date.getFullYear())) return true;
  if (date.getFullYear() <= 1980) return true;
  if (date.getFullYear() >= 2100) return true;
  return false;
};

/**
 * Parse a human time string.
 */
export const parseTime = (input: string, ref = new Date()): TimeParseResult | undefined => {
  input = input.trim();
  const timestampMatch = TIMESTAMP_REGEX.exec(input);
  if (timestampMatch) {
    // try extract absolute timestamps, which can occur for example in
    // discords timestamp markdown format.
    const number = Number(timestampMatch[0]);
    const isSeconds = isGarbageDate(new Date(number));
    const date = new Date(isSeconds ? number * 1000 : number);
    if (!isGarbageDate(date)) {
      return {
        absolute: date,
        relative: date.getTime() - ref.getTime(),
        index: 0,
        input: input,
        match: input,
      };
    }
  }

  // chrono doesnt alias "1m" to "1 minute" so we have to do it ourselves
  // but they do alias >hours so i think their developers just dont like fun
  // or it could be ambiguous with "1m" = "1 million" but we don't care because we're
  // here to parse times not numbers
  let aliasMatch;
  let clean = input;
  while ((aliasMatch = ALIAS_REGEX.exec(clean))) {
    const [value, unit] = aliasMatch.slice(1);
    const name = ALIASES.get(unit.toLowerCase()) ?? unit;
    const matchEndIndex = aliasMatch.index + aliasMatch[0].length;
    const endsWithSpace = clean[matchEndIndex] === ' ';
    const suffix = endsWithSpace ? '' : ' ';
    clean = `${clean.slice(0, Math.max(0, aliasMatch.index))}${value} ${name}${suffix}${clean.slice(
      Math.max(0, matchEndIndex),
    )}`;
  }

  clean = clean.trim();
  const matches = parse(clean, ref, { forwardDate: true });
  const match = matches.shift();
  if (!match) return;
  return {
    absolute: match.date(),
    relative: match.date().getTime() - ref.getTime(),
    index: match.index,
    input: clean,
    match: match.text,
  };
};

/**
 * Parse a human time string to a date.
 */
export const parseAbsoluteDate = (input: string, ref = new Date()): Date | null => {
  const match = parseTime(input, ref);
  return match ? match.absolute : null;
};

/**
 * Parse a human time string to milliseconds.
 */
export const parseRelativeTime = (input: string): number | null => {
  const date = parseTime(input);
  return date ? date.relative : null;
};

/**
 * Parse a human time string to milliseconds, throwing if parsing failed.
 */
export const human = (input: string): number => {
  const relative = parseRelativeTime(input);
  if (relative === null) throw new Error(`Could not parse "${input}" as a duration.`);
  return relative;
};

/**
 * Strips prefixes like "of" from a value.
 * @example "to walk the dog in" -> "walk the dog"
 */
const stripStringPrefixes = (content: string): string => {
  const parts = content.split(/ +/gu);
  const clean: string[] = [];
  for (const part of parts) {
    if (STRIP_AROUND.has(part.toLowerCase())) continue;
    clean.push(part);
  }

  return clean.join(' ').trim();
};

/**
 * Get the input without the given match.
 * @example "to walk the dog in 10 minutes" => "walk the dog"
 */
export const stripTimeFromInput = (result: TimeParseResult): [string, string] => {
  const start = result.index;
  const end = result.index + result.match.length;

  return [
    stripStringPrefixes(result.input.slice(0, Math.max(0, start))),
    stripStringPrefixes(result.input.slice(Math.max(0, end)).trim()),
  ];
};
