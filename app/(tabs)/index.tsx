import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { createClient } from "@supabase/supabase-js";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ScreenSafeArea } from "@/components/screen-safe-area";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { extractAicCodes } from "@/lib/ocr/aic";
import { recognizeMedicinePackText } from "@/lib/ocr/recognizeText";
import { getGuestProfile } from "@/lib/profile/storage";

const FALLBACK_API_URL = "https://pillapp-backend.onrender.com";
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

function createAicCandidates(aic: string): string[] {
  const onlyDigits = aic.replace(/\D/g, "");
  const withoutLeadingZero = onlyDigits.replace(/^0+/, "");
  return [...new Set([onlyDigits, withoutLeadingZero].filter(Boolean))];
}

function getFarmacoDisplayName(data: Record<string, unknown> | null): string {
  if (!data) {
    return "";
  }

  return (
    (data.nome as string | undefined) ||
    (data.denominazione as string | undefined) ||
    (data.nome_commerciale as string | undefined) ||
    (data.descrizione as string | undefined) ||
    "Farmaco rilevato"
  );
}

function getFarmacoSummaryFields(
  data: Record<string, unknown>,
): { label: string; value: string }[] {
  const priorityKeys = [
    "codice_aic",
    "aic",
    "principio_attivo",
    "forma",
    "dosaggio",
    "titolare",
  ];

  const rows: { label: string; value: string }[] = [];

  priorityKeys.forEach((key) => {
    const value = data[key];
    if (value !== null && value !== undefined && String(value).trim()) {
      rows.push({ label: key.replace(/_/g, " "), value: String(value) });
    }
  });

  if (rows.length >= 4) {
    return rows.slice(0, 4);
  }

  Object.entries(data).forEach(([key, value]) => {
    if (rows.length >= 4) {
      return;
    }
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === "object") {
      return;
    }
    if (priorityKeys.includes(key)) {
      return;
    }
    const text = String(value).trim();
    if (text) {
      rows.push({ label: key.replace(/_/g, " "), value: text });
    }
  });

  return rows;
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

