import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
import {
  getDeviceEventsMarkedDates,
  type MarkedDates,
} from "@/lib/calendar/device-calendar";
import {
  formatDateKey,
  getWeekDateKeys,
  getWeekStart,
  parseDateKey,
} from "@/lib/calendar/week-utils";
import { dateToTherapyDayKey, type TherapyDayPlan } from "@/lib/therapy/types";
import {
  formatItalianDate,
  formatItalianTime,
} from "@/lib/time/datetime-labels";
import { useNow } from "@/hooks/use-now";
import { pillappColors } from "@/theme/tokens";

const WEEK_WINDOW_PAST = 26;
const WEEK_WINDOW_FUTURE = 26;

type HomeWeekCalendarProps = {
  dayPlan: TherapyDayPlan;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
};

function buildWeekStarts(anchor: Date): Date[] {
  const origin = getWeekStart(anchor);
  const total = WEEK_WINDOW_PAST + WEEK_WINDOW_FUTURE + 1;
  return Array.from({ length: total }, (_, index) => {
    const week = new Date(origin);
    week.setDate(origin.getDate() + (index - WEEK_WINDOW_PAST) * 7);
    week.setHours(12, 0, 0, 0);
    return week;
  });
}

function weekdayOffsetInWeek(dateKey: string): number {
  const weekKeys = getWeekDateKeys(getWeekStart(parseDateKey(dateKey)));
  const offset = weekKeys.indexOf(dateKey);
  return offset >= 0 ? offset : 0;
}

