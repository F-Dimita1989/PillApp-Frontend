import type { QuantitaUnit } from "@/types/domain";

import { pickFarmacoField } from "@/lib/farmaci/normalize-record";

type JsonRecord = Record<string, unknown>;

const QUANTITA_DB_KEYS = [
  "quantita",
  "quantita_confezione",
  "qta",
  "qty",
  "numero_pezzi",
  "num_pezzi",
  "n_pezzi",
  "numero_unita",
  "num_unita",
  "n_unita",
  "unita_confezione",
  "unita_per_confezione",
  "pezzi_confezione",
  "pezzi_per_confezione",
  "num_compresse",
  "numero_compresse",
  "numero_confezione",
  "contenuto",
  "volume_ml",
  "volume",
  "capacita_ml",
  "ml",
] as const;

const PACKAGE_TEXT_KEYS = [
  "denominazione_e_confezione",
  "denominazione_confezione",
  "descrizione_confezione",
  "confezione",
  "descrizione",
  "packaging",
  "note",
] as const;

function scalarToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return "";
  }
  return String(value).trim();
}

function normalizeNumeric(value: string): string {
  return value.replace(",", ".").trim();
}

/** Estrae la quantità dal suffisso AIFA *N (es. "... compresse *30"). */
export function extractQuantitaFromAsterisk(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.includes("*")) {
    return "";
  }

  const trailingMatch = trimmed.match(
    /\*\s*(\d+(?:[.,]\d+)?)\s*(?:ml|bustine?|compresse?|capsule?|cp|cpr|pezzi|unit[aà])?\s*$/i,
  );
  if (trailingMatch?.[1]) {
    const value = normalizeNumeric(trailingMatch[1]);
    const numeric = Number.parseFloat(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return value;
    }
  }

  const anyMatch = trimmed.match(/\*\s*(\d+(?:[.,]\d+)?)/);
  if (anyMatch?.[1]) {
    const value = normalizeNumeric(anyMatch[1]);
    const numeric = Number.parseFloat(value);
    if (Number.isFinite(numeric) && numeric > 0 && numeric <= 9999) {
      return value;
    }
  }

  return "";
}

/** Converte un valore DB (numero o testo tipo "30 COMPRESSE") in quantità numerica. */
export function parseQuantitaFromDbValue(
  raw: string,
  unita: QuantitaUnit,
): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d+(?:[.,]\d+)?$/.test(trimmed)) {
    return normalizeNumeric(trimmed);
  }

  return extractQuantitaFromPackageText(trimmed, unita);
}

/** Volume dichiarato: in «12 mg/5 ml» i ml sono la concentrazione, non il contenuto. */
function extractMlQuantity(text: string): string {
  const values = [...text.matchAll(/(\/)?\s*\b(\d+(?:[.,]\d+)?)\s*ml\b/gi)]
    .filter((match) => !match[1])
    .map((match) => Number.parseFloat(normalizeNumeric(match[2])))
    .filter((value) => Number.isFinite(value) && value > 0);

  return values.length > 0 ? String(Math.max(...values)) : "";
}

/**
 * Confezioni multiple: «6 fiale IM 3 ml» sono 18 ml in tutto. Qui la
 * concentrazione vale, perché per le fiale coincide col contenuto della fiala.
 */
function extractMlFromContainers(text: string): string {
  const match = text.match(
    /\b(\d{1,3})\s*(?:fial\w*|flacon\w*|siring\w*|contenitor\w*|sacc\w*)\b.{0,40}?\b(\d+(?:[.,]\d+)?)\s*ml\b/i,
  );
  if (!match) {
    return "";
  }

  const contenitori = Number.parseInt(match[1], 10);
  const mlPerContenitore = Number.parseFloat(normalizeNumeric(match[2]));
  if (!Number.isFinite(contenitori) || !Number.isFinite(mlPerContenitore)) {
    return "";
  }

  const totale = contenitori * mlPerContenitore;
  return totale > 0 ? String(Number(totale.toFixed(2))) : "";
}

/**
 * Per i liquidi il numero dopo l'asterisco conta i contenitori, non i ml: conta
 * il volume scritto nel testo. Fra confezione multipla e volume singolo si tiene
 * il maggiore, così la siringa dosatrice non prende il posto del flacone.
 */
function extractMlFromText(text: string): string {
  const candidates = [extractMlFromContainers(text), extractMlQuantity(text)]
    .map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (candidates.length > 0) {
    return String(Math.max(...candidates));
  }

  return extractQuantitaFromAsterisk(text);
}

