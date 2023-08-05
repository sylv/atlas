import parseMs from 'parse-ms';

const NUMBER_ALIASES = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
  [6, 'six'],
  [7, 'seven'],
  [8, 'eight'],
  [9, 'nine'],
]);

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

export function prettyMs(ms: number | string, short = true): string {
  if (typeof ms === 'string') ms = Number(ms);
  const parsed = parseMs(ms);
  let output = '';

  // "512 milliseconds ago" is not epic.
  if (ms === 0) return 'now';
  if (ms > 0 && ms < 1000) return 'a few milliseconds';
  if (ms > -1000 && ms < 0) return 'a few milliseconds ago';

  // essentially, you don't care about seconds when you're measuring 212 days.
  // you would care if you were measuring minutes.
  // this excludes things like seconds when you're measuring weeks.
  let minUnit;
  if (Math.abs(ms) > ONE_SECOND) minUnit = 'seconds';
  if (Math.abs(ms) > ONE_HOUR) minUnit = 'minutes';
  if (Math.abs(ms) > ONE_DAY) minUnit = 'hours';
  if (Math.abs(ms) > ONE_WEEK) minUnit = 'days';

  parsed.microseconds = 0;
  parsed.milliseconds = 0;
  const parts = Object.entries<number | string>(parsed as any).filter((p) => p[1] !== 0);
  for (let [name, value] of parts) {
    if (value === 0) continue;
    const valueName = Math.abs(value as number).toLocaleString();
    if (short) {
      const shortName = name === 'milliseconds' ? 'ms' : name[0];
      output += `${valueName}${shortName} `;
    } else {
      if (name.endsWith('s') && valueName === '1') name = name.slice(0, Math.max(0, name.length - 1));
      const alias = !parts[1] && NUMBER_ALIASES.get(Number(value));
      // todo: what the fuck is this even doing
      if (alias) value = alias;
      output += `${valueName} ${name} `;
    }

    if (name === minUnit) break;
  }

  if (ms < 0) return `${output.trim()} ago`;
  return output.trim();
}
