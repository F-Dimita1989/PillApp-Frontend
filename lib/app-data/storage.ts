import AsyncStorage from "@react-native-async-storage/async-storage";

import { formatDateKey } from "@/lib/calendar/week-utils";
import { DEFAULT_PROFILE_AVATAR_ID } from "@/constants/profile-avatars";
import type {
  DoseEvent,
  JournalNote,
  MeasurementEntry,
  Medication,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

export const APP_DATA_STORAGE_KEY = "pillapp:appData";

export type ProfilePrefs = Pick<
  UserProfile,
  | "avatarId"
  | "notificationsEnabled"
  | "notificationSoundEnabled"
  | "notificationSoundId"
  | "largeText"
  | "highContrast"
  | "reduceMotion"
  | "easyTap"
  | "hapticsEnabled"
  | "speechEnabled"
  | "scanHintsEnabled"
>;

export type PersistedAppData = {
  medications: Medication[];
  dosesToday: DoseEvent[];
  measurements: MeasurementEntry[];
  symptoms: SymptomEntry[];
  journalNotes: JournalNote[];
  profilePrefs: ProfilePrefs;
};

export const DEFAULT_PROFILE_PREFS: ProfilePrefs = {
  avatarId: DEFAULT_PROFILE_AVATAR_ID,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  notificationSoundId: "default",
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  easyTap: false,
  hapticsEnabled: true,
  speechEnabled: false,
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
  const today = formatDateKey(new Date());
  const savedMap = new Map<string, DoseEvent>(
    saved
      .filter((d) => d.date === today)
      .map((d) => [`${d.medicationId}-${d.scheduledTime}`, d]),
  );

  return generated.map((dose) => {
    const key = `${dose.medicationId}-${dose.scheduledTime}`;
    const existing = savedMap.get(key);
    if (!existing) return dose;

    const keepUserStatus =
      existing.status === "taken" ||
      existing.status === "skipped" ||
      existing.status === "snoozed";

    return {
      ...dose,
      status: keepUserStatus ? existing.status : dose.status,
      note: existing.note,
      confirmedAt: existing.confirmedAt,
    };
  });
}
