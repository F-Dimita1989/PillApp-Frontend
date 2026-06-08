import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import type { MarkedDates } from "react-native-calendars";

import {
  formatDateKey,
  getWeekDateKeys,
  getWeekEnd,
  getWeekStart,
  parseDateKey,
} from "@/lib/calendar/week-utils";
import {
  dateToTherapyDayKey,
  THERAPY_DAY_TO_WEEKDAY,
  type TherapyDayKey,
  type TherapyDayPlan,
} from "@/lib/therapy/types";

const PLAN_CALENDAR_EVENT_IDS_KEY = "pillapp:therapyCalendarEventIds";

export type TherapyPlanForCalendar = {
  farmacoNome: string;
  orario: string;
  dose: string;
  dayPlan: TherapyDayPlan;
};

export async function ensureCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") {
    return true;
  }

  const request = await Calendar.requestCalendarPermissionsAsync();
  return request.status === "granted";
}

async function getWritableCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const editable =
    calendars.find((entry) => entry.allowsModifications && entry.isPrimary) ??
    calendars.find((entry) => entry.allowsModifications);

  return editable?.id ?? null;
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
        dotColor: "#1565C0",
      };
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return marks;
}

export function getTherapyMarkedDates(
  weekStart: Date,
  dayPlan: TherapyDayPlan,
  selectedDate: string,
): MarkedDates {
  const marks: MarkedDates = {};

  getWeekDateKeys(weekStart).forEach((dateKey) => {
    const dayKey = dateToTherapyDayKey(parseDateKey(dateKey));
    if (!dayPlan[dayKey]) {
      return;
    }

    marks[dateKey] = {
      ...(marks[dateKey] ?? {}),
      marked: true,
      dotColor: "#2E7D32",
    };
  });

  marks[selectedDate] = {
    ...(marks[selectedDate] ?? {}),
    selected: true,
    selectedColor: "#0a7ea4",
  };

  return marks;
}

function getDayOffsetFromWeekStart(day: TherapyDayKey): number {
  const weekday = THERAPY_DAY_TO_WEEKDAY[day];
  return weekday === 1 ? 6 : weekday - 2;
}

function buildEventWindow(
  weekStart: Date,
  hour: number,
  minute: number,
): { startDate: Date; endDate: Date } {
  const startDate = new Date(weekStart);
  startDate.setHours(hour, minute, 0, 0);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30);
  return { startDate, endDate };
}

export async function syncTherapyPlanToDeviceCalendar(
  plan: TherapyPlanForCalendar,
): Promise<number> {
  const hasPermission = await ensureCalendarPermission();
  if (!hasPermission) {
    throw new Error("Permesso calendario non concesso.");
  }

  const calendarId = await getWritableCalendarId();
  if (!calendarId) {
    throw new Error("Nessun calendario modificabile trovato sul telefono.");
  }

  await clearTherapyCalendarEvents();

  const timeMatch = plan.orario.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!timeMatch) {
    throw new Error("Formato orario non valido per il calendario.");
  }

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const activeDays = (Object.keys(plan.dayPlan) as TherapyDayKey[]).filter(
    (day) => plan.dayPlan[day],
  );

  if (activeDays.length === 0) {
    return 0;
  }

  const eventIds: string[] = [];
  const seriesStart = getWeekStart(new Date());

  for (const day of activeDays) {
    const dayOffset = getDayOffsetFromWeekStart(day);
    const firstOccurrence = new Date(seriesStart);
    firstOccurrence.setDate(seriesStart.getDate() + dayOffset);

    const { startDate, endDate } = buildEventWindow(
      firstOccurrence,
      hour,
      minute,
    );

    const recurrenceRule: Calendar.RecurrenceRule = {
      frequency: Calendar.Frequency.WEEKLY,
      interval: 1,
    };

    if (Platform.OS === "ios") {
      recurrenceRule.daysOfTheWeek = [
        {
          dayOfTheWeek: THERAPY_DAY_TO_WEEKDAY[day],
        },
      ];
    }

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `PillApp · ${plan.farmacoNome || "Terapia"}`,
      notes: plan.dose,
      startDate,
      endDate,
      recurrenceRule,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    eventIds.push(eventId);
  }

  await AsyncStorage.setItem(
    PLAN_CALENDAR_EVENT_IDS_KEY,
    JSON.stringify(eventIds),
  );

  return eventIds.length;
}

export async function clearTherapyCalendarEvents(): Promise<void> {
  const raw = await AsyncStorage.getItem(PLAN_CALENDAR_EVENT_IDS_KEY);
  if (!raw) {
    return;
  }

  const ids = JSON.parse(raw) as string[];
  await Promise.all(
    ids.map((id) => Calendar.deleteEventAsync(id).catch(() => undefined)),
  );
  await AsyncStorage.removeItem(PLAN_CALENDAR_EVENT_IDS_KEY);
}
