import { execSync } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { join, resolve } from 'path';
import pngquant from 'pngquant-bin';
import sharp from 'sharp';
import { request } from 'undici';
import { type Emoji } from '../src/classes/emoji.js';
import { SHEET_EMOJIS_PER_ROW, SHEET_EMOJI_SIZE } from '../src/constants.js';
import { emojis } from '../src/emojis.js';
import { getSheetPosition } from '../src/functions/get-sheet-position.js';

const cacheDir = join(tmpdir(), 'emojis');
mkdirSync(cacheDir, { recursive: true });

function getEmojiPath(emoji: Emoji) {
  return join(cacheDir, `${emoji.codePoints.join('-')}.svg`);
}

const downloadEmoji = async (emoji: Emoji) => {
  const url = emoji.getUrl('svg');
  const path = getEmojiPath(emoji);
  const exists = existsSync(path);
  if (exists) return;
  console.debug(`Downloading "${url}" to "${path}"`);
  const response = await request(url);
  if (response.statusCode !== 200) {
    throw new Error(`${url} returned ${response.statusCode}`);
  }

  const body = await response.body.arrayBuffer();
  await writeFile(path, Buffer.from(body));
};

const limit = pLimit(50);
async function downloadEmojis() {
  const promises = [];
  for (const emoji of emojis) {
    const promise = limit(() => pRetry(() => downloadEmoji(emoji), { retries: 5 }));
    promises.push(promise);
  }

  await Promise.all(promises);
}

async function main() {
  await downloadEmojis();
  console.log('Downloaded emojis');

  // todo: calculate emoji positions using getSheetPosition() and setSheetPosition()
  // so we can be sure they're always gonna be accurate
  console.log('Generating rows');
  const rowOverlays: sharp.OverlayOptions[][] = [];
  for (const emoji of emojis) {
    if (emoji.index === null) continue;
    const position = getSheetPosition(emoji);
    const emojiPath = getEmojiPath(emoji);
    const rowOverlay = rowOverlays[position.sheetRow];
    const emojiOverlay: sharp.OverlayOptions = {
      top: 0,
      left: position.left,
      input: await sharp(emojiPath).resize(SHEET_EMOJI_SIZE, SHEET_EMOJI_SIZE).webp().toBuffer(),
    };

    if (rowOverlay) rowOverlay.push(emojiOverlay);
    else rowOverlays[position.sheetRow] = [emojiOverlay];
  }

  console.log('Rendering rows');
  const rows = await Promise.all(
    rowOverlays.map(async (composite) =>
      sharp({
        create: {
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          height: SHEET_EMOJI_SIZE,
          width: SHEET_EMOJIS_PER_ROW * SHEET_EMOJI_SIZE,
          channels: 4,
        },
      })
        .composite(composite)
        .webp()
        .toBuffer(),
    ),
  );

  console.log('Generating sheet');
  const sheetPath = '/tmp/emoji-sheet.png';
  await sharp({
    create: {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      height: rows.length * SHEET_EMOJI_SIZE,
      width: SHEET_EMOJIS_PER_ROW * SHEET_EMOJI_SIZE,
      channels: 4,
    },
  })
    .composite(
      rows.map((row, rowIndex) => ({
        input: row,
        top: rowIndex * SHEET_EMOJI_SIZE,
        left: 0,
      })),
    )
    .png({
      progressive: true,
      quality: 80,
      compressionLevel: 9,
      palette: true,
    })
    .toFile(sheetPath);

  const size = statSync(sheetPath).size;
  const kb = (size / 1024).toFixed(2);
  console.log(`Generated emoji sheet (${kb}kb)`);
  console.log('Compressing image');

  const compressedPath = resolve(`data/sheet-${SHEET_EMOJI_SIZE}x${SHEET_EMOJI_SIZE}.png`);
  execSync(`${pngquant} ${sheetPath} --output ${compressedPath} --force --strip --speed 1`, {
    stdio: 'inherit',
  });

  const compressedSize = statSync(compressedPath).size;
  const compressedKb = (compressedSize / 1024).toFixed(2);
  console.log(`Compressed emoji sheet (${compressedKb}kb)`);
}

main().catch(console.error);
