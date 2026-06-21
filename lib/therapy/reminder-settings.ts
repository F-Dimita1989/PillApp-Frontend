import type { TherapyDayPlan } from "@/lib/therapy/types";
import { INITIAL_THERAPY_DAY_PLAN } from "@/lib/therapy/types";
import type { TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import {
  DEFAULT_NOTIFICATION_LEAD_ID,
  type TherapyNotificationLeadId,
} from "@/constants/therapy-notification-lead";

export type TherapyReminderSettingsValue = {
  timesPerDay: number;
  orari: string[];
  dayPlan: TherapyDayPlan;
  notificationsEnabled: boolean;
  notificationSoundId: TherapyReminderSoundId;
  notificationLeadId: TherapyNotificationLeadId;
};

export const DEFAULT_ORARI_BY_TIMES_PER_DAY: readonly string[][] = [
  ["08:00"],
  ["08:00", "20:00"],
  ["08:00", "14:00", "20:00"],
  ["07:00", "12:00", "18:00", "22:00"],
];

export const INITIAL_THERAPY_REMINDER_SETTINGS: TherapyReminderSettingsValue = {
  timesPerDay: 1,
  orari: ["08:00"],
  dayPlan: INITIAL_THERAPY_DAY_PLAN,
  notificationsEnabled: true,
  notificationSoundId: "default",
  notificationLeadId: DEFAULT_NOTIFICATION_LEAD_ID,
};

export function defaultOrariForTimesPerDay(timesPerDay: number): string[] {
  const index = Math.min(Math.max(timesPerDay, 1), 4) - 1;
  return [...DEFAULT_ORARI_BY_TIMES_PER_DAY[index]];
}

export function normalizeOrariForTimesPerDay(
  timesPerDay: number,
  currentOrari: string[],
): string[] {
  const targetCount = Math.min(Math.max(timesPerDay, 1), 4);
  const defaults = defaultOrariForTimesPerDay(targetCount);
  const next = currentOrari.slice(0, targetCount);

  while (next.length < targetCount) {
    next.push(defaults[next.length] ?? "08:00");
  }

  return next;
}

export function isValidTimeValue(value: string): boolean {
  return /^([01]?\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export function validateReminderSettings(
  settings: TherapyReminderSettingsValue,
): string | null {
  if (settings.timesPerDay < 1 || settings.timesPerDay > 4) {
    return "Scegli da 1 a 4 assunzioni al giorno.";
  }

  const activeDays = Object.values(settings.dayPlan).filter(Boolean).length;
  if (activeDays === 0) {
    return "Seleziona almeno un giorno della settimana.";
  }

  for (let index = 0; index < settings.timesPerDay; index += 1) {
    const orario = settings.orari[index]?.trim() ?? "";
    if (!isValidTimeValue(orario)) {
      return `Orario ${index + 1} non valido. Usa il formato HH:mm (es. 08:00).`;
    }
  }

  return null;
}
