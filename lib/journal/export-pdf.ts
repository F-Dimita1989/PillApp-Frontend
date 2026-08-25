import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { MOOD_LABELS } from "@/lib/journal/labels";
import type {
  JournalNote,
  MeasurementEntry,
  Medication,
  MoodLevel,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

export type JournalPdfPayload = {
  profile: UserProfile;
  measurements: MeasurementEntry[];
  symptoms: SymptomEntry[];
  notes: JournalNote[];
  medications: Medication[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function moodLabel(mood?: MoodLevel): string {
  if (!mood) return "Non indicato";
  return MOOD_LABELS[mood];
}

function byNewest<T extends { recordedAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

function emptyRow(message: string, columns = 4): string {
  return `<tr><td colspan="${columns}" class="empty">${escapeHtml(message)}</td></tr>`;
}

export function hasJournalExportData(payload: JournalPdfPayload): boolean {
  return (
    payload.measurements.length > 0 ||
    payload.notes.length > 0 ||
    payload.symptoms.length > 0
  );
}

export function buildJournalPdfHtml(payload: JournalPdfPayload): string {
  const generatedAt = new Date().toLocaleString("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const patient = payload.profile.name.trim() || "Non indicato";
  const birth = payload.profile.birthYear
    ? `Nato/a nel ${payload.profile.birthYear}`
    : "Anno di nascita non indicato";

  const measurements = byNewest(payload.measurements);
  const notes = byNewest(payload.notes);
  const symptoms = byNewest(payload.symptoms);
  const activeMeds = payload.medications.filter((m) => m.active);

  const measurementRows = measurements.length
    ? measurements
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(formatWhen(item.recordedAt))}</td>
              <td>${escapeHtml(item.label)}</td>
              <td><strong>${escapeHtml(item.value)}</strong> ${escapeHtml(item.unit)}</td>
              <td>${item.note ? escapeHtml(item.note) : "—"}</td>
            </tr>`,
        )
        .join("")
    : emptyRow("Nessuna misurazione registrata.");

  const noteBlocks = notes.length
    ? notes
        .map(
          (item) => `
            <article class="note">
              <p class="note-meta">${escapeHtml(formatWhen(item.recordedAt))} · Umore: ${escapeHtml(moodLabel(item.mood))}</p>
              <p class="note-text">${escapeHtml(item.text)}</p>
            </article>`,
        )
        .join("")
    : `<p class="empty">Nessuna nota registrata.</p>`;

  const symptomRows = symptoms.length
    ? symptoms
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(formatWhen(item.recordedAt))}</td>
              <td>${escapeHtml(item.label)}</td>
              <td>${item.severity}/5</td>
              <td>${item.note ? escapeHtml(item.note) : "—"}</td>
            </tr>`,
        )
        .join("")
    : emptyRow("Nessun sintomo registrato.");

  const medicationRows = activeMeds.length
    ? activeMeds
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.dose)}</td>
              <td>${escapeHtml(item.schedule.times.join(", ") || "—")}</td>
            </tr>`,
        )
        .join("")
    : emptyRow("Nessuna terapia attiva in PillApp.", 3);

  return `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Diario salute PillApp</title>
    <style>
      @page { margin: 28px; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #0F172A;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 12px;
        line-height: 1.45;
      }
      .header {
        background: linear-gradient(135deg, #2AABA0 0%, #4EC4B5 35%, #2B7FD4 70%, #1E5F9E 100%);
        color: #ffffff;
        border-radius: 14px;
        padding: 22px 24px;
      }
      .eyebrow {
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 10px;
        opacity: 0.86;
        margin: 0 0 6px;
      }
      h1 { margin: 0; font-size: 22px; font-weight: 700; }
      .meta { margin: 8px 0 0; opacity: 0.92; }
      h2 {
        margin: 22px 0 8px;
        color: #1E5F9E;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      table { width: 100%; border-collapse: collapse; }
      th, td {
        text-align: left;
        padding: 8px 10px;
        vertical-align: top;
      }
      th {
        background: #E8F2FB;
        color: #1E5F9E;
        font-size: 10px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      td { border-bottom: 1px solid #E2EBF3; }
      .empty { color: #64748B; font-style: italic; }
      .note {
        background: #F2F6FA;
        border-left: 4px solid #2AABA0;
        border-radius: 8px;
        padding: 10px 12px;
        margin: 0 0 8px;
      }
      .note-meta { margin: 0 0 4px; color: #1E5F9E; font-size: 11px; font-weight: 600; }
      .note-text { margin: 0; white-space: pre-wrap; }
      .footer {
        margin-top: 28px;
        padding-top: 12px;
        border-top: 1px solid #E2EBF3;
        color: #64748B;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <header class="header">
      <p class="eyebrow">PillApp · Diario salute</p>
      <h1>Report per il medico</h1>
      <p class="meta">Paziente: ${escapeHtml(patient)} · ${escapeHtml(birth)}</p>
      <p class="meta">Generato il ${escapeHtml(generatedAt)}</p>
    </header>

    <h2>Misurazioni</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Tipo</th>
          <th>Valore</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>${measurementRows}</tbody>
    </table>

    <h2>Note del diario</h2>
    ${noteBlocks}

    <h2>Sintomi</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Sintomo</th>
          <th>Intensità</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>${symptomRows}</tbody>
    </table>

    <h2>Terapia in corso</h2>
    <table>
      <thead>
        <tr>
          <th>Farmaco</th>
          <th>Dose</th>
          <th>Orari</th>
        </tr>
      </thead>
      <tbody>${medicationRows}</tbody>
    </table>

    <p class="footer">
      Documento generato da PillApp su richiesta della persona. Non sostituisce una cartella clinica
      e va interpretato dal medico di fiducia.
    </p>
  </body>
</html>`;
}

export async function shareJournalPdf(payload: JournalPdfPayload): Promise<void> {
  if (!hasJournalExportData(payload)) {
    throw new Error("Aggiungi almeno una misurazione, un sintomo o una nota prima di esportare.");
  }

  const html = buildJournalPdfHtml(payload);
  const { uri } = await Print.printToFileAsync({
    html,
    width: 595,
    height: 842,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("La condivisione file non è disponibile su questo dispositivo.");
  }

  let shareUri = uri;
  try {
    const named = new File(Paths.cache, `PillApp-diario-${formatStamp(new Date())}.pdf`);
    if (named.exists) {
      named.delete();
    }
    new File(uri).copy(named);
    shareUri = named.uri;
  } catch {
    shareUri = uri;
  }

  await Sharing.shareAsync(shareUri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Salva o invia il diario al medico",
  });
}
