import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { ensureNotificationPermissions, THERAPY_CHANNEL_ID } from "@/lib/notifications/setup";
import { buildWeeklyReminderTrigger } from "@/lib/notifications/schedule-weekly-trigger";
import type { Medication } from "@/types/domain";

const MEDICATION_NOTIFICATION_IDS_KEY = "pillapp:medicationNotificationIds";

/** Expo Calendar: 1 = domenica … 7 = sabato */
const WEEKDAY_FROM_INDEX = [1, 2, 3, 4, 5, 6, 7] as const;

function parseTime(rawTime: string): { hour: number; minute: number } | null {
  const match = rawTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

async function clearStoredNotificationIds(): Promise<void> {
  const raw = await AsyncStorage.getItem(MEDICATION_NOTIFICATION_IDS_KEY);
  const ids = raw ? (JSON.parse(raw) as string[]) : [];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await AsyncStorage.removeItem(MEDICATION_NOTIFICATION_IDS_KEY);
}

export async function syncMedicationReminders(
  medications: Medication[],
  enabled: boolean,
): Promise<number> {
  await clearStoredNotificationIds();

  if (!enabled) {
    return 0;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error("Permesso notifiche non concesso. Attivalo dalle impostazioni del telefono.");
  }

  const activeMeds = medications.filter((m) => m.active);
  const notificationIds: string[] = [];

  for (const med of activeMeds) {
    for (const timeStr of med.schedule.times) {
      const time = parseTime(timeStr);
      if (!time) continue;

      for (let dayIndex = 0; dayIndex < med.schedule.daysActive.length; dayIndex++) {
        if (!med.schedule.daysActive[dayIndex]) continue;

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Promemoria PillApp",
            body: `${med.name} — ${med.dose} alle ${timeStr}`,
            sound: true,
            data: { medicationId: med.id, type: "dose_reminder" },
          },
          trigger: buildWeeklyReminderTrigger({
            weekday: WEEKDAY_FROM_INDEX[dayIndex],
            hour: time.hour,
            minute: time.minute,
            channelId: THERAPY_CHANNEL_ID,
          }),
        });
        notificationIds.push(id);
      }
    }
  }

  await AsyncStorage.setItem(MEDICATION_NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
  return notificationIds.length;
}

export async function cancelAllMedicationReminders(): Promise<void> {
  await clearStoredNotificationIds();
}
