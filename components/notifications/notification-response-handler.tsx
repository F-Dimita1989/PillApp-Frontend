import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { AppRoutes } from "@/features/navigation/routes";
import { CONFIRM_DOSE_ACTION_ID } from "@/lib/notifications/categories";

function readReminderPayload(data: unknown): {
  medicationId: string;
  doseId: string | null;
} | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;
  const type = payload.type;
  if (type !== "dose_reminder" && type !== "dose_followup") return null;
  const medicationId = payload.medicationId;
  if (typeof medicationId !== "string" || medicationId.length === 0) {
    return null;
  }
  const doseId =
    typeof payload.doseId === "string" && payload.doseId.length > 0
      ? payload.doseId
      : null;
  return { medicationId, doseId };
}

function shouldOpenMedicationCard(actionIdentifier: string): boolean {
  return (
    actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ||
    actionIdentifier === CONFIRM_DOSE_ACTION_ID
  );
}

type NotificationResponseHandlerProps = {
  isReady: boolean;
  markDoseTaken: (doseId: string) => void;
};

export function NotificationResponseHandler({
  isReady,
  markDoseTaken,
}: NotificationResponseHandlerProps) {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady || !lastResponse) return;
    if (!shouldOpenMedicationCard(lastResponse.actionIdentifier)) return;

    const payload = readReminderPayload(
      lastResponse.notification.request.content.data,
    );
    if (!payload) return;

    const key = `${lastResponse.notification.request.identifier}:${lastResponse.actionIdentifier}`;
    if (handledKeyRef.current === key) return;
    handledKeyRef.current = key;

    if (
      lastResponse.actionIdentifier === CONFIRM_DOSE_ACTION_ID &&
      payload.doseId
    ) {
      markDoseTaken(payload.doseId);
    }

    router.push(AppRoutes.medicationDetails(payload.medicationId));
    Notifications.clearLastNotificationResponse();
  }, [isReady, lastResponse, markDoseTaken, router]);

  return null;
}
