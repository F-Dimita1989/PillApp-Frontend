import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

import { useAccessibility } from "@/lib/accessibility/context";
import { speakAppText } from "@/lib/accessibility/speech";

/** Legge il testo all'apertura della schermata, se la lettura vocale è attiva. */
export function useSpeakOnFocus(text: string): void {
  const { speechEnabled } = useAccessibility();
  const textRef = useRef(text);
  textRef.current = text;
  const enabledRef = useRef(speechEnabled);
  enabledRef.current = speechEnabled;

  useFocusEffect(
    useCallback(() => {
      if (!enabledRef.current) return;
      const toSpeak = textRef.current.replace(/\s+/g, " ").trim();
      if (!toSpeak) return;
      speakAppText(toSpeak, { force: true });
    }, []),
  );
}
