import * as Notifications from "expo-notifications";

import { getTherapyReminderSound } from "@/constants/therapy-reminder-sounds";
import {
  ensureNotificationPermissions,
  getNotificationChannelId,
  getNotificationSoundPayload,
} from "@/lib/notifications/setup";

const PREVIEW_NOTIFICATION_ID = "pillapp-sound-preview";

export async function previewReminderSound(
  soundId: string,
  playSound: boolean,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error("Permesso notifiche non concesso. Attivalo dalle impostazioni del telefono.");
  }

  await Notifications.cancelScheduledNotificationAsync(PREVIEW_NOTIFICATION_ID).catch(
    () => undefined,
  );
  await Notifications.dismissNotificationAsync(PREVIEW_NOTIFICATION_ID).catch(
    () => undefined,
  );

  const option = getTherapyReminderSound(soundId);
  const sound = getNotificationSoundPayload(soundId, playSound);

  await Notifications.scheduleNotificationAsync({
    identifier: PREVIEW_NOTIFICATION_ID,
    content: {
      title: playSound ? "Prova suoneria PillApp" : "Prova promemoria silenzioso",
      body: playSound
        ? `${option.label}: così suonerà il promemoria dei farmaci.`
        : "Nessun suono, solo vibrazione e avviso visivo.",
      sound: sound ?? undefined,
    },
    trigger: {
      channelId: getNotificationChannelId(soundId, playSound),
    },
  });
}
