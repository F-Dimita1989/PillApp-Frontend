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
      title: "È l'orario di assunzione",
      body: `${medName} — ${dose} alle ${timeStr}`,
    };
  }

  return {
    title: `Promemoria tra ${minutesBefore} minuti`,
    body: `${medName} — ${dose} alle ${timeStr}`,
  };
}
