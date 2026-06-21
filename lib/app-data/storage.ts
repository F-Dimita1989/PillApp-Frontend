import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  DoseEvent,
  DoseStatus,
  JournalNote,
  MeasurementEntry,
  Medication,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

export const APP_DATA_STORAGE_KEY = "pillapp:appData";

export type PersistedAppData = {
  medications: Medication[];
  dosesToday: DoseEvent[];
  measurements: MeasurementEntry[];
  symptoms: SymptomEntry[];
  journalNotes: JournalNote[];
  profilePrefs: Pick<
    UserProfile,
    "notificationsEnabled" | "largeText" | "scanHintsEnabled"
  >;
};

export const DEFAULT_PROFILE_PREFS: PersistedAppData["profilePrefs"] = {
  notificationsEnabled: true,
  largeText: false,
  scanHintsEnabled: true,
};

export async function loadPersistedAppData(): Promise<PersistedAppData | null> {
  const raw = await AsyncStorage.getItem(APP_DATA_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAppData>;
    return {
      medications: parsed.medications ?? [],
      dosesToday: parsed.dosesToday ?? [],
      measurements: parsed.measurements ?? [],
      symptoms: parsed.symptoms ?? [],
      journalNotes: parsed.journalNotes ?? [],
      profilePrefs: {
        ...DEFAULT_PROFILE_PREFS,
        ...(parsed.profilePrefs ?? {}),
      },
    };
  } catch {
    return null;
  }
}

export async function savePersistedAppData(data: PersistedAppData): Promise<void> {
  await AsyncStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
}

export function mergeDoseStatuses(
  generated: DoseEvent[],
  saved: DoseEvent[],
): DoseEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  const savedMap = new Map<string, DoseEvent>(
    saved
      .filter((d) => d.date === today)
      .map((d) => [`${d.medicationId}-${d.scheduledTime}`, d]),
  );

  return generated.map((dose) => {
    const key = `${dose.medicationId}-${dose.scheduledTime}`;
    const existing = savedMap.get(key);
    if (!existing) return dose;
    return {
      ...dose,
      status: existing.status,
      note: existing.note,
      confirmedAt: existing.confirmedAt,
    };
  });
}

export type DoseStatusPatch = Pick<DoseEvent, "id" | "status" | "note" | "confirmedAt">;
