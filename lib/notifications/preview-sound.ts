import * as Notifications from "expo-notifications";

import { getTherapyReminderSound } from "@/constants/therapy-reminder-sounds";
import {
  ensureNotificationPermissions,
  getNotificationChannelId,
  getNotificationSoundPayload,
} from "@/lib/notifications/setup";

export async function previewReminderSound(
  soundId: string,
  playSound: boolean,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error("Permesso notifiche non concesso. Attivalo dalle impostazioni del telefono.");
  }

  const option = getTherapyReminderSound(soundId);
  const sound = getNotificationSoundPayload(soundId, playSound);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: playSound ? "Prova suoneria PillApp" : "Prova promemoria silenzioso",
      body: playSound
        ? `${option.label}: così suonerà il promemoria dei farmaci.`
        : "Nessun suono, solo vibrazione e avviso visivo.",
      sound: sound ?? undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: getNotificationChannelId(soundId, playSound),
    },
  });
}
