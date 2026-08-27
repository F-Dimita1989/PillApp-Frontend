import type { UserProfile } from "@/types/domain";

export type AccessibilityPrefs = {
  largeText: boolean;
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  easyTap: boolean;
  hapticsEnabled: boolean;
  speechEnabled: boolean;
};

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  largeText: false,
  fontScale: 1,
  highContrast: false,
  reduceMotion: false,
  easyTap: false,
  hapticsEnabled: true,
  speechEnabled: false,
};

/** Scala in-app per «Testo più grande» (indipendente dal sistema). */
export const LARGE_TEXT_SCALE = 1.32;

export function scaleFontSize(size: number, fontScale: number): number {
  return Math.round(size * fontScale);
}

export function accessibilityPrefsFromProfile(
  profile: Pick<
    UserProfile,
    | "largeText"
    | "highContrast"
    | "reduceMotion"
    | "easyTap"
    | "hapticsEnabled"
    | "speechEnabled"
  >,
): AccessibilityPrefs {
  return {
    largeText: profile.largeText,
    fontScale: profile.largeText ? LARGE_TEXT_SCALE : 1,
    highContrast: profile.highContrast,
    reduceMotion: profile.reduceMotion,
    easyTap: profile.easyTap,
    hapticsEnabled: profile.hapticsEnabled,
    speechEnabled: profile.speechEnabled === true,
  };
}
