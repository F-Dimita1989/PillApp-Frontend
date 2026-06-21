export type TherapyNotificationLeadId =
  | "0"
  | "5"
  | "10"
  | "15"
  | "30"
  | "60";

export type TherapyNotificationLeadOption = {
  id: TherapyNotificationLeadId;
  label: string;
  minutes: number;
};

export const THERAPY_NOTIFICATION_LEAD_OPTIONS: TherapyNotificationLeadOption[] =
  [
    { id: "0", label: "All'orario esatto", minutes: 0 },
    { id: "5", label: "5 minuti prima", minutes: 5 },
    { id: "10", label: "10 minuti prima", minutes: 10 },
    { id: "15", label: "15 minuti prima", minutes: 15 },
    { id: "30", label: "30 minuti prima", minutes: 30 },
    { id: "60", label: "1 ora prima", minutes: 60 },
  ];

export const DEFAULT_NOTIFICATION_LEAD_ID: TherapyNotificationLeadId = "15";

export function therapyLeadIdToMinutes(id: TherapyNotificationLeadId): number {
  return (
    THERAPY_NOTIFICATION_LEAD_OPTIONS.find((option) => option.id === id)?.minutes ??
    15
  );
}

export function therapyLeadMinutesToId(minutes: number): TherapyNotificationLeadId {
  const match = THERAPY_NOTIFICATION_LEAD_OPTIONS.find(
    (option) => option.minutes === minutes,
  );
  return match?.id ?? DEFAULT_NOTIFICATION_LEAD_ID;
}
