import { DEFAULT_NOTIFICATION_LEAD_ID } from "@/constants/therapy-notification-lead";
import { DEFAULT_NOTIFICATION_REPEAT_ID } from "@/constants/therapy-notification-repeat";
import { getGuestProfile } from "@/lib/profile/storage";
import { getTherapyPlan } from "@/lib/therapy/plan-storage";

import {
  DEFAULT_PROFILE_PREFS,
  loadPersistedAppData,
  mergeDoseStatuses,
  type PersistedAppData,
  type ProfilePrefs,
} from "@/lib/app-data/storage";
import {
  buildDosesForToday,
  medicationFromTherapyPlan,
  mergeMedicationsWithTherapy,
} from "@/lib/app-data/sync";
import type { Medication, UserProfile } from "@/types/domain";

import type { AppDataState } from "./types";

export type { AppDataState };

function prefsFromProfile(profile: UserProfile): ProfilePrefs {
  return {
    avatarId: profile.avatarId,
    notificationsEnabled: profile.notificationsEnabled,
    notificationSoundEnabled: profile.notificationSoundEnabled,
    notificationSoundId: profile.notificationSoundId,
    largeText: profile.largeText,
    highContrast: profile.highContrast,
    reduceMotion: profile.reduceMotion,
    easyTap: profile.easyTap,
    hapticsEnabled: profile.hapticsEnabled,
    speechEnabled: profile.speechEnabled === true,
    scanHintsEnabled: profile.scanHintsEnabled,
  };
}

export const EMPTY_APP_STATE: AppDataState = {
  profile: {
    name: "",
    ...DEFAULT_PROFILE_PREFS,
  },
  medications: [],
  dosesToday: [],
  measurements: [],
  symptoms: [],
  journalNotes: [],
};

function withNotificationDefaults(medications: Medication[]): Medication[] {
  return medications.map((med) => ({
    ...med,
    notificationLeadId: med.notificationLeadId ?? DEFAULT_NOTIFICATION_LEAD_ID,
    notificationRepeatId: med.notificationRepeatId ?? DEFAULT_NOTIFICATION_REPEAT_ID,
  }));
}

export async function hydrateAppState(): Promise<AppDataState> {
  const [guest, therapyPlan, persisted] = await Promise.all([
    getGuestProfile(),
    getTherapyPlan(),
    loadPersistedAppData(),
  ]);

  const prefs: ProfilePrefs = {
    ...DEFAULT_PROFILE_PREFS,
    ...(persisted?.profilePrefs ?? {}),
  };

  const profile: UserProfile = {
    name: guest?.name?.trim() ?? "",
    birthYear: guest?.age ? new Date().getFullYear() - guest.age : undefined,
    sex: guest?.sex,
    ...prefs,
  };

  const therapyMed =
    therapyPlan?.farmacoNome?.trim() ? medicationFromTherapyPlan(therapyPlan) : null;

  const medications = withNotificationDefaults(
    mergeMedicationsWithTherapy(persisted?.medications ?? [], therapyMed),
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
    profilePrefs: prefsFromProfile(state.profile),
  };
}
