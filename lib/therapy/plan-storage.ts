import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import {
  ensureNotificationPermissions,
  getNotificationChannelId,
  getNotificationSoundPayload,
} from "@/lib/notifications/setup";
import { buildWeeklyReminderTrigger } from "@/lib/notifications/schedule-weekly-trigger";
import type { TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import {
  defaultOrariForTimesPerDay,
  normalizeOrariForTimesPerDay,
} from "@/lib/therapy/reminder-settings";

import { syncTherapyPlanToDeviceCalendar } from "@/lib/calendar/device-calendar";
import {
  INITIAL_THERAPY_DAY_PLAN,
  THERAPY_DAY_TO_WEEKDAY,
  THERAPY_DAYS,
  type TherapyDayKey,
  type TherapyDayPlan,
} from "@/lib/therapy/types";
import type { QuantitaUnit } from "@/types/domain";

export const PLAN_KEY = "pillapp:weeklyTherapyPlan";
export const PLAN_NOTIFICATION_IDS_KEY = "pillapp:weeklyTherapyNotificationIds";

export type TherapyPlan = {
  aic: string;
  farmacoNome: string;
  /** Primo orario — mantenuto per compatibilità */
  orario: string;
  orari: string[];
  timesPerDay: number;
  dose: string;
  note: string;
  quantita: string;
  unitaQuantita: QuantitaUnit;
  dayPlan: TherapyDayPlan;
  notificationsEnabled: boolean;
  notificationSoundId: TherapyReminderSoundId;
  updatedAt: string;
};

export type SaveTherapyPlanResult = {
  reminders: number;
  calendarEvents: number;
  calendarWarning?: string;
  notificationWarning?: string;
};

function normalizeStoredPlan(saved: Partial<TherapyPlan>): TherapyPlan {
  const timesPerDay = Math.min(Math.max(saved.timesPerDay ?? 1, 1), 4);
  const legacyOrario = saved.orario ?? "08:00";
  const orari = normalizeOrariForTimesPerDay(
    timesPerDay,
    saved.orari?.length ? saved.orari : [legacyOrario],
  );

  return {
    aic: saved.aic ?? "",
    farmacoNome: saved.farmacoNome ?? "",
    orario: orari[0] ?? legacyOrario,
    orari,
    timesPerDay,
    dose: saved.dose ?? "1 compressa",
    note: saved.note ?? "",
    quantita: saved.quantita ?? "",
    unitaQuantita: saved.unitaQuantita ?? "pillole",
    dayPlan: {
      ...INITIAL_THERAPY_DAY_PLAN,
      ...(saved.dayPlan ?? {}),
    },
    notificationsEnabled: saved.notificationsEnabled ?? true,
    notificationSoundId: saved.notificationSoundId ?? "default",
    updatedAt: saved.updatedAt ?? new Date().toISOString(),
  };
}

export async function getTherapyPlan(): Promise<TherapyPlan | null> {
  const raw = await AsyncStorage.getItem(PLAN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const saved = JSON.parse(raw) as Partial<TherapyPlan>;
    return normalizeStoredPlan(saved);
  } catch {
    return null;
  }
}

export async function hasTherapyPlan(): Promise<boolean> {
  const plan = await getTherapyPlan();
  return Boolean(plan?.farmacoNome?.trim());
}

function parseTime(rawTime: string): { hour: number; minute: number } | null {
  const match = rawTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

async function clearPreviousNotifications(): Promise<void> {
  const existingIdsRaw = await AsyncStorage.getItem(PLAN_NOTIFICATION_IDS_KEY);
  const existingIds = existingIdsRaw
    ? (JSON.parse(existingIdsRaw) as string[])
    : [];

  await Promise.all(
    existingIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  await AsyncStorage.removeItem(PLAN_NOTIFICATION_IDS_KEY);
}

async function scheduleWeeklyNotifications(plan: TherapyPlan): Promise<number> {
  await clearPreviousNotifications();

  if (!plan.notificationsEnabled) {
    return 0;
  }

  const activeDays = THERAPY_DAYS.filter((day) => plan.dayPlan[day]);
  if (activeDays.length === 0) {
    throw new Error("Seleziona almeno un giorno della settimana per i promemoria.");
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error("Permesso notifiche non concesso.");
  }

  const channelId = getNotificationChannelId(plan.notificationSoundId);
  const sound = getNotificationSoundPayload(
    plan.notificationSoundId,
    plan.notificationsEnabled,
  );
  const orari = normalizeOrariForTimesPerDay(plan.timesPerDay, plan.orari);
  const notificationIds: string[] = [];

  for (const orario of orari.slice(0, plan.timesPerDay)) {
    const time = parseTime(orario);
    if (!time) {
      throw new Error(`Formato orario non valido: ${orario}. Usa HH:mm (es. 08:00).`);
    }

    for (const day of activeDays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Promemoria terapia",
          body: `${plan.farmacoNome || "Farmaco"} - ${plan.dose} alle ${orario}`,
          sound: sound ?? undefined,
        },
        trigger: buildWeeklyReminderTrigger({
          weekday: THERAPY_DAY_TO_WEEKDAY[day],
          hour: time.hour,
          minute: time.minute,
          channelId,
        }),
      });
      notificationIds.push(id);
    }
  }

  await AsyncStorage.setItem(
    PLAN_NOTIFICATION_IDS_KEY,
    JSON.stringify(notificationIds),
  );

  return notificationIds.length;
}

export async function saveTherapyPlan(
  input: Omit<TherapyPlan, "updatedAt" | "orario"> & { orario?: string },
): Promise<SaveTherapyPlanResult> {
  const orari = normalizeOrariForTimesPerDay(
    input.timesPerDay,
    input.orari.length ? input.orari : defaultOrariForTimesPerDay(input.timesPerDay),
  );

  const payload: TherapyPlan = normalizeStoredPlan({
    ...input,
    orari,
    orario: orari[0],
    updatedAt: new Date().toISOString(),
  });

  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(payload));

  let reminders = 0;
  let notificationWarning: string | undefined;

  try {
    reminders = await scheduleWeeklyNotifications(payload);
  } catch (notificationError) {
    notificationWarning =
      notificationError instanceof Error
        ? notificationError.message
        : "Impossibile programmare i promemoria.";
  }

  try {
    const calendarEvents = await syncTherapyPlanToDeviceCalendar({
      farmacoNome: payload.farmacoNome,
      orari: payload.orari.slice(0, payload.timesPerDay),
      dose: payload.dose,
      dayPlan: payload.dayPlan,
    });

    return { reminders, calendarEvents, notificationWarning };
  } catch (calendarError) {
    const message =
      calendarError instanceof Error
        ? calendarError.message
        : "Errore sincronizzazione calendario.";

    return {
      reminders,
      calendarEvents: 0,
      calendarWarning: message,
      notificationWarning,
    };
  }
}

export { THERAPY_DAYS, type TherapyDayKey, type TherapyDayPlan };
