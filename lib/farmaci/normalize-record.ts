type JsonRecord = Record<string, unknown>;

const NESTED_PAYLOAD_KEYS = [
  "data",
  "farmaco",
  "record",
  "result",
  "item",
  "payload",
  "attributes",
] as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function scalarToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return "";
  }
  return String(value).trim();
}

/** Appiattisce wrapper API/Supabase e normalizza i nomi colonna. */
export function normalizeFarmacoRecord(raw: unknown): JsonRecord {
  if (Array.isArray(raw)) {
    const first = raw.find(isRecord);
    return first ? normalizeFarmacoRecord(first) : {};
  }

  if (!isRecord(raw)) {
    return {};
  }

  let merged: JsonRecord = { ...raw };

  for (const key of NESTED_PAYLOAD_KEYS) {
    const nested = merged[key];
    if (isRecord(nested)) {
      merged = { ...merged, ...nested };
    }
  }

  const normalized: JsonRecord = {};

  for (const [key, value] of Object.entries(merged)) {
    if (NESTED_PAYLOAD_KEYS.includes(key as (typeof NESTED_PAYLOAD_KEYS)[number])) {
      continue;
    }

    const normKey = normalizeKey(key);
    if (!normKey) {
      continue;
    }

    const text = scalarToString(value);
    if (!text) {
      continue;
    }

    if (!(normKey in normalized) || !scalarToString(normalized[normKey])) {
      normalized[normKey] = text;
    }
  }

  return normalized;
}

export function pickFarmacoField(
  data: JsonRecord,
  exactKeys: string[],
  partialKeys: string[] = [],
): string {
  for (const key of exactKeys) {
    const text = scalarToString(data[key]);
    if (text) {
      return text;
    }
  }

  for (const partial of partialKeys) {
    const needle = normalizeKey(partial);
    for (const [key, value] of Object.entries(data)) {
      if (key.includes(needle)) {
        const text = scalarToString(value);
        if (text) {
          return text;
        }
      }
    }
  }

  return "";
}

export function splitDenominazioneConfezione(denominazione: string): {
  nome: string;
  dosaggio: string;
  forma: string;
} {
  const text = denominazione.trim();
  if (!text) {
    return { nome: "", dosaggio: "", forma: "" };
  }

  const dosaggioMatch = text.match(
    /\b(\d+(?:[.,]\d+)?\s*(?:mg|g|ml|mcg|µg|ui|%)(?:\/\d+(?:[.,]\d+)?\s*(?:mg|g|ml|mcg|µg|ui|%)?)?)\b/i,
  );
  const dosaggio = dosaggioMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  const formaMatch = text.match(
    /\b(compresse?|capsule?|gocce|sciroppo|soluzione|fiale?|iniezione|pomata|crema|unguento|supposte?|bustine?|granulato|spray|inalatore|patch|gel)\b/i,
  );
  const forma = formaMatch?.[1] ?? "";

  let nome = text;
  if (dosaggio) {
    nome = nome.replace(dosaggio, " ");
  }
  if (forma) {
    nome = nome.replace(new RegExp(forma, "i"), " ");
  }
  nome = nome.replace(/\s+/g, " ").trim();

  return { nome, dosaggio, forma };
}
