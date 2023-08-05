import { type Emoji } from '../classes/emoji.js';
import { SHEET_EMOJI_SIZE, SHEET_EMOJIS_PER_ROW } from '../constants.js';

export interface SheetPosition {
  top: number;
  left: number;
  row: number;
  column: number;
}

export const getSheetPosition = (emoji: Emoji) => {
  if (emoji.index === null) throw new Error('Emoji is not present in the sheet.');
  const sheetRow = Math.floor(emoji.index / SHEET_EMOJIS_PER_ROW);
  const sheetColumn = emoji.index % SHEET_EMOJIS_PER_ROW;
  return {
    top: sheetRow * SHEET_EMOJI_SIZE,
    left: sheetColumn * SHEET_EMOJI_SIZE,
    sheetRow,
    sheetColumn,
  };
};
