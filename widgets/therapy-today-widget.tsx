"use no memo";

import { FlexWidget, ImageWidget, TextWidget } from "react-native-android-widget";

import { pillappColors, pillappRadius } from "@/theme/tokens";
import type { DoseEvent, DoseStatus } from "@/types/domain";

import type { TherapyWidgetData } from "./therapy-widget-data";

/** Versione ritagliata del logo: `node scripts/generate-widget-logo.mjs` */
const PILLAPP_LOGO = require("@/assets/images/pillapp-logo-widget.png");

const PADDING = 14;
const LOGO_SIZE = 34;

/**
 * Velatura diagonale delle schermate dell'app (`pillappAmbientWash`) appiattita
 * sul bianco: nel widget non si possono sovrapporre due gradienti trasparenti.
 */
const PAGE_WASH = {
  from: "#E1F3F1",
  to: "#DCE7F1",
  orientation: "TL_BR",
} as const;

type Props = {
  data: TherapyWidgetData;
};

function statusTone(status: DoseStatus) {
  switch (status) {
    case "taken":
      return pillappColors.status.taken;
    case "due_soon":
      return pillappColors.status.dueSoon;
    case "overdue":
      return pillappColors.status.overdue;
    case "snoozed":
      return pillappColors.status.snoozed;
    case "skipped":
      return pillappColors.status.skipped;
    default:
      return pillappColors.status.pending;
  }
}

/** Il pallino è solo colore: lo stato in parole resta ai lettori di schermo. */
function statusLabel(status: DoseStatus): string {
  switch (status) {
    case "taken":
      return "Completato";
    case "due_soon":
      return "Tra poco";
    case "overdue":
      return "In ritardo";
    case "snoozed":
      return "Posticipato";
    case "skipped":
      return "Saltato";
    default:
      return "In attesa";
  }
}

function isOpen(dose: DoseEvent): boolean {
  return dose.status !== "taken" && dose.status !== "skipped";
}

/** Le dosi arrivano già in ordine di orario: la prima aperta è quella che serve. */
function nextDose(doses: DoseEvent[]): DoseEvent | undefined {
  return doses.find(isOpen);
}

function headerSubtitle(dose: DoseEvent | undefined, data: TherapyWidgetData): string {
  if (dose) {
    if (dose.status === "overdue") return "Assunzione in ritardo";
    if (dose.status === "snoozed") return "Assunzione posticipata";
    return "Prossima assunzione";
  }

  if (!data.hasActiveMedications) return "Terapia da impostare";
  if (data.doses.length === 0) return "Giorno di riposo";
  return "Tutte le assunzioni completate";
}

function BrandLogo() {
  return (
    <ImageWidget
      image={PILLAPP_LOGO}
      imageWidth={LOGO_SIZE}
      imageHeight={LOGO_SIZE}
      resizeMode="contain"
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginRight: 10 }}
    />
  );
}

function CounterChip({ taken, total }: { taken: number; total: number }) {
  return (
    <FlexWidget
      style={{
        backgroundColor: pillappColors.primarySoft,
        borderWidth: 1,
        borderColor: pillappColors.borderStrong,
        borderRadius: pillappRadius.pill,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginLeft: 8,
      }}
    >
      <TextWidget
        text={`${taken}/${total}`}
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: pillappColors.primaryDark,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Un pallino invece dell'etichetta di stato: sul widget la larghezza è preziosa
 * e il nome del farmaco viene prima.
 */
function StatusDot({ color }: { color: `#${string}` }) {
  return (
    <FlexWidget
      style={{
        width: 12,
        height: 12,
        borderRadius: pillappRadius.pill,
        backgroundColor: color,
        marginLeft: 10,
      }}
    />
  );
}

function DoseCard({ dose }: { dose: DoseEvent }) {
  const tone = statusTone(dose.status);
  const quantity = dose.dose.trim();

  return (
    <FlexWidget
      accessibilityLabel={`${dose.medicationName} alle ${dose.scheduledTime}${quantity ? `, ${quantity}` : ""}. ${statusLabel(dose.status)}.`}
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: pillappRadius[2],
        /* Il gradiente sostituisce il bordo: lo stato resta nel pallino e nel dosaggio. */
        backgroundGradient: PAGE_WASH,
      }}
    >
      <TextWidget
        text={dose.scheduledTime}
        style={{
          fontSize: 19,
          fontWeight: "bold",
          color: pillappColors.textPrimary,
          marginRight: 12,
        }}
      />
      <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
        <TextWidget
          text={dose.medicationName}
          maxLines={2}
          truncate="END"
          style={{ fontSize: 16, color: pillappColors.textSecondary }}
        />
        {quantity ? (
          <TextWidget
            text={quantity}
            maxLines={1}
            truncate="END"
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: tone.text,
              marginTop: 3,
            }}
          />
        ) : null}
      </FlexWidget>
      <StatusDot color={tone.text} />
    </FlexWidget>
  );
}

function EmptyCard({ hasActiveMedications }: { hasActiveMedications: boolean }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: pillappRadius[2],
        backgroundGradient: PAGE_WASH,
      }}
    >
      <TextWidget
        text={hasActiveMedications ? "Nessuna dose oggi" : "Nessuna terapia attiva"}
        maxLines={1}
        truncate="END"
        style={{
          fontSize: 17,
          fontWeight: "bold",
          color: pillappColors.textPrimary,
        }}
      />
      <TextWidget
        text={
          hasActiveMedications
            ? "Oggi non è previsto nulla dal tuo piano"
            : "Tocca per aggiungere il primo farmaco"
        }
        maxLines={2}
        style={{ fontSize: 14, color: pillappColors.textMuted, marginTop: 3 }}
      />
    </FlexWidget>
  );
}

export function TherapyTodayWidget({ data }: Props) {
  const dose = nextDose(data.doses);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Terapia di oggi. Tocca per aprire PillApp."
      style={{
        width: "match_parent",
        height: "match_parent",
        flexDirection: "column",
        backgroundColor: pillappColors.surface,
        borderRadius: pillappRadius[4],
        borderWidth: 1,
        borderColor: pillappColors.border,
        padding: PADDING,
      }}
    >
      <FlexWidget
        style={{
          width: "match_parent",
          height: "wrap_content",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <BrandLogo />
        <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
          <TextWidget
            text="Terapia di oggi"
            maxLines={1}
            truncate="END"
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: pillappColors.textPrimary,
            }}
          />
          <TextWidget
            text={headerSubtitle(dose, data)}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 13, color: pillappColors.textMuted }}
          />
        </FlexWidget>
        {data.doses.length > 0 ? (
          <CounterChip taken={data.takenCount} total={data.doses.length} />
        ) : null}
      </FlexWidget>

      <FlexWidget
        style={{
          width: "match_parent",
          height: 1,
          backgroundColor: pillappColors.border,
          marginTop: 8,
          marginBottom: 8,
        }}
      />

      {dose ? (
        <DoseCard dose={dose} />
      ) : (
        <EmptyCard hasActiveMedications={data.hasActiveMedications} />
      )}
    </FlexWidget>
  );
}
