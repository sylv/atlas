import { parse, type ParsedComponents } from 'chrono-node';

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
const DECADE_REGEX = /(\d+(?:\.\d+)?)\s*decades?\b/giu;
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

const MUST_INCLUDE_WORDS = [
  'sec',
  'min',
  'hour',
  'day',
  'week',
  'month',
  'year',
  'decade',
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
  'pm',
  'am',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
  'tomorrow',
  'yesterday',
  'today',
  'now',
  'ago',
  'next',
  'last',
  'until',
  'to',
  'in',
];

const MUST_INCLUDE_PATTERN = new RegExp(`[0-9]|(${MUST_INCLUDE_WORDS.join('|')})`, 'iu');
const TRAILING_IANA_TIMEZONE = /(?:^|\s)([A-Za-z]+\/[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)*)$/u;

interface IanaTimezoneContext {
  timezone: string;
  offsetAtReference: number;
}

const getIanaTimezoneOffsetMinutes = (timeZone: string, at: Date): number | null => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formatter.formatToParts(at);
    const partMap: Record<string, string> = {};
    for (const part of parts) {
      if (part.type === 'literal') continue;
      partMap[part.type] = part.value;
    }

    const utcTime = Date.UTC(
      Number.parseInt(partMap.year, 10),
      Number.parseInt(partMap.month, 10) - 1,
      Number.parseInt(partMap.day, 10),
      Number.parseInt(partMap.hour, 10),
      Number.parseInt(partMap.minute, 10),
      Number.parseInt(partMap.second, 10),
    );

    return Math.round((utcTime - at.getTime()) / 60000);
  } catch {
    return null;
  }
};

const stripTrailingIanaTimezone = (input: string): { clean: string; timezone: string } | null => {
  const match = TRAILING_IANA_TIMEZONE.exec(input);
  if (!match) return null;
  const clean = input.slice(0, Math.max(0, match.index)).trim();
  return { clean, timezone: match[1] };
};

const buildDateWithIanaTimezone = (
  components: ParsedComponents,
  context: IanaTimezoneContext,
): Date | null => {
  const year = components.get('year');
  const month = components.get('month');
  const day = components.get('day');
  if (year == null || month == null || day == null) return null;

  const hour = components.get('hour') ?? 0;
  const minute = components.get('minute') ?? 0;
  const second = components.get('second') ?? 0;
  const millisecond = components.get('millisecond') ?? 0;

  let offset = context.offsetAtReference;
  const buildDate = (offsetMinutes: number): Date =>
    new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - offsetMinutes * 60000);

  let candidate = buildDate(offset);
  for (let i = 0; i < 5; i++) {
    const computedOffset = getIanaTimezoneOffsetMinutes(context.timezone, candidate);
    if (computedOffset == null || computedOffset === offset) {
      if (computedOffset != null) {
        offset = computedOffset;
        candidate = buildDate(offset);
      }
      break;
    }

    offset = computedOffset;
    candidate = buildDate(offset);
  }

  return candidate;
};

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

  // "1 decade" -> "10 years"
  clean = clean.replace(DECADE_REGEX, (match, value) => {
    const years = parseFloat(value) * 10;
    return `${years} years`;
  });

  clean = clean.trim();
  let timezoneContext: IanaTimezoneContext | undefined;
  const timezoneMatch = stripTrailingIanaTimezone(clean);
  if (timezoneMatch) {
    const offsetAtReference = getIanaTimezoneOffsetMinutes(timezoneMatch.timezone, ref);
    if (offsetAtReference != null) {
      clean = timezoneMatch.clean;
      timezoneContext = {
        timezone: timezoneMatch.timezone,
        offsetAtReference,
      };
    }
  }

  const reference = timezoneContext ? { instant: ref, timezone: timezoneContext.offsetAtReference } : ref;
  const matches = parse(clean, reference, { forwardDate: true });
  const match = matches.find((match) => MUST_INCLUDE_PATTERN.test(match.text));
  if (!match) return;

  let absoluteDate = match.date();
  if (timezoneContext) {
    const rebuilt = buildDateWithIanaTimezone(match.start, timezoneContext);
    if (rebuilt) {
      absoluteDate = rebuilt;
    }
  }
  return {
    absolute: absoluteDate,
    relative: absoluteDate.getTime() - ref.getTime(),
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

export const toMsOrThrow = (input: string): number => {
  const result = parseRelativeTime(input);
  if (result === null) throw new Error(`Failed to parse time string "${input}"`);
  return result;
};

export const toSecsOrThrow = (input: string): number => {
  const result = parseRelativeTime(input);
  if (result === null) throw new Error(`Failed to parse time string "${input}"`);
  return result * 1000;
};

/**
 * Parse a time string. The input should be constant and not user-provided.
 * @note If you are using a runtime with macro support (like bun), you should import this as a macro.
 * @example
 * class MyClass {
 *   private static readonly TIMEOUT_MS = ms`10 minutes`;
 * }
 */
export const ms = (strings: TemplateStringsArray): number => {
  const [string] = strings;
  const result = parseRelativeTime(string);
  if (result === null) throw new Error(`Failed to parse time string "${string}"`);
  return result;
};

/**
 * Parse a time string. The input should be constant and not user-provided.
 * @note If you are using a runtime with macro support (like bun), you should import this as a macro.
 * @example
 * class MyClass {
 *   private static readonly TIMEOUT_SECS = secs`10 minutes`;
 * }
 */
export const secs = (strings: TemplateStringsArray): number => {
  const [string] = strings;
  const result = parseRelativeTime(string);
  if (result === null) throw new Error(`Failed to parse time string "${string}"`);
  return result * 1000;
};
