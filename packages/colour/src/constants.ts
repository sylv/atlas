/**
 * Matches 0xfff, 0xffffff, #fff, #ffffff, ffffff hex strings exactly.
 * @group value The hex value of the colour
 */
export const HEX_REGEX = /^(#|0x)?(?<value>[\da-f]{3}|[\da-f]{6})$/iu;

/**
 * Matches RGB colours exactly.
 * @example rgb(255, 255, 255)
 * @example (255,255,255)
 * @example 255,255,255
 * @group r
 * @group g
 * @group b
 */
export const RGB_REGEX = /^(rgb)?\(?(?<r>\d{1,3}), ?(?<g>\d{1,3}), ?(?<b>\d{1,3})\)?$/iu;
export const MAX_HEX_COLOUR = 0xffffff;
export const MIN_HEX_COLOUR = 0x000000;
