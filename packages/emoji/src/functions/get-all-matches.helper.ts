export const getAllMatches = (regex: RegExp, text: string): Set<string> => {
  if (!regex.flags.includes('g')) {
    throw new Error('getAllMatches requires a global regex');
  }

  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    matches.add(match[0]);
  }

  return matches;
};
