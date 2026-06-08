export const THERAPY_DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] as const;

export type TherapyDayKey = (typeof THERAPY_DAYS)[number];

export type TherapyDayPlan = Record<TherapyDayKey, boolean>;

export const INITIAL_THERAPY_DAY_PLAN: TherapyDayPlan = {
  Lun: true,
  Mar: true,
  Mer: true,
  Gio: true,
  Ven: true,
  Sab: false,
  Dom: false,
};

export const THERAPY_DAY_TO_WEEKDAY: Record<
  TherapyDayKey,
  1 | 2 | 3 | 4 | 5 | 6 | 7
> = {
  Dom: 1,
  Lun: 2,
  Mar: 3,
  Mer: 4,
  Gio: 5,
  Ven: 6,
  Sab: 7,
};

/** Da Date.getDay() (0=Dom) a chiave terapia. */
export function dateToTherapyDayKey(date: Date): TherapyDayKey {
  const map: TherapyDayKey[] = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  return map[date.getDay()];
}
