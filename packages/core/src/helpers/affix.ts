export interface Affix {
  condition: boolean | undefined;
  prefix?: string;
  suffix?: string;
}

/**
 * Affixes a string to the input based on a condition.
 * @example
 * const user = context.user();
 * const userTag = affix(user.tag, {
 *  condition: user.bot,
 *  prefix: BOT_EMOJI
 * });
 */
export function affix(input: string | number | boolean, affixes: Affix[] | Affix): string {
  const result = [input];
  if (!Array.isArray(affixes)) affixes = [affixes];
  for (const affix of affixes) {
    if (!affix.condition) continue;
    if (affix.prefix) result.unshift(affix.prefix);
    if (affix.suffix) result.push(affix.suffix);
  }

  return result.join(' ');
}
