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
 * Minuti prima dell'assunzione in cui far partire l'avviso.
 * Sempre orario esatto (0); se c'è anticipo, anche quello;
 * se c'è ripetizione, riempie i passi intermedi.
 */
export function reminderMinutesBeforeDose(
  leadMinutes: number,
  repeatMinutes: number,
): number[] {
  const unique = new Set<number>([0]);
  const lead = Math.max(0, leadMinutes);

  if (lead > 0) {
    unique.add(lead);
    if (repeatMinutes > 0) {
      for (let minutes = lead - repeatMinutes; minutes > 0; minutes -= repeatMinutes) {
        unique.add(minutes);
      }
    }
  }

  return [...unique].sort((a, b) => b - a);
}

export function buildReminderFireSlots(
  clock: WeeklyClock,
  leadMinutes: number,
  repeatMinutes: number,
): ReminderFireSlot[] {
  return reminderMinutesBeforeDose(leadMinutes, repeatMinutes).map(
    (minutesBefore) => ({
      ...shiftWeeklyClock(clock, -minutesBefore),
      minutesBefore,
    }),
  );
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

/** Ripetizioni dopo l'orario, finché l'assunzione non è confermata. */
export const DOSE_FOLLOW_UP_MAX_COUNT = 12;
export const DOSE_FOLLOW_UP_WINDOW_MINUTES = 120;
export const DOSE_FOLLOW_UP_MIN_INTERVAL_MINUTES = 5;

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

/**
 * Secondi da ora per i reminder post-orario (one-shot).
 * Se l'orario non è ancora arrivato, partono dopo la dose;
 * se è già passato, ripartono da ora (così continuano finché non confermi
 * e l'app si risincronizza).
 */
export function computeFollowUpDelaySeconds(
  scheduledTime: string,
  now: Date,
  intervalMinutes: number,
): number[] {
  const interval = Math.max(
    DOSE_FOLLOW_UP_MIN_INTERVAL_MINUTES,
    intervalMinutes || DOSE_FOLLOW_UP_MIN_INTERVAL_MINUTES,
  );
  const doseAt = scheduledDateOnDay(scheduledTime, now);
  if (!doseAt) return [];

  const firstMs =
    now.getTime() < doseAt.getTime()
      ? doseAt.getTime() + interval * 60_000
      : now.getTime() + interval * 60_000;
  const windowEndMs = Math.max(
    doseAt.getTime() + DOSE_FOLLOW_UP_WINDOW_MINUTES * 60_000,
    now.getTime() + DOSE_FOLLOW_UP_WINDOW_MINUTES * 60_000,
  );

  const delays: number[] = [];
  for (
    let t = firstMs;
    t <= windowEndMs && delays.length < DOSE_FOLLOW_UP_MAX_COUNT;
    t += interval * 60_000
  ) {
    const seconds = Math.round((t - now.getTime()) / 1000);
    if (seconds >= 60) {
      delays.push(seconds);
    }
  }
  return delays;
}

export function followUpNotificationCopy(
  medName: string,
  dose: string,
  timeStr: string,
): { title: string; body: string } {
  return {
    title: "Conferma l'assunzione",
    body: `Non hai ancora confermato ${medName} (${dose}), previsto alle ${timeStr}. Apri la scheda del farmaco e conferma.`,
  };
}
