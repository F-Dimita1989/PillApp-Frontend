import * as Haptics from "expo-haptics";

export async function playAppHaptic(
  enabled: boolean,
  kind: "light" | "success" | "warning" = "light",
): Promise<void> {
  if (!enabled) return;
  try {
    if (kind === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    /* dispositivo senza motore aptico */
  }
}
