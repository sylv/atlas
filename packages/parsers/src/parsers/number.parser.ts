/* eslint-disable import/no-named-default */
import { NUMBER_REGEX } from '@atlasbot/core';

const UNITS = new Map([
  ['hundred', 100],
  ['thousand', 1000],
  ['k', 1000],
  ['milion', 1e6],
  ['m', 1e6],
  ['billion', 1e9],
  ['b', 1e9],
]);

const NUMBERS = new Map([
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['eleven', 11],
  ['twelve', 12],
  ['thirteen', 13],
  ['fourteen', 14],
  ['fifteen', 15],
  ['sixteen', 16],
  ['seventeen', 17],
  ['eighteen', 18],
  ['nineteen', 19],
  ['twenty', 20],
  ['thirty', 30],
  ['forty', 40],
  ['fifty', 50],
  ['sixty', 60],
  ['seventy', 70],
  ['eighty', 80],
  ['ninety', 90],
]);

// this is basically random
const MAX_SAFE_NUMBER = 100_000_000_000;
const SHORT_UNITS = [...UNITS.keys()].filter((u) => u.length <= 2);
const UNIT_WITH_NUMBER_REGEX = new RegExp(`\\b(?<number>[0-9\\.\\,]+)(?<unit>${SHORT_UNITS.join('|')})\\b`);
const SPLIT_REGEX = /[ -]+/;

const LAX_NUMBER_REGEX = /^[\d,.]+$/;
const LAX_NUMBER_REPLACE_REGEX = /,/g;

/**
 * Parse a number. If the result is over MAX_SAFE_NUMBER, return null.
 * @param onlyNumber Whether the input must be exclusively a number. "10 hours" will return null if true, because "hours" is not part of a number.
 */
export const parseNumber = (input: string, onlyNumber?: boolean): number | null => {
  if (LAX_NUMBER_REGEX.test(input)) {
    // regex is fast
    const result = Number(input.replaceAll(LAX_NUMBER_REPLACE_REGEX, ''));
    if (result > MAX_SAFE_NUMBER) return null;
    return result;
  }

  const parts = input.toLowerCase().split(SPLIT_REGEX);
  let result: number | null = null;
  for (const part of parts) {
    const named = NUMBERS.get(part);
    if (named) {
      result = result === null ? named : result + named;
      continue;
    }

    const isNumber = NUMBER_REGEX.test(part);
    if (isNumber) {
      const num = Number(part.replaceAll(LAX_NUMBER_REPLACE_REGEX, ''));
      result = result === null ? num : result + num;
      continue;
    }

    if (result !== null) {
      const unit = UNITS.get(part);
      if (unit) {
        result = result === null ? unit : result * unit;
        continue;
      }
    }

    const unitWithNumber = UNIT_WITH_NUMBER_REGEX.exec(part);
    if (unitWithNumber) {
      const { number, unit } = unitWithNumber.groups!;
      const unitValue = UNITS.get(unit);
      if (unitValue) {
        const num = Number(number);
        result = result === null ? num * unitValue : result + num * unitValue;
        continue;
      }
    }

    if (onlyNumber) return null;
    if (result !== null) break;
  }

  if (result === null) return null;
  if (result > MAX_SAFE_NUMBER) return null;
  return result;
};
