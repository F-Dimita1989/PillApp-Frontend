import { searchCatalogByName } from "./catalog";
import { fetchFarmaciApi } from "./api";
import { normalizeFarmacoRecord, pickFarmacoField } from "./normalize-record";

/** Sotto le tre lettere i risultati sono troppi per essere utili. */
export const FARMACO_SEARCH_MIN_CHARS = 3;

/** Si chiede qualche riga in più delle mostrate: i doppioni vengono scartati. */
const SEARCH_LIMIT = 20;
const MAX_SUGGESTIONS = 8;

/** Render a freddo può impiegare qualche secondo a svegliarsi. */
const SEARCH_TIMEOUT_MS = 15000;

export type FarmacoSuggestion = {
  key: string;
  aic: string;
  /** Nome commerciale, senza la parte di confezione */
  nome: string;
  /** Confezione e titolare: distinguono gli equivalenti omonimi */
  dettaglio: string;
  /** Record del catalogo, da dare a buildScannedMedicationFormValues */
  record: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalar(value: unknown): string {
  if (value === null || value === undefined || typeof value === "object") {
    return "";
  }
  return String(value).trim();
}

function itemsFromPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items.filter(isRecord);
  }
  return [];
}

/**
 * Nel catalogo AIFA la denominazione è «NOME*confezione»: prima dell'asterisco
 * c'è il nome commerciale, dopo il formato della scatola.
 */
function splitDenominazione(denominazione: string): {
  nome: string;
  confezione: string;
} {
  const [nome, ...resto] = denominazione.split("*");
  return {
    nome: nome.trim(),
    confezione: resto.join("*").trim(),
  };
}

function toSuggestion(raw: Record<string, unknown>): FarmacoSuggestion | null {
  const data = normalizeFarmacoRecord(raw);

  /* Il backend parla camelCase: si legge prima dal record grezzo. */
  const denominazione =
    scalar(raw.denominazioneConfezione) ||
    scalar(raw.denominazione_confezione) ||
    pickFarmacoField(
      data,
      [
        "denominazioneconfezione",
        "denominazione_e_confezione",
        "denominazione_confezione",
        "denominazione",
      ],
      ["denominazione", "confezione"],
    );

  const { nome, confezione } = splitDenominazione(denominazione);
  if (!nome) {
    return null;
  }

  const aic =
    scalar(raw.aic) ||
    scalar(raw.codiceAic) ||
    pickFarmacoField(data, ["aic", "codiceaic", "codice_aic"], ["aic"]);

  const titolare =
    scalar(raw.titolareAic) ||
    pickFarmacoField(
      data,
      ["titolareaic", "titolare_aic", "titolare"],
      ["titolare", "ragione_sociale", "azienda"],
    );

  return {
    key: `${aic}-${denominazione}`,
    aic,
    nome,
    dettaglio: [confezione, titolare].filter(Boolean).join(" · "),
    record: raw,
  };
}

function suggestionsFromItems(
  items: Record<string, unknown>[],
): FarmacoSuggestion[] {
  const seen = new Set<string>();
  const suggestions: FarmacoSuggestion[] = [];

  for (const item of items) {
    const suggestion = toSuggestion(item);
    if (!suggestion) {
      continue;
    }

    const dedupeKey = `${suggestion.nome}|${suggestion.dettaglio}`.toLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    suggestions.push(suggestion);
    if (suggestions.length >= MAX_SUGGESTIONS) {
      break;
    }
  }

  return suggestions;
}

async function searchFarmaciRemote(text: string): Promise<FarmacoSuggestion[]> {
  const response = await fetchFarmaciApi(
    `/search?q=${encodeURIComponent(text)}&limit=${SEARCH_LIMIT}`,
    { timeoutMs: SEARCH_TIMEOUT_MS },
  );

  /* Query rifiutata o rotta assente: per chi digita equivale a nessun risultato. */
  if (response.status === 400 || response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`Ricerca farmaci non disponibile (status ${response.status}).`);
  }

  const payload = (await response.json()) as unknown;
  return suggestionsFromItems(itemsFromPayload(payload));
}

export async function searchFarmaciByName(
  query: string,
): Promise<FarmacoSuggestion[]> {
  const text = query.trim();
  if (text.length < FARMACO_SEARCH_MIN_CHARS) {
    return [];
  }

  try {
    return await searchFarmaciRemote(text);
  } catch {
    return suggestionsFromItems(
      searchCatalogByName(text, MAX_SUGGESTIONS).map((item) => ({ ...item })),
    );
  }
}
