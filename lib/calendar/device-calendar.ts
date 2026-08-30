import * as Calendar from "expo-calendar";

import { formatDateKey, getWeekEnd } from "@/lib/calendar/week-utils";
import { pillappColors } from "@/theme/tokens";

export type CalendarDayMark = {
  marked?: boolean;
  dotColor?: string;
};

export type MarkedDates = Record<string, CalendarDayMark>;

export async function ensureCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") {
    return true;
  }

  const request = await Calendar.requestCalendarPermissionsAsync();
  return request.status === "granted";
}

export async function getDeviceEventsMarkedDates(
  weekStart: Date,
): Promise<MarkedDates> {
  const hasPermission = await ensureCalendarPermission();
  if (!hasPermission) {
    return {};
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calendarIds = calendars.map((entry) => entry.id);
  if (calendarIds.length === 0) {
    return {};
  }

  const events = await Calendar.getEventsAsync(
    calendarIds,
    weekStart,
    getWeekEnd(weekStart),
  );

  const marks: MarkedDates = {};
  events.forEach((event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const cursor = new Date(start);
    cursor.setHours(12, 0, 0, 0);

    while (cursor <= end) {
      const key = formatDateKey(cursor);
      marks[key] = {
        ...(marks[key] ?? {}),
        marked: true,
        dotColor: pillappColors.primary,
      };
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return marks;
}
