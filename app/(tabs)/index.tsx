import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

type OcrSpaceParsedResult = {
  ParsedText?: string;
};

type OcrSpaceResponse = {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[] | string;
  ParsedResults?: OcrSpaceParsedResult[];
};

const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";
const OCR_SPACE_API_KEY = "helloworld";
const FALLBACK_API_URL = "https://pillapp-backend.onrender.com";
const AIC_REGEX =
  /\b(?:A\.?\s*I\.?\s*C\.?\s*(?:N\.?|N°|NUM(?:ERO)?)?\s*[:\-]?\s*)?(0?\d{9})\b/gi;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_TABLE = process.env.EXPO_PUBLIC_SUPABASE_TABLE ?? "farmaci";
const SUPABASE_AIC_COLUMN =
  process.env.EXPO_PUBLIC_SUPABASE_AIC_COLUMN ?? "codice_aic";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      })
    : null;
const LAST_SCANNED_FARMACO_KEY = "pillapp:lastScannedFarmaco";

function extractAicCodes(text: string): string[] {
  const matches = [...text.matchAll(AIC_REGEX)];
  const unique = new Set<string>();
  matches.forEach((match) => {
    if (match[1]) {
      unique.add(match[1]);
    }
  });
  return [...unique];
}

function getErrorMessage(errorMessage?: string[] | string): string {
  if (Array.isArray(errorMessage)) {
    return errorMessage.join(" - ");
  }
  if (typeof errorMessage === "string") {
    return errorMessage;
  }
  return "Errore OCR sconosciuto.";
}

function createAicCandidates(aic: string): string[] {
  const onlyDigits = aic.replace(/\D/g, "");
  const withoutLeadingZero = onlyDigits.replace(/^0+/, "");
  return [...new Set([onlyDigits, withoutLeadingZero].filter(Boolean))];
}

function mapFarmacoToDynamicForm(
  data: Record<string, unknown>,
  detectedAic: string,
): Record<string, string> {
  const form: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      form[key] = "";
      return;
    }
    if (typeof value === "object") {
      form[key] = JSON.stringify(value);
      return;
    }
    form[key] = String(value);
  });

  if (!Object.keys(form).some((key) => /aic/i.test(key))) {
    form.codice_aic = detectedAic;
  }

  return form;
}

function resolveFarmaciApiBase(): string {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) {
    return `${configuredApiUrl.replace(/\/+$/g, "")}/api/farmaci`;
  }

  // Compatibilita con la variabile precedente.
  const configuredFarmaciBase = process.env.EXPO_PUBLIC_FARMACI_API_BASE?.trim();
  if (configuredFarmaciBase) {
    return configuredFarmaciBase.replace(/\/+$/g, "");
  }

  return `${FALLBACK_API_URL}/api/farmaci`;
}

async function preprocessImageForOcr(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 2000 } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!manipulated.base64) {
    throw new Error("Preprocess OCR non riuscito.");
  }

  return manipulated.base64;
}

