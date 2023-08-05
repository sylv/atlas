export function pascalToTitle(key: string) {
  return (
    // Look for long acronyms and filter out the last letter
    key
      .replaceAll(/([A-Z]+)([A-Z][a-z])/gu, ' $1 $2')
      // Look for lower-case letters followed by upper-case letters
      .replaceAll(/([\da-z])([A-Z])/gu, '$1 $2')
      // Look for lower-case letters followed by numbers
      .replaceAll(/([A-Za-z])(\d)/gu, '$1 $2')
      .replace(/^./u, (str) => {
        return str.toUpperCase();
      })
      // Remove any white space left around the word
      .trim()
  );
}
