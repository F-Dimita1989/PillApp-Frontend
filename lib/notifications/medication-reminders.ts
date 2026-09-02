import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { getTherapyNotificationLeadMinutes } from "@/constants/therapy-notification-lead";
import { formatDateKey } from "@/lib/calendar/week-utils";
import { DOSE_REMINDER_CATEGORY_ID } from "@/lib/notifications/categories";
import { ensureExactAlarms } from "@/lib/notifications/exact-alarm";
import {
  addDays,
  buildHourlyConfirmClocks,
  buildReminderFireSlots,
  followUpNotificationCopy,
  isSameLocalDay,
  nextDailyOccurrence,
  nextWeeklyOccurrence,
  parseDoseClock,
  reminderNotificationCopy,
  type WeeklyClock,
} from "@/lib/notifications/reminder-schedule";
import {
  buildDailyReminderTrigger,
  buildDateReminderTrigger,
  buildWeeklyReminderTrigger,
} from "@/lib/notifications/schedule-weekly-trigger";
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
  dosesToday?: DoseEvent[];
};

type FollowUpIdMap = Record<string, string[]>;

let syncQueue: Promise<unknown> = Promise.resolve();

function enqueueSync<T>(work: () => Promise<T>): Promise<T> {
  const run = syncQueue.then(work, work);
  syncQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
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

async function resetAllScheduledReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.multiRemove([
    MEDICATION_NOTIFICATION_IDS_KEY,
    FOLLOW_UP_NOTIFICATION_IDS_KEY,
  ]);
}

async function dismissPresentedForDose(doseId: string): Promise<void> {
  const presented = await Notifications.getPresentedNotificationsAsync();
  await Promise.all(
    presented
      .filter((item) => item.request.content.data?.doseId === doseId)
      .map((item) =>
        Notifications.dismissNotificationAsync(item.request.identifier).catch(() => {}),
      ),
  );
}

function isEveryDaySchedule(daysActive: boolean[]): boolean {
  return daysActive.length === 7 && daysActive.every(Boolean);
}

function followUpSkipOffsets(everyDay: boolean): number[] {
  return everyDay ? [1, 2, 3, 4, 5, 6, 7] : [7, 14, 21];
}

function followUpTriggersForClock(
  clock: WeeklyClock,
  now: Date,
  confirmedToday: boolean,
  everyDay: boolean,
  channelId: string,
): Notifications.SchedulableNotificationTriggerInput[] {
  const nextFire = everyDay
    ? nextDailyOccurrence(clock.hour, clock.minute, now)
    : nextWeeklyOccurrence(clock, now);
  const skipToday = confirmedToday && isSameLocalDay(nextFire, now);

  if (!skipToday) {
    if (everyDay) {
      return [buildDailyReminderTrigger(clock.hour, clock.minute, channelId)];
    }
    return [
      buildWeeklyReminderTrigger({
        weekday: clock.weekday,
        hour: clock.hour,
        minute: clock.minute,
        channelId,
      }),
    ];
  }

  return followUpSkipOffsets(everyDay).map((days) =>
    buildDateReminderTrigger(addDays(nextFire, days), channelId),
  );
}

async function scheduleWeeklyAndFollowUps(
  medications: Medication[],
  enabled: boolean,
  options?: ReminderSoundOptions,
): Promise<number> {
  await resetAllScheduledReminders();

  if (!enabled) {
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
  const followUpMap: FollowUpIdMap = {};
  const now = new Date();
  const todayKey = formatDateKey(now);
  const takenDoseIds = new Set(
    (options?.dosesToday ?? [])
      .filter(
        (dose) =>
          dose.date === todayKey &&
          (dose.status === "taken" || dose.status === "skipped"),
      )
      .map((dose) => dose.id),
  );

  for (const med of activeMeds) {
    const leadMinutes = getTherapyNotificationLeadMinutes(med.notificationLeadId);
    const everyDay = isEveryDaySchedule(med.schedule.daysActive);

    for (const timeStr of med.schedule.times) {
      const time = parseDoseClock(timeStr);
      if (!time) continue;
      const doseId = `dose-${med.id}-${timeStr}`;
      const confirmCopy = followUpNotificationCopy(med.name, med.dose, timeStr);
      const confirmedToday = takenDoseIds.has(doseId);
      let scheduledDailyFollowUps = false;

      for (let dayIndex = 0; dayIndex < med.schedule.daysActive.length; dayIndex++) {
        if (!med.schedule.daysActive[dayIndex]) continue;

        const doseClock = {
          weekday: WEEKDAY_FROM_INDEX[dayIndex],
          hour: time.hour,
          minute: time.minute,
        };
        const slots = buildReminderFireSlots(doseClock, leadMinutes);

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

        if (everyDay && scheduledDailyFollowUps) {
          continue;
        }

        for (const followClock of buildHourlyConfirmClocks(doseClock)) {
          const triggers = followUpTriggersForClock(
            followClock,
            now,
            confirmedToday,
            everyDay,
            channelId,
          );
          for (const trigger of triggers) {
            const id = await Notifications.scheduleNotificationAsync({
              content: reminderContent(
                med,
                timeStr,
                confirmCopy,
                "dose_followup",
                0,
                sound,
              ),
              trigger,
            });
            followUpMap[doseId] = [...(followUpMap[doseId] ?? []), id];
          }
        }
        scheduledDailyFollowUps = everyDay;
      }
    }
  }

  await AsyncStorage.setItem(
    MEDICATION_NOTIFICATION_IDS_KEY,
    JSON.stringify(notificationIds),
  );
  await AsyncStorage.setItem(
    FOLLOW_UP_NOTIFICATION_IDS_KEY,
    JSON.stringify(followUpMap),
  );
  return notificationIds.length + Object.values(followUpMap).flat().length;
}

export async function syncMedicationReminders(
  medications: Medication[],
  enabled: boolean,
  options?: ReminderSoundOptions,
): Promise<number> {
  return enqueueSync(() => scheduleWeeklyAndFollowUps(medications, enabled, options));
}

export async function cancelFollowUpRemindersForDose(doseId: string): Promise<void> {
  await enqueueSync(async () => {
    await dismissPresentedForDose(doseId);
    const map = await readFollowUpIdMap();
    const ids = map[doseId];
    if (ids?.length) {
      await Promise.all(
        ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
      );
      delete map[doseId];
      await AsyncStorage.setItem(FOLLOW_UP_NOTIFICATION_IDS_KEY, JSON.stringify(map));
    }
  });
}

export async function cancelAllMedicationReminders(): Promise<void> {
  await enqueueSync(async () => {
    await resetAllScheduledReminders();
    await Notifications.dismissAllNotificationsAsync().catch(() => {});
  });
}
