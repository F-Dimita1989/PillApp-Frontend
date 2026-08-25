import { isSupported, recognizeText } from "expo-mlkit-ocr";
import { Platform } from "react-native";

import { extractAicCodes } from "@/lib/ocr/aic";
import {
  downscaleForOcr,
  OCR_FALLBACK_MAX_WIDTH,
  OCR_PRIMARY_MAX_WIDTH,
} from "@/lib/ocr/preprocessImage";

function assertOcrPlatform(): void {
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

async function recognizeTextFromUri(uri: string): Promise<string> {
  assertOcrPlatform();
  const result = await recognizeText(uri);
  return result.text.trim();
}

async function recognizeAttempt(
  uri: string,
): Promise<{ text: string; aicCount: number; digitGroups: number }> {
  const text = await recognizeTextFromUri(uri);
  const aicCount = extractAicCodes(text).length;
  const digitGroups = text.match(/\d{4,}/g)?.length ?? 0;
  return { text, aicCount, digitGroups };
}

function scoreAttempt(attempt: { aicCount: number; digitGroups: number }): number {
  return attempt.aicCount * 100 + attempt.digitGroups;
}

export async function recognizeMedicinePackText(uri: string): Promise<string> {
  let lastError = "";
  let best = { text: "", aicCount: 0, digitGroups: 0 };
  let bestScore = -1;

  const tryUri = async (imageUri: string): Promise<string | null> => {
    try {
      const attempt = await recognizeAttempt(imageUri);
      const score = scoreAttempt(attempt);
      if (score > bestScore) {
        bestScore = score;
        best = attempt;
      }
      if (attempt.aicCount > 0) {
        return attempt.text;
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Errore OCR sconosciuto.";
    }
    return null;
  };

  let primaryUri = uri;
  try {
    primaryUri = await downscaleForOcr(uri, OCR_PRIMARY_MAX_WIDTH);
  } catch {
    // Se il preprocess fallisce, usiamo l'originale.
  }

  const primaryHit = await tryUri(primaryUri);
  if (primaryHit) {
    return primaryHit;
  }

  const fallbackUri = await downscaleForOcr(uri, OCR_FALLBACK_MAX_WIDTH).catch(
    () => "",
  );
  if (fallbackUri && fallbackUri !== primaryUri) {
    const fallbackHit = await tryUri(fallbackUri);
    if (fallbackHit) {
      return fallbackHit;
    }
  }

  if (best.text) {
    return best.text;
  }

  throw new Error(lastError || "OCR non riuscito.");
}
