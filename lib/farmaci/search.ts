import { searchCatalogByName } from "./catalog";
import { fetchFarmaciApi } from "./api";
import { normalizeFarmacoRecord, pickFarmacoField } from "./normalize-record";

/** Sotto le tre lettere i risultati sono troppi per essere utili. */
export const FARMACO_SEARCH_MIN_CHARS = 3;

/** Pagine backend: si itera finché non arrivano tutte le corrispondenze. */
const SEARCH_PAGE_SIZE = 100;
/** Tetto di sicurezza se una query è troppo ampia o l’offset viene ignorato. */
const SEARCH_MAX_ITEMS = 5000;


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

function totalFromPayload(payload: unknown): number | null {
  if (isRecord(payload) && typeof payload.total === "number") {
    return payload.total;
  }
  return null;
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
  }

  return suggestions;
}

async function fetchSearchPage(
  text: string,
  offset: number,
): Promise<{ items: Record<string, unknown>[]; total: number | null; status: number }> {
  const response = await fetchFarmaciApi(
    `/search?q=${encodeURIComponent(text)}&limit=${SEARCH_PAGE_SIZE}&offset=${offset}`,
  );

  if (!response.ok) {
    return { items: [], total: 0, status: response.status };
  }

  const payload = (await response.json()) as unknown;
  const items = itemsFromPayload(payload);
  return {
    items,
    total: totalFromPayload(payload),
    status: response.status,
  };
}

function pageItemKey(item: Record<string, unknown>): string {
  return [
    scalar(item.aic) || scalar(item.codiceAic),
    scalar(item.denominazioneConfezione) || scalar(item.denominazione_confezione),
  ].join("|");
}

async function searchFarmaciRemote(text: string): Promise<FarmacoSuggestion[]> {
  const first = await fetchSearchPage(text, 0);

  /* Query rifiutata o rotta assente: per chi digita equivale a nessun risultato. */
  if (first.status === 400 || first.status === 404) {
    return [];
  }
  if (first.status !== 200) {
    throw new Error(`Ricerca farmaci non disponibile (status ${first.status}).`);
  }

  const items: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  const appendPage = (pageItems: Record<string, unknown>[]) => {
    let added = 0;
    for (const item of pageItems) {
      const key = pageItemKey(item);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      items.push(item);
      added += 1;
    }
    return added;
  };

  appendPage(first.items);

  const pageStep =
    first.items.length > 0 && first.items.length < SEARCH_PAGE_SIZE
      ? first.items.length
      : SEARCH_PAGE_SIZE;
  const lastOffset = first.total ?? SEARCH_MAX_ITEMS;

  for (
    let offset = pageStep;
    offset < lastOffset && items.length < SEARCH_MAX_ITEMS;
    offset += pageStep
  ) {
    const page = await fetchSearchPage(text, offset);
    if (page.status !== 200 || page.items.length === 0) {
      break;
    }
    if (appendPage(page.items) === 0) {
      break;
    }
  }

  return suggestionsFromItems(items);
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
      searchCatalogByName(text).map((item) => ({ ...item })),
    );
  }
}
