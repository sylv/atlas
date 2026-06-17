import { execSync } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { type Emoji } from '../src/classes/emoji.js';
import { SHEET_EMOJIS_PER_ROW, SHEET_EMOJI_SIZE } from '../src/constants.js';
import { emojis } from '../src/emojis.js';
import { getSheetPosition } from '../src/functions/get-sheet-position.js';
import { toCodePointsWithoutVS16s } from '../src/functions/helpers.js';
import { tmpdir } from 'os';

const TWEMOJI_REPO = 'https://github.com/jdecked/twemoji.git';
const cloneDir = join(tmpdir(), 'twemoji');

const RAW_EMOJI_OPTIONS = {
  width: SHEET_EMOJI_SIZE,
  height: SHEET_EMOJI_SIZE,
  channels: 4 as const,
};

const RAW_ROW_OPTIONS = {
  width: SHEET_EMOJIS_PER_ROW * SHEET_EMOJI_SIZE,
  height: SHEET_EMOJI_SIZE,
  channels: 4 as const,
};

function getEmojiPath(emoji: Emoji) {
  return join(cloneDir, 'assets', 'svg', `${toCodePointsWithoutVS16s(emoji.id).join('-')}.svg`);
}

function cloneTwemoji() {
  if (existsSync(join(cloneDir, 'assets', 'svg'))) {
    console.log('twemoji already cloned, skipping');
    return;
  }

  console.log('Cloning jdecked/twemoji (shallow)...');
  mkdirSync(cloneDir, { recursive: true });
  execSync(`git clone --depth 1 --filter=blob:none --sparse ${TWEMOJI_REPO} ${cloneDir}`, {
    stdio: 'inherit',
  });
  execSync('git sparse-checkout set assets/svg', { cwd: cloneDir, stdio: 'inherit' });
  console.log('Cloned twemoji');
}

async function main() {
  cloneTwemoji();

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
      input: await sharp(emojiPath)
        .resize(SHEET_EMOJI_SIZE, SHEET_EMOJI_SIZE)
        .ensureAlpha()
        .raw()
        .toBuffer(),
      raw: RAW_EMOJI_OPTIONS,
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
        .raw()
        .toBuffer(),
    ),
  );

  console.log('Generating sheet');
  // const sheetPath = resolve(`data/sheet-${SHEET_EMOJI_SIZE}x${SHEET_EMOJI_SIZE}.png`);
  const sheetPath = resolve(`data/sheet-${SHEET_EMOJI_SIZE}x${SHEET_EMOJI_SIZE}.png`);
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
        raw: RAW_ROW_OPTIONS,
        top: rowIndex * SHEET_EMOJI_SIZE,
        left: 0,
      })),
    )
    .png({
      effort: 10, // this is the only flag that seems to matter with oxipng
      // palette, quality, compressionLevel, progressive and adaptiveFiltering were
      // all tried, but had no effect on the output size with oxipng, so we just omit them.
    })
    .toFile(sheetPath);

  // with the best settings above, this saves 25-75kb. with the worst it can save up to 2.5mb
  execSync(`npx oxipng -o max --strip all --alpha ${sheetPath}`, { stdio: 'inherit' });

  const size = statSync(sheetPath).size;
  const kb = (size / 1024).toFixed(2);
  console.log(`Generated emoji sheet ${sheetPath} (${kb}kb)`);
}

main().catch(console.error);