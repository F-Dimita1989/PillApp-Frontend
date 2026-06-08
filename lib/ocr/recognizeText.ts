import { isSupported, recognizeText } from "expo-mlkit-ocr";
import { Platform } from "react-native";

import { extractAicCodes } from "@/lib/ocr/aic";
import { preprocessImageForOcr } from "@/lib/ocr/preprocessImage";

export function assertOcrPlatform(): void {
  if (Platform.OS === "web") {
    throw new Error(
      "La lettura del codice AIC e disponibile solo nell'app mobile (iOS/Android).",
    );
  }
  if (!isSupported()) {
    throw new Error(
      "OCR non supportato su questo dispositivo. Richiesto iOS 16 o Android 5+.",
    );
  }
}

export async function recognizeTextFromUri(uri: string): Promise<string> {
  assertOcrPlatform();
  const result = await recognizeText(uri);
  return result.text.trim();
}

export async function recognizeMedicinePackText(uri: string): Promise<string> {
  const attemptUris: string[] = [uri];

  try {
    const enhancedUris = await preprocessImageForOcr(uri);
    for (const enhancedUri of enhancedUris) {
      if (!attemptUris.includes(enhancedUri)) {
        attemptUris.push(enhancedUri);
      }
    }
  } catch {
    // Se il preprocess fallisce, proviamo comunque l'immagine originale.
  }

  let lastError = "";
  let lastText = "";
  let bestText = "";
  let bestScore = -1;

  for (const imageUri of attemptUris) {
    try {
      const text = await recognizeTextFromUri(imageUri);
      lastText = text;
      const aicCodes = extractAicCodes(text);
      const digitGroups = text.match(/\d{4,}/g)?.length ?? 0;
      const score = aicCodes.length * 100 + digitGroups;

      if (score > bestScore) {
        bestScore = score;
        bestText = text;
      }

      if (aicCodes.length > 0) {
        return text;
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Errore OCR sconosciuto.";
    }
  }

  if (bestText) {
    return bestText;
  }

  if (lastText) {
    return lastText;
  }

  throw new Error(lastError || "OCR non riuscito.");
}
