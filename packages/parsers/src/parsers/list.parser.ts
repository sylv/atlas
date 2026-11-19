const TRIM_REGEX = /^('|"|“|”)|('|"|“|”)$/gu;
function trim(input: string) {
  return input.trim().replaceAll(TRIM_REGEX, "").trim();
}

// ordered by priority
const SPLIT_CHARS = ["|", " OR ", ","];

export function parseList(input: string) {
  for (const splitChar of SPLIT_CHARS) {
    if (input.includes(splitChar)) {
      return input.split(splitChar).map((part) => trim(part));
    }
  }

  return [trim(input)];
}
