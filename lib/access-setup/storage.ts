import AsyncStorage from "@react-native-async-storage/async-storage";

import { HAS_COMPLETED_ACCESS_SETUP_KEY } from "@/constants/access-setup";
import { GUEST_PROFILE_KEY } from "@/constants/profile";
import type { GuestProfile } from "@/lib/profile/storage";

export async function getHasCompletedAccessSetup(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HAS_COMPLETED_ACCESS_SETUP_KEY);
  return value === "true";
}

async function acknowledgePrivacyInProfile(): Promise<void> {
  const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
  if (!raw) {
    return;
  }

  try {
    const profile = JSON.parse(raw) as GuestProfile;
    const updated: GuestProfile = {
      ...profile,
      privacyAcknowledgedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));
  } catch {
    // Profilo non valido: il passo privacy resta comunque registrato nel setup accessi.
  }
}

export async function markAccessSetupComplete(): Promise<void> {
  await AsyncStorage.setItem(HAS_COMPLETED_ACCESS_SETUP_KEY, "true");
  await acknowledgePrivacyInProfile();
}
