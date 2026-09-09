import * as Calendar from "expo-calendar";

export async function ensureCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") {
    return true;
  }

  const request = await Calendar.requestCalendarPermissionsAsync();
  return request.status === "granted";
}
