import AsyncStorage from "@react-native-async-storage/async-storage";

import { GUEST_PROFILE_KEY } from "@/constants/profile";

export type GuestProfile = {
  name: string;
  createdAt: string;
  privacyAcknowledgedAt: string;
};

export async function getGuestProfile(): Promise<GuestProfile | null> {
  const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GuestProfile;
  } catch {
    return null;
  }
}

export async function saveGuestProfile(name: string): Promise<void> {
  const now = new Date().toISOString();
  const profile: GuestProfile = {
    name: name.trim(),
    createdAt: now,
    privacyAcknowledgedAt: now,
  };

  await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
}

export async function hasCompletedSetup(): Promise<boolean> {
  const profile = await getGuestProfile();
  return Boolean(profile?.name?.trim());
}
