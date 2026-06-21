import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  GUEST_PROFILE_KEY,
  MAX_GUEST_AGE,
  MIN_GUEST_AGE,
  type GuestSex,
} from "@/constants/profile";

export type GuestProfile = {
  name: string;
  age: number;
  sex: GuestSex;
  createdAt: string;
  privacyAcknowledgedAt: string;
  setupCompletedAt: string;
  therapyConfiguredAt?: string;
  therapySkipped?: boolean;
};

export type GuestProfileInput = {
  name: string;
  age: number;
  sex: GuestSex;
  privacyAcknowledgedAt: string;
  therapyConfiguredAt?: string;
  therapySkipped?: boolean;
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

export function isValidGuestAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_GUEST_AGE && age <= MAX_GUEST_AGE;
}

export async function saveGuestProfile(input: GuestProfileInput): Promise<void> {
  const now = new Date().toISOString();
  const profile: GuestProfile = {
    name: input.name.trim(),
    age: input.age,
    sex: input.sex,
    createdAt: now,
    privacyAcknowledgedAt: input.privacyAcknowledgedAt,
    setupCompletedAt: now,
    therapyConfiguredAt: input.therapyConfiguredAt,
    therapySkipped: input.therapySkipped,
  };

  await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
}

export async function hasCompletedSetup(): Promise<boolean> {
  const profile = await getGuestProfile();
  if (!profile?.name?.trim()) {
    return false;
  }

  if (!isValidGuestAge(profile.age)) {
    return false;
  }

  if (!profile.sex) {
    return false;
  }

  if (!profile.setupCompletedAt) {
    return false;
  }

  const therapyHandled = Boolean(
    profile.therapyConfiguredAt || profile.therapySkipped,
  );

  return therapyHandled;
}
