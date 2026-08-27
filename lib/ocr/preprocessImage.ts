import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

/** Lato lungo sufficiente per le 9 cifre AIC, senza saturare ML Kit. */
export const OCR_PRIMARY_MAX_WIDTH = 1600;
/** Secondo tentativo solo se il primo non trova l'AIC. */
export const OCR_FALLBACK_MAX_WIDTH = 2200;
const OCR_JPEG_QUALITY = 0.72;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject,
    );
  });
}

export async function downscaleForOcr(
  uri: string,
  maxWidth: number,
): Promise<string> {
  try {
    const { width } = await getImageSize(uri);
    if (width > 0 && width <= maxWidth) {
      return uri;
    }
  } catch {
    // Se non riusciamo a leggere le dimensioni, ridimensioniamo comunque.
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress: OCR_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return result.uri;
}
