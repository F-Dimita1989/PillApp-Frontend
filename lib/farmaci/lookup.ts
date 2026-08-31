import { createClient } from "@supabase/supabase-js";

import { FARMACI_API_TIMEOUT_MS, fetchFarmaciApi } from "./api";
import { findCatalogByAic } from "./catalog";
import { normalizeFarmacoRecord } from "./normalize-record";

/** In produzione l'utente non deve vedere status code o corpo della risposta. */
const GENERIC_LOOKUP_ERROR =
  "Non riesco a leggere i dati del farmaco in questo momento. Controlla la connessione e riprova, oppure inserisci il farmaco manualmente.";

const NOT_FOUND_LOOKUP_ERROR =
  "Questo codice AIC non risulta nel catalogo. Controlla le cifre sulla confezione oppure inserisci il farmaco manualmente.";

function lookupErrorMessage(detail: string, notFound = false): string {
  if (__DEV__ && detail) {
    return detail;
  }
  return notFound ? NOT_FOUND_LOOKUP_ERROR : GENERIC_LOOKUP_ERROR;
}

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

function createAicCandidates(aic: string): string[] {
  const onlyDigits = aic.replace(/\D/g, "");
  const withoutLeadingZero = onlyDigits.replace(/^0+/, "");
  return [...new Set([onlyDigits, withoutLeadingZero].filter(Boolean))];
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
      throw new Error(lookupErrorMessage(`Supabase error: ${error.message}`));
    }
    if (data) {
      return {
        aic: candidates[0],
        data: normalizeFarmacoRecord(data),
      };
    }
  }

  let lastBackendError = "";
  let everyAttemptWasNotFound = true;
  let reachedServer = false;

  for (const candidate of candidates) {
    let response: Response;
    try {
      response = await fetchFarmaciApi(`/${candidate}`);
      reachedServer = true;
    } catch {
      everyAttemptWasNotFound = false;
      lastBackendError = `Backend Farmaci non raggiungibile entro ${FARMACI_API_TIMEOUT_MS} ms.`;
      continue;
    }

    if (response.ok) {
      const backendData = (await response.json()) as Record<string, unknown>;
      return { aic: candidate, data: normalizeFarmacoRecord(backendData) };
    }

    if (response.status !== 404) {
      everyAttemptWasNotFound = false;
    }

    const errorBody = (await response.text()).trim();
    const compactBody = errorBody.slice(0, 180);
    lastBackendError = compactBody
      ? `Backend Farmaci status ${response.status}: ${compactBody}`
      : `Backend Farmaci status ${response.status}.`;
  }

  if (!reachedServer) {
    const local = findCatalogByAic(candidates);
    if (local) {
      return {
        aic: local.aic || candidates[0],
        data: normalizeFarmacoRecord(local),
      };
    }
  }

  throw new Error(lookupErrorMessage(lastBackendError, everyAttemptWasNotFound));
}
