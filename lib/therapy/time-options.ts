export type TherapyTimeOption = {
  value: string;
  label: string;
};

/** Opzioni orario ogni 30 minuti (06:00–23:30). */
export function buildTherapyTimeOptions(): TherapyTimeOption[] {
  const options: TherapyTimeOption[] = [];

  for (let hour = 6; hour <= 23; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 23 && minute === 30) {
        continue;
      }
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      options.push({ value, label: value });
    }
  }

  return options;
}

export const THERAPY_TIME_OPTIONS = buildTherapyTimeOptions();

export function nearestTherapyTimeOption(value: string): string {
  const trimmed = value.trim();
  if (THERAPY_TIME_OPTIONS.some((option) => option.value === trimmed)) {
    return trimmed;
  }
  return "08:00";
}
