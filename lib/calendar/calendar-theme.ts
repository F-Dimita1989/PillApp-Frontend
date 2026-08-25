import { pillappColors } from "@/theme/tokens";

/** Tema condiviso per react-native-calendars */
export const pillappCalendarTheme = {
  backgroundColor: "transparent",
  calendarBackground: "transparent",
  textSectionTitleColor: pillappColors.textPrimary,
  selectedDayBackgroundColor: pillappColors.secondary,
  selectedDayTextColor: pillappColors.onSecondary,
  todayTextColor: pillappColors.primary,
  dayTextColor: pillappColors.textPrimary,
  textDisabledColor: pillappColors.border,
  arrowColor: pillappColors.secondary,
  monthTextColor: pillappColors.textPrimary,
  indicatorColor: pillappColors.primary,
} as const;

/** Stessi token, per calendario sopra card a gradiente. */
export const pillappCalendarThemeBrand = {
  ...pillappCalendarTheme,
  textSectionTitleColor: pillappColors.onPrimary,
  selectedDayBackgroundColor: pillappColors.surface,
  selectedDayTextColor: pillappColors.primary,
  todayTextColor: pillappColors.onPrimary,
  dayTextColor: "rgba(255,255,255,0.94)",
  textDisabledColor: "rgba(255,255,255,0.38)",
  arrowColor: pillappColors.onPrimary,
  monthTextColor: pillappColors.onPrimary,
  indicatorColor: pillappColors.surface,
  todayButtonTextColor: pillappColors.onPrimary,
} as const;
