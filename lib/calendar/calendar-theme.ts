import { pillappColors } from "@/theme/tokens";

/** Tema condiviso per react-native-calendars */
export const pillappCalendarTheme = {
  backgroundColor: "transparent",
  calendarBackground: "transparent",
  textSectionTitleColor: pillappColors.textPrimary,
  selectedDayBackgroundColor: pillappColors.primary,
  selectedDayTextColor: pillappColors.onPrimary,
  todayTextColor: pillappColors.primary,
  dayTextColor: pillappColors.textPrimary,
  textDisabledColor: pillappColors.border,
  arrowColor: pillappColors.primary,
  monthTextColor: pillappColors.textPrimary,
  indicatorColor: pillappColors.primary,
} as const;
