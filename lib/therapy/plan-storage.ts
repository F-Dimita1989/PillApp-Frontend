import AsyncStorage from "@react-native-async-storage/async-storage";

import type { TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import {
  DEFAULT_NOTIFICATION_LEAD_ID,
  type TherapyNotificationLeadId,
} from "@/constants/therapy-notification-lead";
import {
  DEFAULT_NOTIFICATION_REPEAT_ID,
  type TherapyNotificationRepeatId,
} from "@/constants/therapy-notification-repeat";
import { normalizeOrariForTimesPerDay } from "@/lib/therapy/reminder-settings";
import {
  INITIAL_THERAPY_DAY_PLAN,
  type TherapyDayPlan,
} from "@/lib/therapy/types";
import type { QuantitaUnit } from "@/types/domain";

const PLAN_KEY = "pillapp:weeklyTherapyPlan";

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
  notificationLeadId: TherapyNotificationLeadId;
  notificationRepeatId: TherapyNotificationRepeatId;
  updatedAt: string;
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
    notificationLeadId: saved.notificationLeadId ?? DEFAULT_NOTIFICATION_LEAD_ID,
    notificationRepeatId: saved.notificationRepeatId ?? DEFAULT_NOTIFICATION_REPEAT_ID,
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
