export interface DiscordPosition {
  id: string;
  position: number;
}

/**
 * Negative number if the first items position is lower
 * Positive number if the first items position is higher
 * Zero if the first items position is equal
 */
export function compareDiscordPosition(item: DiscordPosition, higherThan: DiscordPosition): number {
  if (item.position === higherThan.position) {
    return Number(BigInt(higherThan.id) - BigInt(item.id));
  }

  return item.position - higherThan.position;
}
