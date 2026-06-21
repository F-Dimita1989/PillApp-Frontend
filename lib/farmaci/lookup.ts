import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { normalizeFarmacoRecord, pickFarmacoField } from "./normalize-record";

export const LAST_SCANNED_FARMACO_KEY = "pillapp:lastScannedFarmaco";

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

export type FarmacoLookupResult = {
  aic: string;
  data: Record<string, unknown>;
};

function resolveFarmaciApiBase(): string {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) {
    return `${configuredApiUrl.replace(/\/+$/g, "")}/api/farmaci`;
  }

  const configuredFarmaciBase = process.env.EXPO_PUBLIC_FARMACI_API_BASE?.trim();
  if (configuredFarmaciBase) {
    return configuredFarmaciBase.replace(/\/+$/g, "");
  }

  return `${FALLBACK_API_URL}/api/farmaci`;
}

export function createAicCandidates(aic: string): string[] {
  const onlyDigits = aic.replace(/\D/g, "");
  const withoutLeadingZero = onlyDigits.replace(/^0+/, "");
  return [...new Set([onlyDigits, withoutLeadingZero].filter(Boolean))];
}

export function getFarmacoDisplayName(
  data: Record<string, unknown> | null,
): string {
  if (!data) {
    return "";
  }

  const normalized = normalizeFarmacoRecord(data);

  return (
    pickFarmacoField(
      normalized,
      ["nome", "denominazione", "nome_commerciale", "denominazione_e_confezione"],
      ["nome", "denominazione"],
    ) || "Farmaco rilevato"
  );
}

export function getFarmacoSummaryFields(
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
    if (value === null || value === undefined || typeof value === "object") {
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

export async function saveLastScannedFarmaco(
  aic: string,
  data: Record<string, unknown>,
): Promise<void> {
  await AsyncStorage.setItem(
    LAST_SCANNED_FARMACO_KEY,
    JSON.stringify({
      aic,
      data,
      scannedAt: new Date().toISOString(),
    }),
  );
}

export async function fetchFarmacoByAic(
  aic: string,
): Promise<FarmacoLookupResult> {
  const candidates = createAicCandidates(aic);
  if (candidates.length === 0) {
    throw new Error("Codice AIC non valido.");
  }

  const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
      const normalized = normalizeFarmacoRecord(data);
      const result = {
        aic: candidates[0],
        data: normalized,
      };
      await saveLastScannedFarmaco(result.aic, result.data);
      return result;
    }
  }

  const farmaciApiBase = resolveFarmaciApiBase();
  let lastBackendError = "";

  for (const candidate of candidates) {
    const response = await fetch(`${farmaciApiBase}/${candidate}`);
    if (response.ok) {
      const backendData = (await response.json()) as Record<string, unknown>;
      const normalized = normalizeFarmacoRecord(backendData);
      const result = { aic: candidate, data: normalized };
      await saveLastScannedFarmaco(result.aic, result.data);
      return result;
    }

    const errorBody = (await response.text()).trim();
    const compactBody = errorBody.slice(0, 180);
    lastBackendError = compactBody
      ? `Backend Farmaci status ${response.status}: ${compactBody}`
      : `Backend Farmaci status ${response.status}.`;
  }

  throw new Error(lastBackendError || "Backend Farmaci non disponibile.");
}
