export type TherapyReminderSoundId = "default" | "soft" | "alert";

export type TherapyReminderSoundOption = {
  id: TherapyReminderSoundId;
  label: string;
  description: string;
  channelId: string;
};

export const THERAPY_REMINDER_SOUNDS: TherapyReminderSoundOption[] = [
  {
    id: "default",
    label: "Campanello predefinito",
    description: "Suono standard del telefono",
    channelId: "therapy-reminders",
  },
  {
    id: "soft",
    label: "Suono delicato",
    description: "Vibrazione leggera, tono più soft",
    channelId: "therapy-reminders-soft",
  },
  {
    id: "alert",
    label: "Suono di attenzione",
    description: "Più evidente per non dimenticare",
    channelId: "therapy-reminders-alert",
  },
];

export function getTherapyReminderSound(
  soundId: string,
): TherapyReminderSoundOption {
  return (
    THERAPY_REMINDER_SOUNDS.find((option) => option.id === soundId) ??
    THERAPY_REMINDER_SOUNDS[0]
  );
}
