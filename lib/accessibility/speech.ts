import { Children, isValidElement, type ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import * as Speech from "expo-speech";

let runtimeEnabled = false;
let italianVoiceId: string | undefined;
let voicesLoaded = false;

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

function speakUtterance(utterance: string): void {
  const options: Speech.SpeechOptions = {
    language: "it-IT",
    rate: 0.92,
    pitch: 1,
    onError: () => {
      Speech.speak(utterance, { rate: 0.92, pitch: 1 });
    },
  };
  if (italianVoiceId) {
    options.voice = italianVoiceId;
  }
  Speech.speak(utterance, options);
}

function ensureItalianVoice(): void {
  if (voicesLoaded) return;
  voicesLoaded = true;
  void Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const italian = voices.find((voice) =>
        voice.language?.toLowerCase().startsWith("it"),
      );
      italianVoiceId = italian?.identifier;
    })
    .catch(() => {
      italianVoiceId = undefined;
    });
}

export function speakAppText(
  text: string,
  options?: { force?: boolean; interrupt?: boolean },
): void {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  AccessibilityInfo.announceForAccessibility(cleaned);

  if (!options?.force && !runtimeEnabled) return;

  ensureItalianVoice();

  const max = Speech.maxSpeechInputLength;
  const utterance =
    typeof max === "number" && Number.isFinite(max) && max > 0
      ? cleaned.slice(0, max)
      : cleaned;

  const speak = () => speakUtterance(utterance);

  if (options?.interrupt === false) {
    speak();
    return;
  }

  void Speech.stop().then(speak).catch(speak);
}
