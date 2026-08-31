export type CatalogFarmaco = {
  aic: string;
  principioAttivo: string;
  descrizioneGruppo: string;
  denominazioneConfezione: string;
  titolareAic: string;
};

let cachedItems: CatalogFarmaco[] | null = null;

function loadCatalogItems(): CatalogFarmaco[] {
  if (cachedItems) {
    return cachedItems;
  }

  const dump = require("../../assets/data/farmaci-catalog.json") as {
    items?: CatalogFarmaco[];
  };
  cachedItems = Array.isArray(dump.items) ? dump.items : [];
  return cachedItems;
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function haystack(item: CatalogFarmaco): string {
  return fold(
    [
      item.denominazioneConfezione,
      item.principioAttivo,
      item.titolareAic,
      item.descrizioneGruppo,
    ].join(" "),
  );
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Ricerca locale sul dump: niente rete, adatta alla modalità offline. */
export function searchCatalogByName(
  query: string,
  limit: number,
): CatalogFarmaco[] {
  const needle = fold(query.trim());
  if (!needle) {
    return [];
  }

  const matches: CatalogFarmaco[] = [];
  const seen = new Set<string>();

  for (const item of loadCatalogItems()) {
    if (!haystack(item).includes(needle)) {
      continue;
    }

    const key = fold(`${item.denominazioneConfezione}|${item.titolareAic}`);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    matches.push(item);
    if (matches.length >= limit) {
      break;
    }
  }

  return matches;
}

export function findCatalogByAic(aicCandidates: string[]): CatalogFarmaco | null {
  const wanted = new Set(aicCandidates.map(digits).filter(Boolean));
  if (wanted.size === 0) {
    return null;
  }

  for (const item of loadCatalogItems()) {
    const aic = digits(item.aic);
    if (!aic) {
      continue;
    }
    if (wanted.has(aic) || wanted.has(aic.replace(/^0+/, ""))) {
      return item;
    }
  }

  return null;
}
