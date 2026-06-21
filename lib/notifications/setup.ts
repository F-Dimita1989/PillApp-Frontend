import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { PillAppColors } from "@/constants/colors";
import {
  THERAPY_REMINDER_SOUNDS,
  getTherapyReminderSound,
} from "@/constants/therapy-reminder-sounds";

const THERAPY_CHANNEL_ID = "therapy-reminders";

/** Registra come mostrare le notifiche quando l'app è aperta o in background. */
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
): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    description,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern,
    lightColor: PillAppColors.primary,
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

/** Canali Android per i promemoria farmaci (suonerie diverse). */
export async function configureNotificationChannel(): Promise<void> {
  await configureReminderChannel(
    "therapy-reminders",
    "Promemoria terapia",
    "Avvisi standard per l'assunzione dei farmaci",
    [0, 250, 250, 250],
  );
  await configureReminderChannel(
    "therapy-reminders-soft",
    "Promemoria delicati",
    "Avvisi con vibrazione più leggera",
    [0, 120, 80, 120],
  );
  await configureReminderChannel(
    "therapy-reminders-alert",
    "Promemoria attenzione",
    "Avvisi più evidenti per non dimenticare",
    [0, 400, 200, 400, 200, 400],
  );
}

export function getNotificationChannelId(soundId: string): string {
  return getTherapyReminderSound(soundId).channelId;
}

export function getNotificationSoundPayload(
  soundId: string,
  enabled: boolean,
): boolean | string | null {
  if (!enabled) {
    return null;
  }

  return "default";
}

export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

/**
 * Richiede il permesso notifiche all'utente.
 * Su Android 13+ serve POST_NOTIFICATIONS; su iOS il dialog di sistema.
 */
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
