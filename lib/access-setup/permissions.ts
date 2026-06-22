import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";

import { ensureCalendarPermission } from "@/lib/calendar/device-calendar";
import { configureNotificationChannel } from "@/lib/notifications/setup";

export type AppPermissionKind = "camera" | "gallery" | "notifications" | "calendar";

export type AppPermissionStatus = "granted" | "denied" | "undetermined";

export type AppPermissionState = {
  kind: AppPermissionKind;
  status: AppPermissionStatus;
};

function mapExpoStatus(status: string): AppPermissionStatus {
  if (status === "granted") {
    return "granted";
  }
  if (status === "denied") {
    return "denied";
  }
  return "undetermined";
}

async function getCameraStatus(): Promise<AppPermissionStatus> {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return mapExpoStatus(status);
}

async function getGalleryStatus(): Promise<AppPermissionStatus> {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return mapExpoStatus(status);
}

async function getNotificationsStatus(): Promise<AppPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return mapExpoStatus(status);
}

async function getCalendarStatus(): Promise<AppPermissionStatus> {
  const Calendar = await import("expo-calendar");
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return mapExpoStatus(status);
}

export async function getAppPermissionStates(): Promise<AppPermissionState[]> {
  const [camera, gallery, notifications, calendar] = await Promise.all([
    getCameraStatus(),
    getGalleryStatus(),
    getNotificationsStatus(),
    getCalendarStatus(),
  ]);

  return [
    { kind: "camera", status: camera },
    { kind: "gallery", status: gallery },
    { kind: "notifications", status: notifications },
    { kind: "calendar", status: calendar },
  ];
}

async function requestCameraPermission(): Promise<AppPermissionStatus> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return mapExpoStatus(status);
}

async function requestGalleryPermission(): Promise<AppPermissionStatus> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return mapExpoStatus(status);
}

async function requestNotificationsPermission(): Promise<AppPermissionStatus> {
  await configureNotificationChannel();
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return mapExpoStatus(status);
}

async function requestCalendarPermission(): Promise<AppPermissionStatus> {
  const granted = await ensureCalendarPermission();
  return granted ? "granted" : "denied";
}

export async function requestAppPermission(
  kind: AppPermissionKind,
): Promise<AppPermissionStatus> {
  switch (kind) {
    case "camera":
      return requestCameraPermission();
    case "gallery":
      return requestGalleryPermission();
    case "notifications":
      return requestNotificationsPermission();
    case "calendar":
      return requestCalendarPermission();
  }
}

export async function requestAllAppPermissions(): Promise<AppPermissionState[]> {
  const kinds: AppPermissionKind[] = [
    "camera",
    "gallery",
    "notifications",
    "calendar",
  ];
  const results: AppPermissionState[] = [];

  for (const kind of kinds) {
    const status = await requestAppPermission(kind);
    results.push({ kind, status });
  }

  return results;
}

export function allPermissionsGranted(states: AppPermissionState[]): boolean {
  return states.every((entry) => entry.status === "granted");
}
