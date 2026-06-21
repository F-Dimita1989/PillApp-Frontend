import type { MedicationFormType, QuantitaUnit } from "@/types/domain";

import {
  normalizeFarmacoRecord,
  pickFarmacoField,
  splitDenominazioneConfezione,
} from "@/lib/farmaci/normalize-record";
import { extractQuantitaFromFarmacoRecord } from "@/lib/farmaci/extract-quantita";

export type { QuantitaUnit } from "@/types/domain";

export type ScannedMedicationFormValues = {
  aic: string;
  nome: string;
  marca: string;
  principioAttivo: string;
  /** Numero pezzi o ml ancora in confezione */
  quantita: string;
  unitaQuantita: QuantitaUnit;
  dosaggio: string;
  note: string;
};

function inferFormaHint(
  data: ReturnType<typeof normalizeFarmacoRecord>,
  denominazione: string,
  parsedForma: string,
): string {
  return (
    pickFarmacoField(
      data,
      ["forma", "forma_farmaceutica", "forma_farm", "pharmaceutical_form"],
      ["forma"],
    ) ||
    parsedForma ||
    denominazione
  );
}

function inferQuantitaUnit(formaHint: string, denominazione: string): QuantitaUnit {
  const text = `${formaHint} ${denominazione}`.toLowerCase();

  if (text.includes("bustin")) {
    return "bustine";
  }
  if (
    text.includes("sciropp") ||
    text.includes("soluz") ||
    text.includes("gocc") ||
    text.includes(" ml") ||
    text.includes("ml ") ||
    text.includes("liquido") ||
    text.includes("fiala")
  ) {
    return "ml";
  }

  return "pillole";
}

function buildQuantita(
  data: ReturnType<typeof normalizeFarmacoRecord>,
  denominazione: string,
  formaHint: string,
): Pick<ScannedMedicationFormValues, "quantita" | "unitaQuantita"> {
  const unitaQuantita = inferQuantitaUnit(formaHint, denominazione);
  const quantita = extractQuantitaFromFarmacoRecord(
    data,
    denominazione,
    formaHint,
    unitaQuantita,
  );

  return {
    quantita,
    unitaQuantita,
  };
}

export function getQuantitaUnitLabel(unita: QuantitaUnit): string {
  switch (unita) {
    case "ml":
      return "ml";
    case "bustine":
      return "bustine";
    default:
      return "compresse";
  }
}

export function getQuantitaFieldLabel(unita: QuantitaUnit): string {
  switch (unita) {
    case "ml":
      return "Ml rimasti in confezione";
    case "bustine":
      return "Bustine rimaste";
    default:
      return "Pillole rimaste";
  }
}

export function getQuantitaFieldHint(unita: QuantitaUnit): string {
  switch (unita) {
    case "ml":
      return "Es. 100 — aggiorna man mano che usi il farmaco";
    case "bustine":
      return "Es. 20 — aggiorna quando ne prendi una";
    default:
      return "Es. 30 — aggiorna quando ne prendi una";
  }
}

export function buildScannedMedicationFormValues(
  aic: string,
  rawData: Record<string, unknown>,
): ScannedMedicationFormValues {
  const data = normalizeFarmacoRecord(rawData);

  const denominazione = pickFarmacoField(data, [
    "denominazione_e_confezione",
    "denominazione_confezione",
    "denominazione",
    "nome_commerciale",
    "nome",
    "descrizione",
    "product_name",
  ], ["denominazione", "confezione", "nome_commerciale", "nome_farmaco"]);

  const parsedDenominazione = splitDenominazioneConfezione(denominazione);

  const nome =
    pickFarmacoField(data, ["nome", "nome_commerciale", "denominazione"], ["nome"]) ||
    parsedDenominazione.nome ||
    denominazione;

  const marca = pickFarmacoField(
    data,
    [
      "marca",
      "titolare",
      "ragione_sociale_titolare_aic",
      "titolare_aic",
      "azienda_titolare",
      "impresa_titolare",
      "azienda",
      "ditta",
      "ragione_sociale",
      "produttore",
      "holder",
    ],
    ["titolare", "marca", "ragione_sociale", "produttore", "azienda"],
  );

  const principioAttivo = pickFarmacoField(
    data,
    ["principio_attivo", "principio", "sostanza_attiva", "active_ingredient"],
    ["principio", "sostanza"],
  );

  const formaHint = inferFormaHint(data, denominazione, parsedDenominazione.forma);

  const dosaggio =
    pickFarmacoField(
      data,
      ["dosaggio", "concentrazione", "dosaggio_strength", "strength"],
      ["dosaggio", "concentrazione"],
    ) || parsedDenominazione.dosaggio;

  const { quantita, unitaQuantita } = buildQuantita(
    data,
    denominazione,
    formaHint,
  );

  const note = pickFarmacoField(
    data,
    ["confezione", "descrizione_confezione", "note", "packaging"],
    ["confezione", "note"],
  );

  const codiceAic =
    pickFarmacoField(data, ["codice_aic", "aic", "cod_aic"], ["aic", "codice"]) ||
    aic;

  return {
    aic: codiceAic,
    nome,
    marca,
    principioAttivo,
    quantita,
    unitaQuantita,
    dosaggio,
    note,
  };
}

export function formatScannedMedicationNotes(
  values: ScannedMedicationFormValues,
): string {
  const lines: string[] = [];

  if (values.marca.trim()) {
    lines.push(`Marca: ${values.marca.trim()}`);
  }
  if (values.principioAttivo.trim()) {
    lines.push(`Principio attivo: ${values.principioAttivo.trim()}`);
  }
  if (values.quantita.trim()) {
    const unitLabel =
      values.unitaQuantita === "ml"
        ? "ml"
        : values.unitaQuantita === "bustine"
          ? "bustine"
          : "pillole";
    lines.push(`Quantità residua: ${values.quantita.trim()} ${unitLabel}`);
  }
  if (values.dosaggio.trim()) {
    lines.push(`Dosaggio: ${values.dosaggio.trim()}`);
  }
  if (values.note.trim()) {
    lines.push(values.note.trim());
  }

  return lines.join("\n");
}

export function therapyDoseFromFormValues(
  values: ScannedMedicationFormValues,
): string {
  switch (values.unitaQuantita) {
    case "ml":
      return "5 ml";
    case "bustine":
      return "1 bustina";
    default:
      return "1 compressa";
  }
}

export function mapUnitaToMedicationForm(
  unita: QuantitaUnit,
): MedicationFormType {
  switch (unita) {
    case "ml":
      return "sciroppo";
    case "bustine":
      return "compressa";
    default:
      return "compressa";
  }
}

/** @deprecated Usa mapUnitaToMedicationForm */
export function mapFormaToMedicationForm(forma: string): MedicationFormType {
  const normalized = forma.toLowerCase();

  if (normalized.includes("gocc")) {
    return "gocce";
  }
  if (normalized.includes("capsul")) {
    return "capsula";
  }
  if (normalized.includes("sciropp") || normalized.includes("soluz")) {
    return "sciroppo";
  }
  if (normalized.includes("inal")) {
    return "inalatore";
  }
  if (normalized.includes("iniez") || normalized.includes("fiala")) {
    return "iniezione";
  }
  if (normalized.includes("crem") || normalized.includes("unguent")) {
    return "crema";
  }

  return "compressa";
}

export function updateScannedMedicationField(
  values: ScannedMedicationFormValues,
  field: keyof ScannedMedicationFormValues,
  value: string,
): ScannedMedicationFormValues {
  return { ...values, [field]: value };
}
