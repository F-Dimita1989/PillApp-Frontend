/**
 * Scarica il catalogo farmaci dal backend e lo salva come dump JSON
 * per la ricerca/lookup offline.
 *
 * Uso: node scripts/dump-farmaci-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "assets/data/farmaci-catalog.json");

const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || "https://pillapp-backend.onrender.com"
).replace(/\/+$/g, "");

const PAGE_SIZE = 100;
/** «uso» copre «USO ORALE», «USO IM», «USO CUTANEO»… gran parte della lista AIFA. */
const SEED_QUERIES = ["uso", "fiale", "collirio", "crema", "gel", "spray", "gocce", "sciroppo"];
const MAX_RETRIES = 4;

function keepItem(item) {
  return {
    aic: item.aic ?? "",
    principioAttivo: item.principioAttivo ?? "",
    descrizioneGruppo: item.descrizioneGruppo ?? "",
    denominazioneConfezione: item.denominazioneConfezione ?? "",
    titolareAic: item.titolareAic ?? "",
  };
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} su ${url}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

async function dumpQuery(query, byAic) {
  const first = await fetchJson(
    `${API_BASE}/api/farmaci/search?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&offset=0`,
  );
  const total = Number(first.total) || 0;
  const items = Array.isArray(first.items) ? first.items : [];
  for (const item of items) {
    if (item?.aic && !byAic.has(item.aic)) {
      byAic.set(item.aic, keepItem(item));
    }
  }

  process.stdout.write(`  ${query}: ${total} dichiarati, scarico…\n`);

  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    const page = await fetchJson(
      `${API_BASE}/api/farmaci/search?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&offset=${offset}`,
    );
    for (const item of Array.isArray(page.items) ? page.items : []) {
      if (item?.aic && !byAic.has(item.aic)) {
        byAic.set(item.aic, keepItem(item));
      }
    }
    const done = Math.min(offset + PAGE_SIZE, total);
    process.stdout.write(`    ${query} ${done}/${total} (unici ${byAic.size})\n`);
  }
}

const byAic = new Map();

process.stdout.write(`Dump da ${API_BASE}\n`);

for (const query of SEED_QUERIES) {
  await dumpQuery(query, byAic);
}

const dump = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  source: API_BASE,
  count: byAic.size,
  items: [...byAic.values()],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(dump));
process.stdout.write(`Scritto ${outPath} — ${dump.count} confezioni\n`);
