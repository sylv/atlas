/**
 * Convert a decimal colour to a hexadecimal colour with a leading #
 * @param discord Whether this is formatting a discord colour. If so, pure black is replaced with the "default" role colour.
 */
export function decimalToHex(decimal: number, discord = true, prefix: string | null = '#'): string {
  if (prefix === null) prefix = '';
  if (discord && decimal === 0) return `${prefix}99aab5`;
  return `${prefix}${decimal.toString(16).padStart(6, '0')}`;
}
