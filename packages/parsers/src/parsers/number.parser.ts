/* eslint-disable import/no-named-default */
import { NUMBER_REGEX } from '@atlasbot/core';
import nlp from 'compromise';

export const parseNumber = (input: string): number | null => {
  // regex is faster than compromise and will match simple values
  if (NUMBER_REGEX.test(input)) return Number(input);
  const document = nlp(input);
  const value = document.numbers().get(0);
  if (Array.isArray(value)) return value[0];
  return value;
};
