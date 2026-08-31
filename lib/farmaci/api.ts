const FALLBACK_API_URL = "https://pillapp-backend.onrender.com";

/** Evita richieste appese a tempo indeterminato su rete lenta o backend fermo. */
export const FARMACI_API_TIMEOUT_MS = 12000;

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

export async function fetchFarmaciApi(
  path: string,
  { timeoutMs = FARMACI_API_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${resolveFarmaciApiBase()}${path}`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