export function HomeWeekCalendar({
  dayPlan,
  selectedDate,
  onSelectedDateChange,
}: HomeWeekCalendarProps) {
  const onBrand = useCardSurface() === "brand";
  const listRef = useRef<FlatList<Date>>(null);
  const pageWidthRef = useRef(0);
  const visibleIndexRef = useRef(-1);
  const [pageWidth, setPageWidth] = useState(0);
  const [deviceMarks, setDeviceMarks] = useState<MarkedDates>({});
  const [isLoadingDeviceEvents, setIsLoadingDeviceEvents] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const now = useNow();
  const todayKey = formatDateKey(now);
  const weeks = useMemo(() => buildWeekStarts(parseDateKey(todayKey)), [todayKey]);

  const selectedWeekIndex = useMemo(() => {
    const weekKey = formatDateKey(getWeekStart(parseDateKey(selectedDate)));
    return weeks.findIndex((week) => formatDateKey(week) === weekKey);
  }, [selectedDate, weeks]);

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

  useEffect(() => {
    if (pageWidth <= 0 || selectedWeekIndex < 0) return;
    if (visibleIndexRef.current === selectedWeekIndex) return;
    visibleIndexRef.current = selectedWeekIndex;
    listRef.current?.scrollToIndex({
      index: selectedWeekIndex,
      animated: false,
    });
  }, [pageWidth, selectedWeekIndex]);

  const selectedLabel = useMemo(
    () => formatItalianDate(parseDateKey(selectedDate)),
    [selectedDate],
  );

  const hasTherapyDays = useMemo(
    () => Object.values(dayPlan).some(Boolean),
    [dayPlan],
  );

  const applyWeekAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= weeks.length) return;
      if (index === visibleIndexRef.current) return;
      visibleIndexRef.current = index;
      const offset = weekdayOffsetInWeek(selectedDate);
      const nextKeys = getWeekDateKeys(weeks[index]);
      const nextDate = nextKeys[offset] ?? nextKeys[0];
      if (nextDate !== selectedDate) {
        onSelectedDateChange(nextDate);
      }
    },
    [onSelectedDateChange, selectedDate, weeks],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const width = pageWidthRef.current;
      if (width <= 0) return;
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      applyWeekAtIndex(index);
    },
    [applyWeekAtIndex],
  );

  return (
    <YStack width="100%" gap="$2">
      <XStack width="100%" justifyContent="space-between" alignItems="flex-start" gap="$2">
        <AppText variant="title">Calendario</AppText>
        <YStack alignItems="flex-end" flexShrink={1} gap="$0.5">
          <AppText variant="caption" muted textAlign="right">
            {selectedLabel}
          </AppText>
          <AppText variant="label" textAlign="right">
            {formatItalianTime(now)}
          </AppText>
        </YStack>
      </XStack>

      <AppText variant="caption" muted>
        {hasTherapyDays
          ? "Teal: giorni terapia · Blu: eventi del calendario del telefono"
          : "Blu: eventi del calendario del telefono"}
      </AppText>

      <YStack
        width="100%"
        onLayout={(event) => {
          const width = Math.round(event.nativeEvent.layout.width);
          if (width <= 0 || width === pageWidthRef.current) return;
          pageWidthRef.current = width;
          setPageWidth(width);
        }}
      >
        {pageWidth > 0 ? (
          <FlatList
            ref={listRef}
            data={weeks}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(week) => formatDateKey(week)}
            extraData={`${selectedDate}:${todayKey}:${Object.keys(deviceMarks).join(",")}`}
            getItemLayout={(_, index) => ({
              length: pageWidth,
              offset: pageWidth * index,
              index,
            })}
            initialScrollIndex={selectedWeekIndex >= 0 ? selectedWeekIndex : WEEK_WINDOW_PAST}
            windowSize={5}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            snapToInterval={pageWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollToIndexFailed={({ index }) => {
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({ index, animated: false });
              });
            }}
            renderItem={({ item: weekStart }) => (
              <WeekPage
                weekStart={weekStart}
                pageWidth={pageWidth}
                selectedDate={selectedDate}
                todayKey={todayKey}
                dayPlan={dayPlan}
                deviceMarks={deviceMarks}
                onSelectDate={onSelectedDateChange}
              />
            )}
          />
        ) : (
          <YStack height={88} />
        )}
      </YStack>

      {isLoadingDeviceEvents ? (
        <XStack alignItems="center" gap="$2">
          <ActivityIndicator
            size="small"
            color={onBrand ? pillappColors.onPrimary : pillappColors.secondary}
          />
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

function WeekPage({
  weekStart,
  pageWidth,
  selectedDate,
  todayKey,
  dayPlan,
  deviceMarks,
  onSelectDate,
}: {
  weekStart: Date;
  pageWidth: number;
  selectedDate: string;
  todayKey: string;
  dayPlan: TherapyDayPlan;
  deviceMarks: MarkedDates;
  onSelectDate: (date: string) => void;
}) {
  const dateKeys = getWeekDateKeys(weekStart);

  return (
    <XStack width={pageWidth} alignItems="stretch">
      {dateKeys.map((dateKey) => (
        <DayCell
          key={dateKey}
          dateKey={dateKey}
          selected={dateKey === selectedDate}
          isToday={dateKey === todayKey}
          hasTherapy={Boolean(dayPlan[dateToTherapyDayKey(parseDateKey(dateKey))])}
          hasDeviceEvent={Boolean(deviceMarks[dateKey]?.marked)}
          onPress={() => onSelectDate(dateKey)}
        />
      ))}
    </XStack>
  );
}

function DayCell({
  dateKey,
  selected,
  isToday,
  hasTherapy,
  hasDeviceEvent,
  onPress,
}: {
  dateKey: string;
  selected: boolean;
  isToday: boolean;
  hasTherapy: boolean;
  hasDeviceEvent: boolean;
  onPress: () => void;
}) {
  const onBrand = useCardSurface() === "brand";
  const date = parseDateKey(dateKey);
  const weekday = dateToTherapyDayKey(date);
  const dayNumber = String(date.getDate());

  const a11yBits = [
    formatItalianDate(date),
    isToday ? "oggi" : null,
    selected ? "selezionato" : null,
    hasTherapy ? "giorno di terapia" : null,
    hasDeviceEvent ? "eventi in calendario" : null,
  ].filter(Boolean);

  const selectedBg = onBrand ? pillappColors.surface : pillappColors.secondary;
  const todayBorder = onBrand ? "rgba(255,255,255,0.9)" : pillappColors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={a11yBits.join(", ")}
      style={{ flex: 1, minWidth: 0 }}
    >
      <YStack alignItems="center" gap="$1" paddingVertical="$1.5" paddingHorizontal={2}>
        <AppText
          variant="overline"
          muted={!selected && !isToday}
          color={selected ? (onBrand ? "inverse" : "secondary") : undefined}
          speakOnPress={false}
        >
          {weekday}
        </AppText>
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          alignItems="center"
          justifyContent="center"
          backgroundColor={selected ? selectedBg : "transparent"}
          borderWidth={isToday && !selected ? 1.5 : 0}
          borderColor={todayBorder}
        >
          <AppText
            variant="label"
            color={
              selected
                ? onBrand
                  ? "primary"
                  : "inverse"
                : isToday
                  ? onBrand
                    ? "inverse"
                    : "primary"
                  : undefined
            }
            speakOnPress={false}
            fontWeight={selected || isToday ? "700" : "500"}
          >
            {dayNumber}
          </AppText>
        </YStack>
        <XStack minHeight={8} alignItems="center" gap={3}>
          {hasTherapy ? (
            <YStack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={onBrand ? "rgba(255,255,255,0.92)" : pillappColors.secondary}
            />
          ) : null}
          {hasDeviceEvent ? (
            <YStack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={onBrand ? "rgba(255,255,255,0.55)" : pillappColors.primary}
            />
          ) : null}
        </XStack>
      </YStack>
    </Pressable>
  );
}