function extractUnitQuantity(text: string, unita: QuantitaUnit): string {
  const candidates: number[] = [];

  const blisterMatch = text.match(
    /\b(\d{1,2})\s*blister\s*(?:da\s*)?(\d{1,3})\s*(?:compresse?|capsule?|pastiglie?|bustine?)\b/i,
  );
  if (blisterMatch) {
    candidates.push(
      Number.parseInt(blisterMatch[1], 10) *
        Number.parseInt(blisterMatch[2], 10),
    );
  }

  const patterns =
    unita === "bustine"
      ? [
          /\b(\d{1,3})\s*bustine?\b/gi,
          /\b(?:da|con)\s*(\d{1,3})\s*bustine?\b/gi,
        ]
      : [
          /\b(\d{1,3})\s*(?:compresse?|capsule?|pastiglie?|cp|cpr|pillole?)\b/gi,
          /\b(?:da|con)\s*(\d{1,3})\s*(?:compresse?|capsule?|pastiglie?)\b/gi,
          /\b(?:n\.?\s*|numero\s+)(?:di\s+)?(\d{1,3})\s*(?:unit[aà]|pezzi|compresse?|capsule?)?\b/gi,
          /\bconfezione\s+da\s+(\d{1,3})\b/gi,
          /\bcontenuto\s*:?\s*(\d{1,3})\b/gi,
        ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = Number.parseInt(match[1], 10);
      if (value > 0 && value <= 999) {
        candidates.push(value);
      }
    }
  }

  if (candidates.length === 0) {
    return "";
  }

  return String(candidates[candidates.length - 1]);
}

/** Estrae pillole/ml/bustine da testi confezione (es. denominazione AIFA). */
export function extractQuantitaFromPackageText(
  text: string,
  unita: QuantitaUnit,
): string {
  if (!text.trim()) {
    return "";
  }

  if (unita === "ml") {
    return extractMlFromText(text);
  }

  const fromAsterisk = extractQuantitaFromAsterisk(text);
  if (fromAsterisk) {
    return fromAsterisk;
  }

  return extractUnitQuantity(text, unita);
}

function collectPackageDescription(
  data: JsonRecord,
  denominazione: string,
  formaHint: string,
): string {
  const chunks = new Set<string>();

  for (const key of PACKAGE_TEXT_KEYS) {
    const value = scalarToString(data[key]);
    if (value) {
      chunks.add(value);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    const text = scalarToString(value);
    if (!text) {
      continue;
    }
    if (
      key.includes("confezione") ||
      key.includes("denominazione") ||
      key.includes("descrizione") ||
      key.includes("contenuto") ||
      key.includes("pack")
    ) {
      chunks.add(text);
    }
  }

  if (denominazione.trim()) {
    chunks.add(denominazione.trim());
  }
  if (formaHint.trim()) {
    chunks.add(formaHint.trim());
  }

  return [...chunks].join(" ");
}

function scanRecordForQuantita(data: JsonRecord, unita: QuantitaUnit): string {
  for (const [key, value] of Object.entries(data)) {
    const text = scalarToString(value);
    if (!text) {
      continue;
    }

    const isQuantityKey =
      key.includes("quantit") ||
      key.includes("pezzi") ||
      key.includes("numero") ||
      key.includes("num_") ||
      key.includes("n_") ||
      key.includes("unita") ||
      key.includes("volume") ||
      key.includes("contenuto") ||
      key.includes("ml") ||
      key.includes("qta") ||
      key.includes("qty");

    if (!isQuantityKey) {
      continue;
    }

    const parsed = parseQuantitaFromDbValue(text, unita);
    if (parsed) {
      return parsed;
    }
  }

  return "";
}

export function extractQuantitaFromFarmacoRecord(
  data: JsonRecord,
  denominazione: string,
  formaHint: string,
  unita: QuantitaUnit,
): string {
  const asteriskSources = [
    denominazione,
    scalarToString(data.denominazione_e_confezione),
    scalarToString(data.denominazione_confezione),
    scalarToString(data.denominazione),
    scalarToString(data.descrizione),
  ];
  for (const source of asteriskSources) {
    const fromSource =
      unita === "ml"
        ? extractMlFromText(source)
        : extractQuantitaFromAsterisk(source);
    if (fromSource) {
      return fromSource;
    }
  }

  for (const key of QUANTITA_DB_KEYS) {
    const parsed = parseQuantitaFromDbValue(
      scalarToString(data[key]),
      unita,
    );
    if (parsed) {
      return parsed;
    }
  }

  const fromPartialKeys = pickFarmacoField(
    data,
    [...QUANTITA_DB_KEYS],
    ["quantita", "numero", "pezzi", "compresse", "volume", "contenuto", "unita"],
  );
  const fromPartial = parseQuantitaFromDbValue(fromPartialKeys, unita);
  if (fromPartial) {
    return fromPartial;
  }

  const fromRecordScan = scanRecordForQuantita(data, unita);
  if (fromRecordScan) {
    return fromRecordScan;
  }

  const packageText = collectPackageDescription(data, denominazione, formaHint);
  return extractQuantitaFromPackageText(packageText, unita);
}
