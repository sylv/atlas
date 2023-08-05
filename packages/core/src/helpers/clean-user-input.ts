const CLEAN_KEYS = new Set(['term', 'query', 'input', 'searchTerm']);
const BACKTICK_REGEX = /\\?`/gu;

/**
 * Sanitize the value of a placeholder to prevent people pinging roles through the bot.
 * This is not perfect and relies on the key name being something like "query", but
 * it should cover most cases. If they do manage to escape they would still be shut down by
 * allowedMentions being set to just them.
 * @param value The value to clean.
 * @param propertyKey If present, we skip cleaning values unless the property key is in exports.CLEAN_KEYS
 * @example
 * cleanUserInput('`test`', 'content') // '`test`'
 * cleanUserInput('`test`', 'searchTerm') // '\`test\`'
 */
export function cleanUserInput(value: string, propertyKey?: string) {
  if (propertyKey && !CLEAN_KEYS.has(propertyKey)) return value;
  return value.replaceAll(BACKTICK_REGEX, "'");
}
