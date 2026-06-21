import { getGuestProfile } from "@/lib/profile/storage";
import { getTherapyPlan } from "@/lib/therapy/plan-storage";

import {
  DEFAULT_PROFILE_PREFS,
  loadPersistedAppData,
  mergeDoseStatuses,
  type PersistedAppData,
} from "@/lib/app-data/storage";
import {
  buildDosesForToday,
  medicationFromTherapyPlan,
  mergeMedicationsWithTherapy,
} from "@/lib/app-data/sync";
import type { UserProfile } from "@/types/domain";

import type { AppDataState } from "./types";

export type { AppDataState };

export const EMPTY_APP_STATE: AppDataState = {
  profile: {
    name: "",
    notificationsEnabled: DEFAULT_PROFILE_PREFS.notificationsEnabled,
    largeText: DEFAULT_PROFILE_PREFS.largeText,
    scanHintsEnabled: DEFAULT_PROFILE_PREFS.scanHintsEnabled,
  },
  medications: [],
  dosesToday: [],
  measurements: [],
  symptoms: [],
  journalNotes: [],
};

export async function hydrateAppState(): Promise<AppDataState> {
  const [guest, therapyPlan, persisted] = await Promise.all([
    getGuestProfile(),
    getTherapyPlan(),
    loadPersistedAppData(),
  ]);

  const profile: UserProfile = {
    name: guest?.name?.trim() ?? "",
    birthYear: guest?.age
      ? new Date().getFullYear() - guest.age
      : undefined,
    notificationsEnabled:
      persisted?.profilePrefs.notificationsEnabled ??
      DEFAULT_PROFILE_PREFS.notificationsEnabled,
    largeText: persisted?.profilePrefs.largeText ?? DEFAULT_PROFILE_PREFS.largeText,
    scanHintsEnabled:
      persisted?.profilePrefs.scanHintsEnabled ??
      DEFAULT_PROFILE_PREFS.scanHintsEnabled,
  };

  const therapyMed =
    therapyPlan?.farmacoNome?.trim() ? medicationFromTherapyPlan(therapyPlan) : null;

  const medications = mergeMedicationsWithTherapy(
    persisted?.medications ?? [],
    therapyMed,
  );

  const generatedDoses = buildDosesForToday(medications);
  const dosesToday = mergeDoseStatuses(generatedDoses, persisted?.dosesToday ?? []);

  return {
    profile,
    medications,
    dosesToday,
    measurements: persisted?.measurements ?? [],
    symptoms: persisted?.symptoms ?? [],
    journalNotes: persisted?.journalNotes ?? [],
  };
}

export function toPersistedData(state: AppDataState): PersistedAppData {
  return {
    medications: state.medications,
    dosesToday: state.dosesToday,
    measurements: state.measurements,
    symptoms: state.symptoms,
    journalNotes: state.journalNotes,
    profilePrefs: {
      notificationsEnabled: state.profile.notificationsEnabled,
      largeText: state.profile.largeText,
      scanHintsEnabled: state.profile.scanHintsEnabled,
    },
  };
}
