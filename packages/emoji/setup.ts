import { expect } from 'vitest';
import { Emoji } from './src/index.js';

expect.addSnapshotSerializer({
  test: (value) => value instanceof Emoji,
  print: (value) => {
    if (!(value instanceof Emoji)) throw new Error(`Expected Emoji`);
    if (value.custom) {
      return JSON.stringify({
        id: value.id,
        name: value.name,
        animated: value.animated,
        custom: true,
      });
    }

    return JSON.stringify({
      id: value.id,
      name: value.name,
      codePoints: value.codePoints,
      hasSkinTone: value.hasSkinTone,
      category: value.category?.name,
    });
  },
});
