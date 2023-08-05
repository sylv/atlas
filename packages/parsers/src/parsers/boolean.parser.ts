// numbers such as "0" or "1" have been removed because they are too ambiguous with actual numbers.
const TRUTHY = new Set(['y', 'yes', 'true', 'confirm', 'enable', 'on', 'positive']);
const FALSY = new Set(['n', 'no', 'false', 'deny', 'stop', 'cancel', 'disable', 'off', 'negative']);

/**
 * Parse a string as a boolean with support for things like "yes" and "confirm"
 * @returns undefined if the in put is not a recognised boolean or boolean alias.
 */
export function parseBoolean(input: string | boolean): boolean | undefined {
  if (typeof input === 'boolean') return input;
  const query = input.toLowerCase().trim();
  if (TRUTHY.has(query)) return true;
  if (FALSY.has(query)) return false;
}
