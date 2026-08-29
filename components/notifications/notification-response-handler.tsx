import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { AppRoutes } from "@/features/navigation/routes";
import { CONFIRM_DOSE_ACTION_ID } from "@/lib/notifications/categories";

function readMedicationId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;
  const type = payload.type;
  if (type !== "dose_reminder" && type !== "dose_followup") return null;
  const medicationId = payload.medicationId;
  return typeof medicationId === "string" && medicationId.length > 0
    ? medicationId
    : null;
}

function shouldOpenMedicationCard(actionIdentifier: string): boolean {
  return (
    actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ||
    actionIdentifier === CONFIRM_DOSE_ACTION_ID
  );
}

export function NotificationResponseHandler() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;
    if (!shouldOpenMedicationCard(lastResponse.actionIdentifier)) return;

    const medicationId = readMedicationId(
      lastResponse.notification.request.content.data,
    );
    if (!medicationId) return;

    const key = `${lastResponse.notification.request.identifier}:${lastResponse.actionIdentifier}`;
    if (handledKeyRef.current === key) return;
    handledKeyRef.current = key;

    router.push(AppRoutes.medicationDetails(medicationId));
    Notifications.clearLastNotificationResponse();
  }, [lastResponse, router]);

  return null;
}
