import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { ensureExactAlarms } from "@/lib/notifications/exact-alarm";
import { pillappColors } from "@/theme/tokens";
import {
  SILENT_REMINDER_CHANNEL_ID,
  THERAPY_REMINDER_SOUNDS,
  getTherapyReminderSound,
} from "@/constants/therapy-reminder-sounds";

const ACTIVE_CHANNEL_IDS = new Set([
  ...THERAPY_REMINDER_SOUNDS.map((option) => option.channelId),
  SILENT_REMINDER_CHANNEL_ID,
]);

function registerNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function removeStaleReminderChannels(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  const channels = await Notifications.getNotificationChannelsAsync();
  await Promise.all(
    (channels ?? [])
      .filter(
        (channel) =>
          channel.id.startsWith("therapy-reminders") &&
          !ACTIVE_CHANNEL_IDS.has(channel.id),
      )
      .map((channel) => Notifications.deleteNotificationChannelAsync(channel.id)),
  );
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
    sound,
    enableVibrate: true,
    showBadge: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.NOTIFICATION,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

export async function configureNotificationChannel(): Promise<void> {
  await removeStaleReminderChannels();

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

async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export type NotificationPermissionReview = {
  granted: boolean;
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
};

/** Controlla e, se possibile, richiede il permesso. Su Android può aprire gli allarmi esatti. */
export async function reviewNotificationPermissions(): Promise<NotificationPermissionReview> {
  await configureNotificationChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") {
    await ensureExactAlarms({ prompt: true });
    return { granted: true, status: "granted", canAskAgain: true };
  }

  if (current.canAskAgain !== false) {
    const next = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    const granted = next.status === "granted";
    if (granted) {
      await ensureExactAlarms({ prompt: true });
    }
    return {
      granted,
      status: granted ? "granted" : next.status === "denied" ? "denied" : "undetermined",
      canAskAgain: next.canAskAgain !== false,
    };
  }

  return {
    granted: false,
    status: current.status === "denied" ? "denied" : "undetermined",
    canAskAgain: false,
  };
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
