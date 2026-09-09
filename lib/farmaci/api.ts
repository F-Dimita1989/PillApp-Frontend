const FALLBACK_API_URL = "https://pillapp-backend.onrender.com";

/**
 * Render e Supabase free si addormentano: il cold start spesso supera i 12s.
 * Un minuto copre il risveglio tipico senza lasciare la richiesta appesa.
 */
export const FARMACI_API_TIMEOUT_MS = 60_000;
const FARMACI_API_RETRY_PAUSE_MS = 2_000;
const FARMACI_API_MAX_ATTEMPTS = 2;

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

async function fetchOnce(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFarmaciApi(
  path: string,
  { timeoutMs = FARMACI_API_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<Response> {
  const url = `${resolveFarmaciApiBase()}${path}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= FARMACI_API_MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchOnce(url, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= FARMACI_API_MAX_ATTEMPTS) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, FARMACI_API_RETRY_PAUSE_MS));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Backend Farmaci non raggiungibile.");
}

/** Sveglia Render e il catalogo in background, prima che l’utente cerchi un farmaco. */
export function warmupFarmaciBackend(): void {
  void fetchFarmaciApi("/search?q=a&limit=1&offset=0").catch(() => {});
}