async function callOcrSpace(
  base64: string,
  engine: "1" | "2",
): Promise<string> {
  const formData = new FormData();
  formData.append("apikey", OCR_SPACE_API_KEY);
  formData.append("language", "ita");
  formData.append("isOverlayRequired", "false");
  formData.append("scale", "true");
  formData.append("OCREngine", engine);
  formData.append("detectOrientation", "true");
  formData.append("isTable", "false");
  formData.append("base64Image", `data:image/jpeg;base64,${base64}`);

  const response = await fetch(OCR_SPACE_API_URL, {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as OcrSpaceResponse;
  if (!response.ok || result.IsErroredOnProcessing) {
    throw new Error(getErrorMessage(result.ErrorMessage));
  }

  return (
    result.ParsedResults?.map((entry) => entry.ParsedText?.trim() ?? "").join(
      "\n",
    ) ?? ""
  );
}

export default function HomeScreen() {
  const colors = Colors.light;
  const ui = {
    panelBorder: "#C7DFF2",
    panelBg: "#F2FAFF",
    mutedBorder: "#B8D4E8",
    inputBg: "#FFFFFF",
    placeholder: "#667085",
    stepBg: "#EAF6FF",
    stepText: "#1F2937",
    stepActiveBorder: colors.tint,
    stepActiveBg: "#DCE8FF",
    buttonPrimary: "#2E7D32",
    buttonSecondary: "#1565C0",
    error: "#C62828",
    infoBorder: "#B7D4E9",
    infoBg: "#E8F1FF",
    infoText: "#0F2A56",
    buttonText: "#FFFFFF",
  } as const;
  const farmaciApiBase = useMemo(resolveFarmaciApiBase, []);
  const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [farmacoData, setFarmacoData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [farmacoError, setFarmacoError] = useState("");
  const [isFarmacoLoading, setIsFarmacoLoading] = useState(false);
  const [farmacoForm, setFarmacoForm] = useState<Record<string, string>>({});

  const aicCodes = useMemo(() => extractAicCodes(ocrText), [ocrText]);

  const fetchFarmacoByAic = async (aic: string) => {
    setIsFarmacoLoading(true);
    setFarmacoError("");
    setFarmacoData(null);
    setFarmacoForm({});

    try {
      const candidates = createAicCandidates(aic);
      if (candidates.length === 0) {
        throw new Error("Codice AIC non valido.");
      }

      if (supabase && hasSupabaseConfig) {
        const orFilter = candidates
          .map((value) => `${SUPABASE_AIC_COLUMN}.eq.${value}`)
          .join(",");
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .select("*")
          .or(orFilter)
          .limit(1)
          .maybeSingle();

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
        if (data) {
          setFarmacoData(data as Record<string, unknown>);
          setFarmacoForm(
            mapFarmacoToDynamicForm(
              data as Record<string, unknown>,
              candidates[0],
            ),
          );
          await AsyncStorage.setItem(
            LAST_SCANNED_FARMACO_KEY,
            JSON.stringify({
              aic: candidates[0],
              data: data as Record<string, unknown>,
              scannedAt: new Date().toISOString(),
            }),
          );
          return;
        }
      }

      let lastBackendError = "";
      for (const candidate of candidates) {
        const response = await fetch(`${farmaciApiBase}/${candidate}`);
        if (response.ok) {
          const backendData = (await response.json()) as Record<string, unknown>;
          setFarmacoData(backendData);
          setFarmacoForm(mapFarmacoToDynamicForm(backendData, candidate));
          await AsyncStorage.setItem(
            LAST_SCANNED_FARMACO_KEY,
            JSON.stringify({
              aic: candidate,
              data: backendData,
              scannedAt: new Date().toISOString(),
            }),
          );
          return;
        }

        const errorBody = (await response.text()).trim();
        const compactBody = errorBody.slice(0, 180);
        lastBackendError = compactBody
          ? `Backend Farmaci status ${response.status}: ${compactBody}`
          : `Backend Farmaci status ${response.status}.`;

        // Se backend rompe con 500 su un candidato, proviamo il successivo.
      }

      throw new Error(lastBackendError || "Backend Farmaci non disponibile.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore sconosciuto durante il recupero farmaco.";
      setFarmacoError(errorMessage);
    } finally {
      setIsFarmacoLoading(false);
    }
  };

  const runOcr = async (uri: string, base64?: string | null) => {
    setIsLoading(true);
    setOcrText("");
    setFarmacoData(null);
    setFarmacoError("");

    try {
      const preparedBase64 = base64 ?? (await preprocessImageForOcr(uri));
      const enhancedBase64 = await preprocessImageForOcr(uri);

      // Strategia a tentativi: originale -> preprocess -> engine alternativo.
      let parsedText = "";
      const attempts: { imageBase64: string; engine: "1" | "2" }[] = [
        { imageBase64: preparedBase64, engine: "2" },
        { imageBase64: enhancedBase64, engine: "2" },
        { imageBase64: enhancedBase64, engine: "1" },
      ];

      let lastError = "";
      for (const attempt of attempts) {
        try {
          parsedText = await callOcrSpace(attempt.imageBase64, attempt.engine);
          const foundCodes = extractAicCodes(parsedText);
          if (foundCodes.length > 0) {
            break;
          }
        } catch (error) {
          lastError =
            error instanceof Error ? error.message : "Errore OCR sconosciuto.";
        }
      }

      if (!parsedText) {
        if (lastError.toUpperCase().includes("E202")) {
          throw new Error(
            "E202: OCR non ha accettato l'immagine. Prova a inquadrare solo il codice AIC, senza riflessi, e mantieni il telefono fermo.",
          );
        }
        throw new Error(lastError || "OCR non riuscito.");
      }

      setOcrText(parsedText);

      const extractedAicCodes = extractAicCodes(parsedText);
      if (extractedAicCodes.length > 0) {
        await fetchFarmacoByAic(extractedAicCodes[0]);
      } else {
        throw new Error(
          "OCR completato ma nessun AIC trovato. Prova con una foto piu ravvicinata e metti a fuoco solo la zona del codice.",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore sconosciuto durante OCR.";
      Alert.alert("OCR non riuscito", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (source: "camera" | "gallery") => {
    const pickerResult =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            base64: true,
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            base64: true,
            quality: 1,
          });

    if (pickerResult.canceled) {
      return;
    }

    const selectedImage = pickerResult.assets[0];
    if (!selectedImage?.uri) {
      Alert.alert(
        "Immagine non valida",
        "Non e stato possibile leggere il file selezionato.",
      );
      return;
    }

    setImageUri(selectedImage.uri);
    await runOcr(selectedImage.uri, selectedImage.base64);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "transparent" }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
      >
        <ThemedView style={styles.stepperContainer}>
          <ThemedView
            style={[
              styles.stepItem,
              { borderColor: colors.icon, backgroundColor: ui.stepBg },
              styles.stepItemActive,
              {
                borderColor: ui.stepActiveBorder,
                backgroundColor: ui.stepActiveBg,
              },
            ]}
          >
            <ThemedText style={[styles.stepText, { color: ui.buttonText }]}>
              1. Scansione
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.stepItem,
              { borderColor: colors.icon, backgroundColor: ui.stepBg },
              aicCodes.length > 0 ? styles.stepItemActive : null,
              aicCodes.length > 0
                ? {
                    borderColor: ui.stepActiveBorder,
                    backgroundColor: ui.stepActiveBg,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.stepText,
                { color: aicCodes.length > 0 ? ui.buttonText : ui.stepText },
              ]}
            >
              2. Verifica AIC
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.stepItem,
              { borderColor: colors.icon, backgroundColor: ui.stepBg },
              farmacoData ? styles.stepItemActive : null,
              farmacoData
                ? {
                    borderColor: ui.stepActiveBorder,
                    backgroundColor: ui.stepActiveBg,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.stepText,
                { color: farmacoData ? ui.buttonText : ui.stepText },
              ]}
            >
              3. Dati farmaco
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type="title">Demo OCR Farmaci</ThemedText>
        <ThemedText style={styles.subtitle}>
          Scansiona la confezione del farmaco e controlla i dati in modo
          semplice e guidato.
        </ThemedText>

        <ThemedView style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scatta una foto della confezione"
            style={[
              styles.primaryButton,
              { backgroundColor: ui.buttonPrimary },
            ]}
            onPress={() => pickImage("camera")}
          >
            <ThemedText style={styles.buttonLabel}>Scatta foto</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scegli una foto dalla galleria"
            style={[
              styles.secondaryButton,
              { backgroundColor: ui.buttonSecondary },
            ]}
            onPress={() => pickImage("gallery")}
          >
            <ThemedText style={styles.buttonLabel}>
              Scegli da galleria
            </ThemedText>
          </Pressable>
        </ThemedView>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.preview, { borderColor: ui.mutedBorder }]}
            contentFit="cover"
          />
        ) : null}

        {isLoading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator />
            <ThemedText style={styles.statusText}>
              Sto leggendo la confezione, attendi un momento...
            </ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView
          style={[
            styles.resultCard,
            {
              borderColor: ui.panelBorder,
              backgroundColor: ui.panelBg,
            },
          ]}
        >
          <ThemedText type="subtitle">Codice AIC rilevato</ThemedText>
          <ThemedText style={styles.aicValue}>
            {aicCodes.length > 0 ? aicCodes[0] : "Nessun codice AIC trovato"}
          </ThemedText>
          {aicCodes.length > 1 ? (
            <ThemedText style={styles.extraCodes}>
              Altri codici trovati: {aicCodes.slice(1).join(", ")}
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView
          style={[
            styles.resultCard,
            {
              borderColor: ui.panelBorder,
              backgroundColor: ui.panelBg,
            },
          ]}
        >
          <ThemedText type="subtitle">Dati farmaco</ThemedText>
          {isFarmacoLoading ? (
            <ThemedText>Caricamento dati farmaco...</ThemedText>
          ) : null}
          {farmacoError ? (
            <ThemedText style={[styles.errorText, { color: ui.error }]}>
              Errore: {farmacoError}
            </ThemedText>
          ) : null}
          {!isFarmacoLoading && !farmacoError && farmacoData ? (
            <ThemedView style={styles.formContainer}>
              {Object.keys(farmacoForm).length === 0 ? (
                <ThemedText style={styles.helperText}>
                  Nessun campo disponibile.
                </ThemedText>
              ) : (
                Object.entries(farmacoForm).map(([key, value]) => (
                  <ThemedView key={key} style={styles.fieldContainer}>
                    <ThemedText style={styles.fieldLabel}>{key}</ThemedText>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          borderColor: ui.mutedBorder,
                          color: colors.text,
                          backgroundColor: ui.inputBg,
                        },
                      ]}
                      value={value}
                      placeholder={key}
                      placeholderTextColor={ui.placeholder}
                      multiline={value.length > 80}
                      onChangeText={(nextValue) =>
                        setFarmacoForm((prev) => ({
                          ...prev,
                          [key]: nextValue,
                        }))
                      }
                    />
                  </ThemedView>
                ))
              )}
            </ThemedView>
          ) : null}
          {!isFarmacoLoading &&
          !farmacoError &&
          !farmacoData &&
          aicCodes.length === 0 ? (
            <ThemedText style={styles.helperText}>
              Rileva prima un codice AIC per interrogare l&apos;endpoint.
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView
          style={[
            styles.infoCard,
            {
              borderColor: ui.infoBorder,
              backgroundColor: ui.infoBg,
            },
          ]}
        >
          <ThemedText style={[styles.infoText, { color: ui.infoText }]}>
            Suggerimento: inquadra solo il codice AIC, evita riflessi e mantieni
            il telefono fermo.
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: ui.infoText }]}>
            Verifica sempre i dati con il farmacista o con il foglietto
            illustrativo.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    opacity: 0.9,
  },
  stepperContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  stepItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9E9E9E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#1F1F1F",
  },
  stepItemActive: {
    borderColor: "#0B5FFF",
    backgroundColor: "#163E94",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    color: "#FFFFFF",
  },
  buttonRow: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#2E7D32",
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#1565C0",
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#999",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    lineHeight: 22,
  },
  resultCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    gap: 6,
  },
  aicValue: {
    fontSize: 30,
    fontWeight: "800",
  },
  extraCodes: {
    fontSize: 13,
    opacity: 0.75,
  },
  helperText: {
    fontSize: 13,
    opacity: 0.75,
  },
  errorText: {
    color: "#FF5252",
  },
  formContainer: {
    gap: 8,
  },
  fieldContainer: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 15,
    opacity: 0.9,
    fontWeight: "600",
  },
  formInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#9E9E9E",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 18,
    color: "#E0E0E0",
    backgroundColor: "#1F1F1F",
  },
  infoCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#5E6B7A",
    borderRadius: 12,
    backgroundColor: "#11213B",
    padding: 12,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E9F0FF",
  },
});
