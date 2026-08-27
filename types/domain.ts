/** Tipi di dominio PillApp — terapia, diario, profilo */

import type { GuestSex } from "@/constants/profile";
import type { ProfileAvatarId } from "@/constants/profile-avatars";
import type { TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import type { TherapyNotificationLeadId } from "@/constants/therapy-notification-lead";
import type { TherapyNotificationRepeatId } from "@/constants/therapy-notification-repeat";

export type MedicationFormType =
  | "compressa"
  | "gocce"
  | "capsula"
  | "iniezione"
  | "sciroppo"
  | "inalatore"
  | "crema";

export type DoseStatus =
  | "pending"
  | "due_soon"
  | "overdue"
  | "taken"
  | "skipped"
  | "snoozed";

export type MeasurementKind =
  | "pressure"
  | "glucose"
  | "weight"
  | "saturation";

export type MoodLevel = "ottimo" | "buono" | "cosi_cosi" | "male" | "pessimo";

export type MedicationSchedule = {
  times: string[];
  daysActive: boolean[];
  /** 0 = Dom … 6 = Sab */
};

export type QuantitaUnit = "pillole" | "ml" | "bustine";

export type Medication = {
  id: string;
  name: string;
  aic?: string;
  form: MedicationFormType;
  dose: string;
  schedule: MedicationSchedule;
  notes?: string;
  /** Pezzi o ml ancora disponibili in confezione */
  quantityRemaining?: string;
  quantityUnit?: QuantitaUnit;
  active: boolean;
  createdAt: string;
  source: "manual" | "aic_scan";
  /** Minuti di anticipo rispetto all'orario di assunzione */
  notificationLeadId?: TherapyNotificationLeadId;
  /** Ripeti l'avviso ogni N minuti fino all'orario esatto */
  notificationRepeatId?: TherapyNotificationRepeatId;
};

export type DoseEvent = {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  date: string;
  status: DoseStatus;
  dose: string;
  note?: string;
  confirmedAt?: string;
};

export type MeasurementEntry = {
  id: string;
  kind: MeasurementKind;
  label: string;
  value: string;
  unit: string;
  recordedAt: string;
  note?: string;
};

export type SymptomEntry = {
  id: string;
  label: string;
  severity: 1 | 2 | 3 | 4 | 5;
  recordedAt: string;
  note?: string;
};

export type JournalNote = {
  id: string;
  mood?: MoodLevel;
  text: string;
  recordedAt: string;
};

export type UserProfile = {
  name: string;
  birthYear?: number;
  sex?: GuestSex;
  caregiverEmail?: string;
  avatarId: ProfileAvatarId;
  notificationsEnabled: boolean;
  notificationSoundEnabled: boolean;
  notificationSoundId: TherapyReminderSoundId;
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  easyTap: boolean;
  hapticsEnabled: boolean;
  speechEnabled: boolean;
  scanHintsEnabled: boolean;
};

export const MEDICATION_FORM_LABELS: Record<MedicationFormType, string> = {
  compressa: "Compressa",
  gocce: "Gocce",
  capsula: "Capsula",
  iniezione: "Iniezione",
  sciroppo: "Sciroppo",
  inalatore: "Inalatore",
  crema: "Crema",
};

export const MEASUREMENT_LABELS: Record<MeasurementKind, string> = {
  pressure: "Pressione",
  glucose: "Glicemia",
  weight: "Peso",
  saturation: "Saturazione",
};
