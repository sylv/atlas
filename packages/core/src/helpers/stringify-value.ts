import { cleanUserInput } from './clean-user-input.js';

export const SKIP_PROPERTY_KEYS = new Set(['code', 'status', 'statusCode']);
export type StringifiableValues = string | number | boolean | null | undefined;

/**
 * Stringify a value for output in Discord.
 * Also runs the input through cleanUserInput if propertyKey is present.
 * @param propertyKey Used to determine if things like numbers should be left alone.
 * When set, we skip adding commas to numbers for some specific properties like "statusCode".
 * @example
 * stringifyValue(1000.123098123) // 1,000.12
 * stringifyValue(true) // true
 */
// todo: would be cool to convert booleans to "yes" or "no" depending on the locale.
export function stringifyValue(value: StringifiableValues, propertyKey?: string, locale?: string) {
  const skippable = propertyKey && SKIP_PROPERTY_KEYS.has(propertyKey);
  if (typeof value === 'number' && !skippable) {
    const decimalPlaces = value >= 5 ? 2 : 4;
    const rounded = Number(value.toFixed(decimalPlaces));
    return rounded.toLocaleString(locale);
  }

  // an empty string means things like codeblocks wont break.
  if (value === null || value === undefined) return ' ';
  if (propertyKey) return cleanUserInput(value.toString(), propertyKey);
  return value.toString();
}
