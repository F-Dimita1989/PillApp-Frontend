import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack } from "tamagui";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import { AppText } from "@/components/ui/app-text";
import "@/lib/calendar/locale";
import {
  getDeviceEventsMarkedDates,
  getTherapyMarkedDates,
  type MarkedDates,
} from "@/lib/calendar/device-calendar";
import {
  formatDateKey,
  getWeekStart,
  parseDateKey,
} from "@/lib/calendar/week-utils";
import type { TherapyDayPlan } from "@/lib/therapy/types";
import {
  formatItalianDate,
  formatItalianTime,
} from "@/lib/time/datetime-labels";
import { useNow } from "@/hooks/use-now";
import { pillappCalendarTheme } from "@/lib/calendar/calendar-theme";
import { pillappColors } from "@/theme/tokens";

type HomeWeekCalendarProps = {
  dayPlan: TherapyDayPlan;
};

export function HomeWeekCalendar({ dayPlan }: HomeWeekCalendarProps) {
  const calendarTheme = useMemo(() => pillappCalendarTheme, []);

  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [deviceMarks, setDeviceMarks] = useState<
    Awaited<ReturnType<typeof getDeviceEventsMarkedDates>>
  >({});
  const [isLoadingDeviceEvents, setIsLoadingDeviceEvents] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const weekStart = useMemo(
    () => getWeekStart(parseDateKey(selectedDate)),
    [selectedDate],
  );

  const therapyMarks = useMemo(
    () => getTherapyMarkedDates(weekStart, dayPlan, selectedDate),
    [weekStart, dayPlan, selectedDate],
  );

  const markedDates = useMemo(() => {
    const merged: MarkedDates = { ...deviceMarks };

    Object.entries(therapyMarks).forEach(([dateKey, mark]) => {
      const existing = merged[dateKey];
      merged[dateKey] = {
        ...(existing ?? {}),
        ...mark,
        marked: Boolean(existing?.marked || mark.marked),
      };
    });

    return merged;
  }, [deviceMarks, therapyMarks]);

  const loadDeviceWeekEvents = useCallback(async (anchorDate: string) => {
    setIsLoadingDeviceEvents(true);
    setCalendarError("");

    try {
      const start = getWeekStart(parseDateKey(anchorDate));
      const marks = await getDeviceEventsMarkedDates(start);
      setDeviceMarks(marks);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossibile leggere il calendario del telefono.";
      setCalendarError(message);
      setDeviceMarks({});
    } finally {
      setIsLoadingDeviceEvents(false);
    }
  }, []);

  useEffect(() => {
    void loadDeviceWeekEvents(selectedDate);
  }, [loadDeviceWeekEvents, selectedDate]);

  const now = useNow();

  const selectedLabel = useMemo(
    () => formatItalianDate(parseDateKey(selectedDate)),
    [selectedDate],
  );

  const hasTherapyDays = useMemo(
    () => Object.values(dayPlan).some(Boolean),
    [dayPlan],
  );

  return (
    <YStack width="100%" gap="$2">
      <XStack width="100%" justifyContent="space-between" alignItems="flex-start" gap="$2">
        <AppText variant="title">Calendario</AppText>
        <YStack alignItems="flex-end" flexShrink={1} gap="$0.5">
          <AppText variant="caption" muted textAlign="right">
            {selectedLabel}
          </AppText>
          <AppText variant="label" color="primary" textAlign="right">
            {formatItalianTime(now)}
          </AppText>
        </YStack>
      </XStack>

      <AppText variant="caption" muted>
        {hasTherapyDays
          ? "Verde: giorni terapia · Blu: eventi del calendario del telefono"
          : "Blu: eventi del calendario del telefono"}
      </AppText>

      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date) => {
          setSelectedDate(date);
          void loadDeviceWeekEvents(date);
        }}
        showTodayButton
        theme={calendarTheme}
      >
        <WeekCalendar
          firstDay={1}
          markedDates={markedDates}
          allowShadow={false}
          theme={calendarTheme}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            void loadDeviceWeekEvents(day.dateString);
          }}
        />
      </CalendarProvider>

      {isLoadingDeviceEvents ? (
        <XStack alignItems="center" gap="$2">
          <ActivityIndicator size="small" color={pillappColors.primary} />
          <AppText variant="caption" muted>
            Aggiornamento eventi del telefono...
          </AppText>
        </XStack>
      ) : null}

      {calendarError ? (
        <AppText variant="caption" color="error">
          {calendarError}
        </AppText>
      ) : null}
    </YStack>
  );
}
