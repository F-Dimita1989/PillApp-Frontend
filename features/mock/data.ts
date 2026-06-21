import type {
  DoseEvent,
  JournalNote,
  MeasurementEntry,
  Medication,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

const today = new Date().toISOString().slice(0, 10);

export const MOCK_PROFILE: UserProfile = {
  name: "Maria",
  birthYear: 1958,
  notificationsEnabled: true,
  largeText: false,
  scanHintsEnabled: true,
};

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "med-ramipril",
    name: "Ramipril",
    aic: "027428012",
    form: "compressa",
    dose: "1 compressa da 5 mg",
    schedule: {
      times: ["08:00"],
      daysActive: [true, true, true, true, true, true, true],
    },
    notes: "Assumere a stomaco vuoto",
    active: true,
    createdAt: "2026-01-10T09:00:00.000Z",
    source: "aic_scan",
  },
  {
    id: "med-metformina",
    name: "Metformina",
    aic: "035621025",
    form: "compressa",
    dose: "1 compressa da 850 mg",
    schedule: {
      times: ["08:00", "20:00"],
      daysActive: [true, true, true, true, true, true, true],
    },
    active: true,
    createdAt: "2026-01-12T11:00:00.000Z",
    source: "manual",
  },
  {
    id: "med-atorvastatina",
    name: "Atorvastatina",
    form: "compressa",
    dose: "1 compressa da 20 mg",
    schedule: {
      times: ["22:00"],
      daysActive: [true, true, true, true, true, true, true],
    },
    active: true,
    createdAt: "2026-02-01T08:00:00.000Z",
    source: "manual",
  },
  {
    id: "med-omeprazolo",
    name: "Omeprazolo",
    form: "capsula",
    dose: "1 capsula da 20 mg",
    schedule: {
      times: ["07:45"],
      daysActive: [true, true, true, true, true, true, true],
    },
    active: true,
    createdAt: "2026-02-15T07:00:00.000Z",
    source: "aic_scan",
  },
];

export const MOCK_DOSES_TODAY: DoseEvent[] = [
  {
    id: "dose-1",
    medicationId: "med-omeprazolo",
    medicationName: "Omeprazolo",
    scheduledTime: "07:45",
    date: today,
    status: "taken",
    dose: "1 capsula da 20 mg",
    confirmedAt: `${today}T07:50:00.000Z`,
  },
  {
    id: "dose-2",
    medicationId: "med-ramipril",
    medicationName: "Ramipril",
    scheduledTime: "08:00",
    date: today,
    status: "taken",
    dose: "1 compressa da 5 mg",
    confirmedAt: `${today}T08:05:00.000Z`,
  },
  {
    id: "dose-3",
    medicationId: "med-metformina",
    medicationName: "Metformina",
    scheduledTime: "08:00",
    date: today,
    status: "due_soon",
    dose: "1 compressa da 850 mg",
  },
  {
    id: "dose-4",
    medicationId: "med-metformina",
    medicationName: "Metformina",
    scheduledTime: "20:00",
    date: today,
    status: "pending",
    dose: "1 compressa da 850 mg",
  },
  {
    id: "dose-5",
    medicationId: "med-atorvastatina",
    medicationName: "Atorvastatina",
    scheduledTime: "22:00",
    date: today,
    status: "pending",
    dose: "1 compressa da 20 mg",
  },
];

export const MOCK_MEASUREMENTS: MeasurementEntry[] = [
  {
    id: "meas-1",
    kind: "pressure",
    label: "Pressione",
    value: "128/82",
    unit: "mmHg",
    recordedAt: `${today}T09:15:00.000Z`,
  },
  {
    id: "meas-2",
    kind: "glucose",
    label: "Glicemia",
    value: "98",
    unit: "mg/dL",
    recordedAt: `${today}T09:15:00.000Z`,
  },
  {
    id: "meas-3",
    kind: "weight",
    label: "Peso",
    value: "72.4",
    unit: "kg",
    recordedAt: `${today}T07:30:00.000Z`,
  },
];

export const MOCK_SYMPTOMS: SymptomEntry[] = [
  {
    id: "sym-1",
    label: "Leggera stanchezza",
    severity: 2,
    recordedAt: `${today}T10:00:00.000Z`,
  },
];

export const MOCK_JOURNAL_NOTES: JournalNote[] = [
  {
    id: "note-1",
    mood: "buono",
    text: "Mattinata tranquilla, terapia regolare.",
    recordedAt: `${today}T10:30:00.000Z`,
  },
];
