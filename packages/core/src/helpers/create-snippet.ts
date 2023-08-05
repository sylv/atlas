const DEFAULT_MAX_LEN = 100;

export interface SnippetOptions {
  /**
   * The max length the output can be
   */
  maxLength?: number;
  /**
   * The string to add if the source had to be truncated
   */
  suffix?: string;
  /**
   * Extra information that is added to the input string regardless of whether it was truncated or not.
   * This is factored into the adjusted max length.
   */
  extra?: string;
}

/**
 * Generates a short snippet from some long-form text.
 */
// todo: at this moment this just cuts off text, ideally we would
// cut at sentences and shit.
// todo: dont cut on links, it doesnt like that
export function createSnippet(source: string, options?: SnippetOptions): string {
  source = source.trim();
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LEN;
  const suffix = options?.suffix ?? '…';
  const extra = options?.extra ? ` ${options.extra}` : '';
  if (source.length + extra.length <= maxLength) {
    return source + extra;
  }

  const adjustedMaxLength = maxLength - extra.length - suffix.length;
  const truncated = source.slice(0, adjustedMaxLength).trim();
  const joined = truncated + suffix + extra;
  if (joined.length > maxLength) {
    throw new Error(`Snippet is too long, likely because "options.extra" or "options.suffix" is too long.`);
  }

  return joined;
}
