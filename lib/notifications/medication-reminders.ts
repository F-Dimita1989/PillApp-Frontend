import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { getTherapyNotificationLeadMinutes } from "@/constants/therapy-notification-lead";
import { getTherapyNotificationRepeatMinutes } from "@/constants/therapy-notification-repeat";
import { DOSE_REMINDER_CATEGORY_ID } from "@/lib/notifications/categories";
import { ensureExactAlarms } from "@/lib/notifications/exact-alarm";
import {
  buildReminderFireSlots,
  computeFollowUpDelaySeconds,
  followUpNotificationCopy,
  parseDoseClock,
  reminderNotificationCopy,
} from "@/lib/notifications/reminder-schedule";
import { buildWeeklyReminderTrigger } from "@/lib/notifications/schedule-weekly-trigger";
import {
  ensureNotificationPermissions,
  getNotificationChannelId,
  getNotificationSoundPayload,
} from "@/lib/notifications/setup";
import type { DoseEvent, Medication } from "@/types/domain";

const MEDICATION_NOTIFICATION_IDS_KEY = "pillapp:medicationNotificationIds";
const FOLLOW_UP_NOTIFICATION_IDS_KEY = "pillapp:doseFollowUpNotificationIds";

/** Expo Calendar: 1 = domenica … 7 = sabato */
const WEEKDAY_FROM_INDEX = [1, 2, 3, 4, 5, 6, 7] as const;

type ReminderSoundOptions = {
  soundId?: string;
  playSound?: boolean;
};

type FollowUpIdMap = Record<string, string[]>;

async function readJsonIds(key: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

async function cancelNotificationIds(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
}

async function clearStoredNotificationIds(): Promise<void> {
  const ids = await readJsonIds(MEDICATION_NOTIFICATION_IDS_KEY);
  await cancelNotificationIds(ids);
  await AsyncStorage.removeItem(MEDICATION_NOTIFICATION_IDS_KEY);
}

async function readFollowUpIdMap(): Promise<FollowUpIdMap> {
  const raw = await AsyncStorage.getItem(FOLLOW_UP_NOTIFICATION_IDS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as FollowUpIdMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function clearFollowUpNotificationIds(): Promise<void> {
  const map = await readFollowUpIdMap();
  await cancelNotificationIds(Object.values(map).flat());
  await AsyncStorage.removeItem(FOLLOW_UP_NOTIFICATION_IDS_KEY);
}

function reminderContent(
  med: Medication,
  timeStr: string,
  copy: { title: string; body: string },
  type: "dose_reminder" | "dose_followup",
  minutesBefore: number,
  sound: boolean | string | null,
) {
  return {
    title: copy.title,
    body: copy.body,
    sound: sound ?? undefined,
    priority: Notifications.AndroidNotificationPriority.MAX,
    categoryIdentifier: DOSE_REMINDER_CATEGORY_ID,
    data: {
      medicationId: med.id,
      doseId: `dose-${med.id}-${timeStr}`,
      scheduledTime: timeStr,
      type,
      minutesBefore,
    },
  };
}

export async function syncMedicationReminders(
  medications: Medication[],
  enabled: boolean,
  options?: ReminderSoundOptions,
): Promise<number> {
  await clearStoredNotificationIds();

  if (!enabled) {
    await clearFollowUpNotificationIds();
    return 0;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error("Permesso notifiche non concesso. Attivalo dalle impostazioni del telefono.");
  }

  await ensureExactAlarms();

  const soundId = options?.soundId ?? "default";
  const playSound = options?.playSound ?? true;
  const channelId = getNotificationChannelId(soundId, playSound);
  const sound = getNotificationSoundPayload(soundId, playSound);

  const activeMeds = medications.filter((m) => m.active);
  const notificationIds: string[] = [];

  for (const med of activeMeds) {
    const leadMinutes = getTherapyNotificationLeadMinutes(med.notificationLeadId);
    const repeatMinutes = getTherapyNotificationRepeatMinutes(med.notificationRepeatId);

    for (const timeStr of med.schedule.times) {
      const time = parseDoseClock(timeStr);
      if (!time) continue;

      for (let dayIndex = 0; dayIndex < med.schedule.daysActive.length; dayIndex++) {
        if (!med.schedule.daysActive[dayIndex]) continue;

        const slots = buildReminderFireSlots(
          {
            weekday: WEEKDAY_FROM_INDEX[dayIndex],
            hour: time.hour,
            minute: time.minute,
          },
          leadMinutes,
          repeatMinutes,
        );

        for (const slot of slots) {
          const copy = reminderNotificationCopy(
            med.name,
            med.dose,
            timeStr,
            slot.minutesBefore,
          );
          const id = await Notifications.scheduleNotificationAsync({
            content: reminderContent(
              med,
              timeStr,
              copy,
              "dose_reminder",
              slot.minutesBefore,
              sound,
            ),
            trigger: buildWeeklyReminderTrigger({
              weekday: slot.weekday,
              hour: slot.hour,
              minute: slot.minute,
              channelId,
            }),
          });
          notificationIds.push(id);
        }
      }
    }
  }

  await AsyncStorage.setItem(MEDICATION_NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
  return notificationIds.length;
}

export async function syncDoseFollowUpReminders(
  medications: Medication[],
  dosesToday: DoseEvent[],
  enabled: boolean,
  options?: ReminderSoundOptions,
): Promise<number> {
  await clearFollowUpNotificationIds();

  if (!enabled) {
    return 0;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return 0;
  }

  const soundId = options?.soundId ?? "default";
  const playSound = options?.playSound ?? true;
  const channelId = getNotificationChannelId(soundId, playSound);
  const sound = getNotificationSoundPayload(soundId, playSound);
  const medById = new Map(medications.map((med) => [med.id, med]));
  const now = new Date();
  const idMap: FollowUpIdMap = {};

  for (const dose of dosesToday) {
    if (dose.status === "taken" || dose.status === "skipped") continue;
    const med = medById.get(dose.medicationId);
    if (!med?.active) continue;

    const intervalMinutes = getTherapyNotificationRepeatMinutes(med.notificationRepeatId);
    const delays = computeFollowUpDelaySeconds(dose.scheduledTime, now, intervalMinutes);
    if (delays.length === 0) continue;

    const copy = followUpNotificationCopy(med.name, med.dose, dose.scheduledTime);
    const ids: string[] = [];

    for (const seconds of delays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: reminderContent(med, dose.scheduledTime, copy, "dose_followup", 0, sound),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
          channelId,
        },
      });
      ids.push(id);
    }

    idMap[dose.id] = ids;
  }

  await AsyncStorage.setItem(FOLLOW_UP_NOTIFICATION_IDS_KEY, JSON.stringify(idMap));
  return Object.values(idMap).flat().length;
}

export async function cancelFollowUpRemindersForDose(doseId: string): Promise<void> {
  const map = await readFollowUpIdMap();
  const ids = map[doseId];
  if (!ids?.length) return;
  await cancelNotificationIds(ids);
  delete map[doseId];
  await AsyncStorage.setItem(FOLLOW_UP_NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

export async function cancelAllMedicationReminders(): Promise<void> {
  await clearStoredNotificationIds();
  await clearFollowUpNotificationIds();
}
