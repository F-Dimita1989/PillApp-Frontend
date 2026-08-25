import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { pillappColors } from "@/theme/tokens";
import {
  SILENT_REMINDER_CHANNEL_ID,
  THERAPY_REMINDER_SOUNDS,
  getTherapyReminderSound,
} from "@/constants/therapy-reminder-sounds";

const THERAPY_CHANNEL_ID = THERAPY_REMINDER_SOUNDS[0].channelId;

export function registerNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function configureReminderChannel(
  channelId: string,
  name: string,
  description: string,
  vibrationPattern: number[],
  sound: string | null,
): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    description,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern,
    lightColor: pillappColors.primary,
    sound: sound ?? undefined,
    enableVibrate: true,
    showBadge: true,
  });
}

export async function configureNotificationChannel(): Promise<void> {
  for (const option of THERAPY_REMINDER_SOUNDS) {
    await configureReminderChannel(
      option.channelId,
      option.label,
      option.description,
      option.vibrationPattern,
      option.fileName,
    );
  }

  await configureReminderChannel(
    SILENT_REMINDER_CHANNEL_ID,
    "Promemoria silenziosi",
    "Solo vibrazione, senza suono",
    [0, 280, 160, 280],
    null,
  );
}

export function getNotificationChannelId(
  soundId: string,
  playSound = true,
): string {
  if (!playSound) {
    return SILENT_REMINDER_CHANNEL_ID;
  }
  return getTherapyReminderSound(soundId).channelId;
}

export function getNotificationSoundPayload(
  soundId: string,
  enabled: boolean,
): boolean | string | null {
  if (!enabled) {
    return null;
  }
  return getTherapyReminderSound(soundId).fileName;
}

export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  await configureNotificationChannel();

  const current = await getNotificationPermissionStatus();
  if (current === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === "granted";
}

export async function initializeNotifications(): Promise<NotificationPermissionStatus> {
  registerNotificationHandler();
  await configureNotificationChannel();
  return getNotificationPermissionStatus();
}

export { THERAPY_CHANNEL_ID, THERAPY_REMINDER_SOUNDS };