export default function HomeScreen() {
  const router = useRouter();
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
  const [guestName, setGuestName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [farmacoData, setFarmacoData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [farmacoError, setFarmacoError] = useState("");
  const [isFarmacoLoading, setIsFarmacoLoading] = useState(false);
  const aicCodes = useMemo(() => extractAicCodes(ocrText), [ocrText]);
  const farmacoNome = useMemo(
    () => getFarmacoDisplayName(farmacoData),
    [farmacoData],
  );
  const farmacoSummary = useMemo(
    () => (farmacoData ? getFarmacoSummaryFields(farmacoData) : []),
    [farmacoData],
  );

  const scanStep = farmacoData ? 3 : aicCodes.length > 0 ? 2 : 1;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadProfile = async () => {
        const profile = await getGuestProfile();
        if (isMounted && profile?.name) {
          setGuestName(profile.name);
        }
      };

      void loadProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const fetchFarmacoByAic = async (aic: string) => {
    setIsFarmacoLoading(true);
    setFarmacoError("");
    setFarmacoData(null);

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

  const runOcr = async (uri: string) => {
    setIsLoading(true);
    setOcrText("");
    setFarmacoData(null);
    setFarmacoError("");

    try {
      const parsedText = await recognizeMedicinePackText(uri);
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
    await runOcr(selectedImage.uri);
  };

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, styles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>
            {guestName ? `Ciao, ${guestName}` : "Ciao"}
          </ThemedText>
          <ThemedText type="title">Home</ThemedText>
          <ThemedText style={styles.subtitle}>
            Scansiona una confezione per leggere il codice AIC e recuperare i
            dati del farmaco.
          </ThemedText>
        </View>

        <View style={styles.heroSection}>
          <Image
            source={require("@/assets/onboarding/meds.png")}
            style={styles.heroImage}
            contentFit="contain"
          />
          <ThemedText style={styles.heroTitle}>Scansiona la confezione</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Inquadra il codice AIC in modo chiaro, senza riflessi.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scansiona confezione con fotocamera"
            style={[styles.scanButton, { backgroundColor: colors.tint }]}
            onPress={() => pickImage("camera")}
          >
            <ThemedText style={styles.scanButtonText}>Scansiona confezione</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scegli foto dalla galleria"
            style={styles.galleryButton}
            onPress={() => pickImage("gallery")}
          >
            <ThemedText style={[styles.galleryButtonText, { color: colors.tint }]}>
              Scegli da galleria
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.stepperContainer}>
          {[
            { id: 1, label: "Scansione" },
            { id: 2, label: "Codice AIC" },
            { id: 3, label: "Dati farmaco" },
          ].map((step) => {
            const isActive = scanStep >= step.id;
            return (
              <View
                key={step.id}
                style={[
                  styles.stepItem,
                  isActive ? styles.stepItemActive : null,
                  isActive
                    ? { borderColor: ui.stepActiveBorder }
                    : { borderColor: "transparent" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepText,
                    { color: isActive ? colors.tint : ui.stepText },
                  ]}
                >
                  {step.id}. {step.label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.preview, { borderColor: ui.mutedBorder }]}
            contentFit="cover"
          />
        ) : null}

        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={colors.tint} />
            <ThemedText style={styles.statusText}>
              Sto leggendo la confezione...
            </ThemedText>
          </View>
        ) : null}

        {(aicCodes.length > 0 || isFarmacoLoading || farmacoError) && !isLoading ? (
          <View style={styles.resultSection}>
            <ThemedText type="subtitle">Codice AIC</ThemedText>
            <ThemedText style={styles.aicValue}>
              {aicCodes.length > 0 ? aicCodes[0] : "—"}
            </ThemedText>
            {aicCodes.length > 1 ? (
              <ThemedText style={styles.extraCodes}>
                Altri codici: {aicCodes.slice(1).join(", ")}
              </ThemedText>
            ) : null}
            {isFarmacoLoading ? (
              <ThemedText style={styles.helperText}>
                Recupero dati farmaco...
              </ThemedText>
            ) : null}
            {farmacoError ? (
              <ThemedText style={[styles.errorText, { color: ui.error }]}>
                {farmacoError}
              </ThemedText>
            ) : null}
          </View>
        ) : null}

        {farmacoData && !isFarmacoLoading && !farmacoError ? (
          <View style={styles.resultSection}>
            <ThemedText type="subtitle">Farmaco rilevato</ThemedText>
            <ThemedText style={styles.farmacoName}>{farmacoNome}</ThemedText>
            {farmacoSummary.map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>{row.label}</ThemedText>
                <ThemedText style={styles.summaryValue}>{row.value}</ThemedText>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Vai alla terapia utente"
              style={[styles.therapyButton, { backgroundColor: ui.buttonPrimary }]}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <ThemedText style={styles.scanButtonText}>
                Crea piano terapeutico
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoText}>
            Suggerimento: avvicinati al codice AIC e mantieni il telefono fermo.
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Verifica sempre le informazioni con il tuo medico o farmacista.
          </ThemedText>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    gap: 14,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    gap: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a7ea4",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  heroSection: {
    alignItems: "center",
    gap: 10,
  },
  heroImage: {
    width: "100%",
    height: 160,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.85,
  },
  scanButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  galleryButton: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepperContainer: {
    flexDirection: "row",
    gap: 8,
  },
  stepItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "transparent",
  },
  stepItemActive: {
    backgroundColor: "rgba(10, 126, 164, 0.12)",
  },
  stepText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 16,
    lineHeight: 22,
  },
  resultSection: {
    gap: 8,
  },
  aicValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  farmacoName: {
    fontSize: 20,
    fontWeight: "700",
  },
  summaryRow: {
    gap: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
    textTransform: "capitalize",
  },
  summaryValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  therapyButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  extraCodes: {
    fontSize: 13,
    opacity: 0.75,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    gap: 6,
    opacity: 0.9,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.85,
  },
});
