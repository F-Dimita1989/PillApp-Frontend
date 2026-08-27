import { Children, isValidElement, type ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import * as Speech from "expo-speech";

let runtimeEnabled = false;

export function setSpeechRuntimeEnabled(enabled: boolean): void {
  runtimeEnabled = enabled;
}

export function childrenToSpeakableText(node: ReactNode): string {
  const parts: string[] = [];

  Children.forEach(node, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (typeof child === "string" || typeof child === "number") {
      parts.push(String(child));
      return;
    }
    if (isValidElement(child)) {
      const nested = (child.props as { children?: ReactNode }).children;
      if (nested != null) parts.push(childrenToSpeakableText(nested));
    }
  });

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function speakAppText(
  text: string,
  options?: { force?: boolean; interrupt?: boolean },
): void {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  AccessibilityInfo.announceForAccessibility(cleaned);

  if (!options?.force && !runtimeEnabled) return;

  const max = Speech.maxSpeechInputLength;
  const utterance =
    typeof max === "number" && Number.isFinite(max) && max > 0
      ? cleaned.slice(0, max)
      : cleaned;

  const speak = () => {
    Speech.speak(utterance, {
      language: "it-IT",
      rate: 0.92,
      pitch: 1,
    });
  };

  if (options?.interrupt === false) {
    speak();
    return;
  }

  void Speech.stop().then(speak).catch(speak);
}
