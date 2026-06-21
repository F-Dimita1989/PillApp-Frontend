import {
  getQuantitaUnitLabel,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import type {
  DrugImageRequest,
  DrugImageResponse,
  FetchDrugPackageImageOptions,
} from "@/types/drug-image";

const FALLBACK_API_URL = "https://pillapp-backend.onrender.com";
export const DRUG_IMAGE_FETCH_TIMEOUT_MS = 25_000;

function resolveApiRoot(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/g, "");
  }
  return FALLBACK_API_URL;
}

function pharmaceuticalFormFromScan(
  values: ScannedMedicationFormValues,
): string | null {
  switch (values.unitaQuantita) {
    case "bustine":
      return "Bustine";
    case "ml":
      return "Soluzione orale";
    default:
      return "Compresse";
  }
}

export function drugImageRequestFromScanValues(
  values: ScannedMedicationFormValues,
): DrugImageRequest {
  const quantita = values.quantita.trim();
  return {
    aic: values.aic.trim(),
    name: values.nome.trim(),
    dosage: values.dosaggio.trim() || null,
    pharmaceuticalForm: pharmaceuticalFormFromScan(values),
    packageQuantity: quantita
      ? `${quantita} ${getQuantitaUnitLabel(values.unitaQuantita)}`
      : null,
    marketingAuthorizationHolder: values.marca.trim() || null,
  };
}

export async function fetchDrugPackageImage(
  drug: DrugImageRequest,
  options: FetchDrugPackageImageOptions = {},
): Promise<DrugImageResponse> {
  const url = `${resolveApiRoot()}/api/v1/drugs/image`;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    DRUG_IMAGE_FETCH_TIMEOUT_MS,
  );

  const onExternalAbort = () => timeoutController.abort();
  options.signal?.addEventListener("abort", onExternalAbort);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (options.token?.trim()) {
    headers.Authorization = `Bearer ${options.token.trim()}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        aic: drug.aic,
        name: drug.name,
        dosage: drug.dosage,
        pharmaceuticalForm: drug.pharmaceuticalForm,
        packageQuantity: drug.packageQuantity,
        marketingAuthorizationHolder: drug.marketingAuthorizationHolder,
      }),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as DrugImageResponse;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", onExternalAbort);
  }
}
