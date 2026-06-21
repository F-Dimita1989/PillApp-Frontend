import * as ImagePicker from "expo-image-picker";

import { extractAicCodes } from "@/lib/ocr/aic";
import { recognizeMedicinePackText } from "@/lib/ocr/recognizeText";

import { fetchFarmacoByAic, type FarmacoLookupResult } from "./lookup";
import { normalizeFarmacoRecord } from "./normalize-record";

export type MedicineScanResult = FarmacoLookupResult & {
  ocrText: string;
  imageUri: string;
};

export async function pickMedicineImage(
  source: "camera" | "gallery",
): Promise<string | null> {
  const pickerResult =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        });

  if (pickerResult.canceled) {
    return null;
  }

  const selectedImage = pickerResult.assets[0];
  if (!selectedImage?.uri) {
    throw new Error("Non è stato possibile leggere il file selezionato.");
  }

  return selectedImage.uri;
}

export async function scanMedicinePack(
  imageUri: string,
): Promise<MedicineScanResult> {
  const ocrText = await recognizeMedicinePackText(imageUri);
  const extractedAicCodes = extractAicCodes(ocrText);

  if (extractedAicCodes.length === 0) {
    throw new Error(
      "OCR completato ma nessun AIC trovato. Prova con una foto più ravvicinata e metti a fuoco solo la zona del codice.",
    );
  }

  const lookup = await fetchFarmacoByAic(extractedAicCodes[0]);

  return {
    ...lookup,
    data: normalizeFarmacoRecord(lookup.data),
    ocrText,
    imageUri,
  };
}

export async function pickAndScanMedicine(
  source: "camera" | "gallery",
): Promise<MedicineScanResult | null> {
  const imageUri = await pickMedicineImage(source);
  if (!imageUri) {
    return null;
  }

  return scanMedicinePack(imageUri);
}
