import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type OcrSpaceParsedResult = {
  ParsedText?: string;
};

type OcrSpaceResponse = {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[] | string;
  ParsedResults?: OcrSpaceParsedResult[];
};

const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
const OCR_SPACE_API_KEY = 'helloworld';
const FALLBACK_FARMACI_API_BASE = 'http://localhost:5227/api/Farmaci';
const AIC_REGEX = /\b(?:A\.?\s*I\.?\s*C\.?\s*(?:N\.?|N°|NUM(?:ERO)?)?\s*[:\-]?\s*)?(0?\d{9})\b/gi;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_TABLE = process.env.EXPO_PUBLIC_SUPABASE_TABLE ?? 'farmaci';
const SUPABASE_AIC_COLUMN = process.env.EXPO_PUBLIC_SUPABASE_AIC_COLUMN ?? 'codice_aic';

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      })
    : null;

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
    return errorMessage.join(' - ');
  }
  if (typeof errorMessage === 'string') {
    return errorMessage;
  }
  return 'Errore OCR sconosciuto.';
}

function createAicCandidates(aic: string): string[] {
  const onlyDigits = aic.replace(/\D/g, '');
  const withoutLeadingZero = onlyDigits.replace(/^0+/, '');
  return [...new Set([onlyDigits, withoutLeadingZero].filter(Boolean))];
}

