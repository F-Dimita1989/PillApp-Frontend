import { formatDateKey } from "@/lib/calendar/week-utils";

export type WeeklyClock = {
  weekday: number;
  hour: number;
  minute: number;
};

export type ReminderFireSlot = WeeklyClock & {
  minutesBefore: number;
};

const MINUTES_IN_WEEK = 7 * 24 * 60;

/** weekday Expo: 1 = domenica … 7 = sabato */
export function shiftWeeklyClock(
  clock: WeeklyClock,
  offsetMinutes: number,
): WeeklyClock {
  const origin =
    (clock.weekday - 1) * 24 * 60 + clock.hour * 60 + clock.minute;
  const shifted =
    ((origin + offsetMinutes) % MINUTES_IN_WEEK + MINUTES_IN_WEEK) %
    MINUTES_IN_WEEK;
  const weekday = Math.floor(shifted / (24 * 60)) + 1;
  const dayMinutes = shifted % (24 * 60);

  return {
    weekday,
    hour: Math.floor(dayMinutes / 60),
    minute: dayMinutes % 60,
  };
}

/**
 * Slot settimanali: orario esatto e, se c'è, un solo anticipo.
 * La ripetizione serve ai reminder DOPO l'orario (follow-up), non a
 * moltiplicare allarmi settimanali che Android scarica tutti insieme.
 */
export function reminderMinutesBeforeDose(leadMinutes: number): number[] {
  const unique = new Set<number>([0]);
  const lead = Math.max(0, leadMinutes);
  if (lead > 0) {
    unique.add(lead);
  }
  return [...unique].sort((a, b) => b - a);
}

export function buildReminderFireSlots(
  clock: WeeklyClock,
  leadMinutes: number,
): ReminderFireSlot[] {
  return reminderMinutesBeforeDose(leadMinutes).map((minutesBefore) => ({
    ...shiftWeeklyClock(clock, -minutesBefore),
    minutesBefore,
  }));
}

export function reminderNotificationCopy(
  medName: string,
  dose: string,
  timeStr: string,
  minutesBefore: number,
): { title: string; body: string } {
  if (minutesBefore <= 0) {
    return {
      title: "Un momento di cura per te ❤️☺️",
      body: `È ora di ${medName} (${dose}), alle ${timeStr}. Quando l'hai preso, conferma l'assunzione dalla scheda del farmaco.`,
    };
  }

  return {
    title: `Tra ${minutesBefore} minuti, un pensiero per te ❤️☺️`,
    body: `${medName} (${dose}) alle ${timeStr}. Preparati con serenità, ci siamo quasi.`,
  };
}

export function parseDoseClock(
  rawTime: string,
): { hour: number; minute: number } | null {
  const match = rawTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function scheduledDateOnDay(timeStr: string, day: Date): Date | null {
  const clock = parseDoseClock(timeStr);
  if (!clock) return null;
  const date = new Date(day);
  date.setHours(clock.hour, clock.minute, 0, 0);
  return date;
}

/** Massimo ore di insistenza dopo l'assunzione, nella stessa giornata. */
export const DOSE_CONFIRM_FOLLOW_UP_MAX_HOURS = 16;

/** Ultima ora del giorno in cui mandare il reminder di conferma (22:xx). */
export const DOSE_CONFIRM_FOLLOW_UP_LAST_HOUR = 22;

export function isSameLocalDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Prossima occorrenza locale di weekday/ora/minuto (weekday Expo: 1 = domenica). */
export function nextWeeklyOccurrence(clock: WeeklyClock, now: Date): Date {
  const result = new Date(now);
  result.setSeconds(0, 0);
  result.setMilliseconds(0);
  result.setHours(clock.hour, clock.minute, 0, 0);

  const nowWeekday = now.getDay() + 1;
  let dayDelta = clock.weekday - nowWeekday;
  if (dayDelta < 0) {
    dayDelta += 7;
  }
  if (dayDelta === 0 && result.getTime() <= now.getTime()) {
    dayDelta = 7;
  }
  result.setDate(result.getDate() + dayDelta);
  return result;
}

/** Prossima occorrenza locale di ora/minuto, oggi o domani. */
export function nextDailyOccurrence(
  hour: number,
  minute: number,
  now: Date,
): Date {
  const result = new Date(now);
  result.setSeconds(0, 0);
  result.setMilliseconds(0);
  result.setHours(hour, minute, 0, 0);
  if (result.getTime() <= now.getTime()) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * Orari di conferma dopo la dose: ogni ora, stessa giornata, fino alle 22.
 * Programmabili come WEEKLY: funzionano anche a app chiusa.
 */
export function buildHourlyConfirmClocks(doseClock: WeeklyClock): WeeklyClock[] {
  const clocks: WeeklyClock[] = [];
  for (let hoursAfter = 1; hoursAfter <= DOSE_CONFIRM_FOLLOW_UP_MAX_HOURS; hoursAfter++) {
    const shifted = shiftWeeklyClock(doseClock, hoursAfter * 60);
    if (shifted.weekday !== doseClock.weekday) {
      break;
    }
    if (shifted.hour >= DOSE_CONFIRM_FOLLOW_UP_LAST_HOUR + 1) {
      break;
    }
    clocks.push(shifted);
  }
  return clocks;
}

export function followUpNotificationCopy(
  medName: string,
  dose: string,
  timeStr: string,
): { title: string; body: string } {
  return {
    title: "Conferma l'assunzione",
    body: `Non hai ancora confermato ${medName} (${dose}), previsto alle ${timeStr}. Conferma dall'avviso o dalla scheda del farmaco.`,
  };
}
