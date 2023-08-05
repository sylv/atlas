import cron from 'cron-parser';
import { human, parseAbsoluteDate } from './time.parser.js';

function parseTextSchedule(input: string, ref: Date): Date | undefined {
  const result = parseAbsoluteDate(input, ref);
  if (!result) return;
  if (result.getTime() < Date.now()) {
    if (!input.toLowerCase().includes('tomorrow')) {
      // fixes "every day at 4pm" which would have parsed to
      // today at 4pm even if its in the past.
      // god is dead and we have killed him.
      return parseTextSchedule(`${input} tomorrow`, ref);
    }

    return;
  }

  return result;
}

function parseCronSchedule(input: string, ref: Date): Date | undefined {
  try {
    const result = cron.parseExpression(input, { tz: 'UTC', currentDate: ref });
    return result.next().toDate();
  } catch {}
}

const MIN_SCHEDULE = human('1 minute');
const MIN_ADDITION = human('2 minutes');

export function parseSchedule(input: string, ref = new Date()): Date | undefined {
  const textSchedule = parseTextSchedule(input, ref);
  if (textSchedule) {
    const diff = textSchedule.getTime() - ref.getTime();
    if (diff < MIN_SCHEDULE) {
      // if the schedule is less than 1 minute away, add 2 minutes to it.
      // this is to punish users trying to get around the 1 minute minimum.
      return new Date(ref.getTime() + MIN_ADDITION);
    }

    return textSchedule;
  }

  const cronSchedule = parseCronSchedule(input, ref);
  // for cron schedules, we have to handle it differently.
  // for example, "*/1 * * * *" would be run in 58s because it'd be 2s
  // to schedule/run the action, which would then mean we're punishing every run.
  // so we have to calculate the next run, and then check the diff
  if (cronSchedule) {
    const nextSchedule = parseCronSchedule(input, cronSchedule);
    if (nextSchedule) {
      const diff = nextSchedule.getTime() - cronSchedule.getTime();
      if (diff < MIN_SCHEDULE - 1000) {
        // -1000 just in case there is some weirdness
        return new Date(cronSchedule.getTime() + MIN_ADDITION);
      }
    }

    return cronSchedule;
  }
}
