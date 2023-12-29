/* eslint-disable import/no-named-default */
import { NUMBER_REGEX } from '@atlasbot/core';
import nlp from 'compromise';

const CUSTOM_UNITS = new Map([
  ['k', 1000],
  ['m', 1e6],
  ['b', 1e9],
]);

interface JSON {
  text: string;
  number: { prefix: string; num: number; suffix: string; hasComma: boolean; unit: string };
}

// i basically pulled this out of my ass
const MAX_SAFE_NUMBER = 100_000_000_000;
const COMMAN_MATCH_REGEX = /^\d{1,3}(,\d{3})+(\.\d+)?$/; // disallow "10,10", only allow "10,000", "10,000.5" etc

export const parseNumber = (input: string): number | null => {
  if (NUMBER_REGEX.test(input)) {
    // regex is faster than compromise and will match simple values
    const result = Number(input);
    if (result > MAX_SAFE_NUMBER) return null;
    return result;
  }

  const document = nlp(input);
  const values = document.numbers().toNumber().json() as JSON[];
  for (const value of values) {
    // disallow "10,10" which compromise parses to "1010"
    if (value.number.hasComma && !COMMAN_MATCH_REGEX.test(value.text)) {
      continue;
    }

    // map "10k" to "10000" and not "10"
    // there is surely a better way to do this but compromise docs are a... compromise :)
    // and i really don't want to spend any more of my time on this.
    const customUnit = CUSTOM_UNITS.get(value.number.suffix) || CUSTOM_UNITS.get(value.number.unit);
    const realValue = customUnit ? value.number.num * customUnit : value.number.num;
    if (realValue > MAX_SAFE_NUMBER) continue;
    return realValue;
  }

  return null;
};

