import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  CalendarProvider,
  LocaleConfig,
  WeekCalendar,
} from "react-native-calendars";

import { ThemedText } from "@/components/themed-text";
import {
  getDeviceEventsMarkedDates,
  getTherapyMarkedDates,
} from "@/lib/calendar/device-calendar";
import {
  formatDateKey,
  getWeekStart,
  parseDateKey,
} from "@/lib/calendar/week-utils";
import {
  dateToTherapyDayKey,
  type TherapyDayKey,
  type TherapyDayPlan,
} from "@/lib/therapy/types";

LocaleConfig.locales.it = {
  monthNames: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  monthNamesShort: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  today: "Oggi",
};
LocaleConfig.defaultLocale = "it";

const calendarTheme = {
  backgroundColor: "transparent",
  calendarBackground: "transparent",
  textSectionTitleColor: "#0F172A",
  selectedDayBackgroundColor: "#0a7ea4",
  selectedDayTextColor: "#FFFFFF",
  todayTextColor: "#0a7ea4",
  dayTextColor: "#1F2937",
  textDisabledColor: "#94A3B8",
  arrowColor: "#0a7ea4",
  monthTextColor: "#0F172A",
  indicatorColor: "#0a7ea4",
};

type TherapyWeekCalendarProps = {
  dayPlan: TherapyDayPlan;
  onToggleDay: (day: TherapyDayKey) => void;
};

export function TherapyWeekCalendar({
  dayPlan,
  onToggleDay,
}: TherapyWeekCalendarProps) {
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
    const merged = { ...deviceMarks };

    Object.entries(therapyMarks).forEach(([dateKey, mark]) => {
      merged[dateKey] = {
        ...(merged[dateKey] ?? {}),
        ...mark,
        marked: Boolean(merged[dateKey]?.marked || mark.marked),
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

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Calendario settimanale</ThemedText>
      <ThemedText style={styles.helper}>
        Verde: giorni terapia · Blu: eventi del calendario del telefono
      </ThemedText>

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
            onToggleDay(dateToTherapyDayKey(parseDateKey(day.dateString)));
          }}
        />
      </CalendarProvider>

      {isLoadingDeviceEvents ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>
            Aggiornamento eventi del telefono...
          </ThemedText>
        </View>
      ) : null}

      {calendarError ? (
        <ThemedText style={styles.errorText}>{calendarError}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.85,
  },
  errorText: {
    fontSize: 14,
    color: "#C62828",
  },
});
