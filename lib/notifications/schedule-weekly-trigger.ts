import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export type WeeklyReminderTriggerParams = {
  weekday: number;
  hour: number;
  minute: number;
  channelId: string;
};

/** iOS: CALENDAR ripetuto; Android: WEEKLY (CALENDAR non supportato). */
export function buildWeeklyReminderTrigger({
  weekday,
  hour,
  minute,
  channelId,
}: WeeklyReminderTriggerParams): Notifications.SchedulableNotificationTriggerInput {
  if (Platform.OS === "android") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      channelId,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    weekday,
    hour,
    minute,
    second: 0,
    repeats: true,
    channelId,
  };
}

export function buildDateReminderTrigger(
  date: Date,
  channelId: string,
): Notifications.SchedulableNotificationTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId,
  };
}

export function buildDailyReminderTrigger(
  hour: number,
  minute: number,
  channelId: string,
): Notifications.SchedulableNotificationTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
    channelId,
  };
}