function resolveFarmaciApiBase(): string {
  const configuredBase = process.env.EXPO_PUBLIC_FARMACI_API_BASE?.trim();
  if (configuredBase) {
    return configuredBase.replace(/\/+$/g, '');
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:5227/api/Farmaci`;
  }

  return FALLBACK_FARMACI_API_BASE;
}

async function preprocessImageForOcr(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 2000 } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!manipulated.base64) {
    throw new Error('Preprocess OCR non riuscito.');
  }

  return manipulated.base64;
}

async function callOcrSpace(base64: string, engine: '1' | '2'): Promise<string> {
  const formData = new FormData();
  formData.append('apikey', OCR_SPACE_API_KEY);
  formData.append('language', 'ita');
  formData.append('isOverlayRequired', 'false');
  formData.append('scale', 'true');
  formData.append('OCREngine', engine);
  formData.append('detectOrientation', 'true');
  formData.append('isTable', 'false');
  formData.append('base64Image', `data:image/jpeg;base64,${base64}`);

  const response = await fetch(OCR_SPACE_API_URL, {
    method: 'POST',
    body: formData,
  });

  const result = (await response.json()) as OcrSpaceResponse;
  if (!response.ok || result.IsErroredOnProcessing) {
    throw new Error(getErrorMessage(result.ErrorMessage));
  }

  return result.ParsedResults?.map((entry) => entry.ParsedText?.trim() ?? '').join('\n') ?? '';
}

export default function HomeScreen() {
  const farmaciApiBase = useMemo(resolveFarmaciApiBase, []);
  const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [farmacoData, setFarmacoData] = useState<Record<string, unknown> | null>(null);
  const [farmacoError, setFarmacoError] = useState('');
  const [isFarmacoLoading, setIsFarmacoLoading] = useState(false);
  const [farmacoSource, setFarmacoSource] = useState<'supabase' | 'backend' | null>(null);

  const aicCodes = useMemo(() => extractAicCodes(ocrText), [ocrText]);

  const fetchFarmacoByAic = async (aic: string) => {
    setIsFarmacoLoading(true);
    setFarmacoError('');
    setFarmacoData(null);
    setFarmacoSource(null);

    try {
      const candidates = createAicCandidates(aic);
      if (candidates.length === 0) {
        throw new Error('Codice AIC non valido.');
      }

      if (supabase && hasSupabaseConfig) {
        const orFilter = candidates.map((value) => `${SUPABASE_AIC_COLUMN}.eq.${value}`).join(',');
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .select('*')
          .or(orFilter)
          .limit(1)
          .maybeSingle();

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
        if (data) {
          setFarmacoData(data as Record<string, unknown>);
          setFarmacoSource('supabase');
          return;
        }
      }

      const response = await fetch(`${farmaciApiBase}/${candidates[0]}`);
      if (!response.ok) {
        throw new Error(`Backend Farmaci ha risposto con status ${response.status}.`);
      }
      const backendData = (await response.json()) as Record<string, unknown>;
      setFarmacoData(backendData);
      setFarmacoSource('backend');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Errore sconosciuto durante il recupero farmaco.';
      setFarmacoError(errorMessage);
    } finally {
      setIsFarmacoLoading(false);
    }
  };

  const runOcr = async (uri: string, base64?: string | null) => {
    setIsLoading(true);
    setOcrText('');
    setFarmacoData(null);
    setFarmacoError('');

    try {
      const preparedBase64 = base64 ?? (await preprocessImageForOcr(uri));
      const enhancedBase64 = await preprocessImageForOcr(uri);

      // Strategia a tentativi: originale -> preprocess -> engine alternativo.
      let parsedText = '';
      const attempts: { imageBase64: string; engine: '1' | '2' }[] = [
        { imageBase64: preparedBase64, engine: '2' },
        { imageBase64: enhancedBase64, engine: '2' },
        { imageBase64: enhancedBase64, engine: '1' },
      ];

      let lastError = '';
      for (const attempt of attempts) {
        try {
          parsedText = await callOcrSpace(attempt.imageBase64, attempt.engine);
          const foundCodes = extractAicCodes(parsedText);
          if (foundCodes.length > 0) {
            break;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Errore OCR sconosciuto.';
        }
      }

      if (!parsedText) {
        if (lastError.toUpperCase().includes('E202')) {
          throw new Error(
            'E202: OCR non ha accettato l\'immagine. Prova a inquadrare solo il codice AIC, senza riflessi, e mantieni il telefono fermo.'
          );
        }
        throw new Error(lastError || 'OCR non riuscito.');
      }

      setOcrText(parsedText);

      const extractedAicCodes = extractAicCodes(parsedText);
      if (extractedAicCodes.length > 0) {
        await fetchFarmacoByAic(extractedAicCodes[0]);
      } else {
        throw new Error(
          'OCR completato ma nessun AIC trovato. Prova con una foto piu ravvicinata e metti a fuoco solo la zona del codice.'
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante OCR.';
      Alert.alert('OCR non riuscito', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const pickerResult =
      source === 'camera'
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
      Alert.alert('Immagine non valida', 'Non e stato possibile leggere il file selezionato.');
      return;
    }

    setImageUri(selectedImage.uri);
    await runOcr(selectedImage.uri, selectedImage.base64);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Demo OCR Farmaci</ThemedText>
        <ThemedText style={styles.subtitle}>
          Scansiona una scatola e individua il codice AIC come dato principale.
        </ThemedText>

        <ThemedView style={styles.buttonRow}>
          <Pressable style={styles.primaryButton} onPress={() => pickImage('camera')}>
            <ThemedText style={styles.buttonLabel}>Scatta foto</ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => pickImage('gallery')}>
            <ThemedText style={styles.buttonLabel}>Scegli da galleria</ThemedText>
          </Pressable>
        </ThemedView>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" /> : null}

        {isLoading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator />
            <ThemedText>OCR in corso...</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.resultCard}>
          <ThemedText type="subtitle">Codice AIC rilevato</ThemedText>
          <ThemedText style={styles.aicValue}>
            {aicCodes.length > 0 ? aicCodes[0] : 'Nessun codice AIC trovato'}
          </ThemedText>
          {aicCodes.length > 1 ? (
            <ThemedText style={styles.extraCodes}>Altri codici trovati: {aicCodes.slice(1).join(', ')}</ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.resultCard}>
          <ThemedText type="subtitle">Dati farmaco</ThemedText>
          <ThemedText style={styles.endpointText}>
            {hasSupabaseConfig
              ? `Fonte primaria: Supabase (${SUPABASE_TABLE}.${SUPABASE_AIC_COLUMN})`
              : `Fonte: Backend (${farmaciApiBase}/{'{AIC}'})`}
          </ThemedText>
          {farmacoSource ? (
            <ThemedText style={styles.helperText}>Origine risposta: {farmacoSource}</ThemedText>
          ) : null}
          {isFarmacoLoading ? <ThemedText>Caricamento dati farmaco...</ThemedText> : null}
          {farmacoError ? <ThemedText style={styles.errorText}>Errore: {farmacoError}</ThemedText> : null}
          {!isFarmacoLoading && !farmacoError && farmacoData ? (
            <TextInput
              editable={false}
              multiline
              value={JSON.stringify(farmacoData, null, 2)}
              style={styles.apiResponseText}
            />
          ) : null}
          {!isFarmacoLoading && !farmacoError && !farmacoData && aicCodes.length === 0 ? (
            <ThemedText style={styles.helperText}>Rileva prima un codice AIC per interrogare l&apos;endpoint.</ThemedText>
          ) : null}
        </ThemedView>

        <ThemedText type="subtitle">Testo OCR completo</ThemedText>
        <TextInput
          editable={false}
          multiline
          value={ocrText || 'Il testo OCR apparira qui dopo la scansione.'}
          style={styles.ocrText}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
  },
  subtitle: {
    opacity: 0.85,
  },
  buttonRow: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    gap: 6,
  },
  aicValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  extraCodes: {
    fontSize: 13,
    opacity: 0.75,
  },
  endpointText: {
    fontSize: 12,
    opacity: 0.75,
  },
  helperText: {
    fontSize: 13,
    opacity: 0.75,
  },
  errorText: {
    color: '#FF5252',
  },
  apiResponseText: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    color: '#E0E0E0',
    backgroundColor: '#1F1F1F',
  },
  ocrText: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    color: '#E0E0E0',
    backgroundColor: '#1F1F1F',
  },
});
