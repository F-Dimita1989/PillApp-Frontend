import AsyncStorage from "@react-native-async-storage/async-storage";

import { HAS_SEEN_ONBOARDING_KEY } from "@/constants/onboarding";
import {
  getGuestProfile,
  hasCompletedSetup,
  saveGuestProfile,
} from "@/lib/profile/storage";

export async function getHasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
  return value === "true";
}

export async function markOnboardingAsSeen(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true");
}

/** Salta benvenuto e intro, crea profilo minimo se serve e va alla home. */
export async function skipOnboardingToHome(): Promise<void> {
  await markOnboardingAsSeen();

  const setupDone = await hasCompletedSetup();
  if (setupDone) {
    return;
  }

  const existing = await getGuestProfile();
  if (existing?.setupCompletedAt) {
    return;
  }

  await saveGuestProfile({
    name: "Ospite",
    age: 30,
    sex: "prefer_not_to_say",
    privacyAcknowledgedAt: new Date().toISOString(),
    therapySkipped: true,
  });
}
