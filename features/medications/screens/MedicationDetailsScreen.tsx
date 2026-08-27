import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { XStack, YStack } from "tamagui";

import { TherapyReminderSettings } from "@/components/therapy/therapy-reminder-settings";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppCardContent,
  AppInput,
  AppInputMultiline,
  AppScreen,
  AppSnackbar,
  AppText,
  AppTopBar,
  BrandIntroCard,
  EmptyState,
  InfoRow,
  MedicationScheduleCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui";
import {
  DEFAULT_NOTIFICATION_LEAD_ID,
  THERAPY_NOTIFICATION_LEAD_OPTIONS,
} from "@/constants/therapy-notification-lead";
import {
  DEFAULT_NOTIFICATION_REPEAT_ID,
  THERAPY_NOTIFICATION_REPEAT_OPTIONS,
} from "@/constants/therapy-notification-repeat";
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import {
  daysActiveToTherapyDayPlan,
  therapyDayPlanToDaysActive,
} from "@/lib/app-data/sync";
import { getQuantitaUnitLabel } from "@/lib/farmaci/form-values";
import {
  normalizeOrariForTimesPerDay,
  validateReminderSettings,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import { formatItalianDateTime } from "@/lib/time/datetime-labels";
import {
  MEDICATION_FORM_LABELS,
  type Medication,
  type QuantitaUnit,
  type UserProfile,
} from "@/types/domain";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function reminderFromMedication(
  medication: Medication,
  profile: UserProfile,
): TherapyReminderSettingsValue {
  const times = medication.schedule.times.filter(Boolean);
  const timesPerDay = Math.min(Math.max(times.length || 1, 1), 4);

  return {
    timesPerDay,
    orari: normalizeOrariForTimesPerDay(timesPerDay, times),
    dayPlan: daysActiveToTherapyDayPlan(medication.schedule.daysActive),
    notificationsEnabled: profile.notificationsEnabled,
    notificationSoundId: profile.notificationSoundId,
    notificationLeadId: medication.notificationLeadId ?? DEFAULT_NOTIFICATION_LEAD_ID,
    notificationRepeatId: medication.notificationRepeatId ?? DEFAULT_NOTIFICATION_REPEAT_ID,
  };
}

function optionLabel(
  options: readonly { id: string; label: string }[],
  id: string | undefined,
  fallback: string,
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}

function formatAddedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return formatItalianDateTime(date, false);
}

export function MedicationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getMedicationById,
    dosesToday,
    markDoseTaken,
    updateMedication,
    removeMedication,
    updateProfile,
    profile,
  } = useAppData();

  const medication = getMedicationById(id ?? "");
  const [editing, setEditing] = useState(false);
  const [dose, setDose] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState<TherapyReminderSettingsValue | null>(null);
  const [formError, setFormError] = useState("");
  const [snack, setSnack] = useState("");

  const todayDoses = useMemo(
    () => dosesToday.filter((d) => d.medicationId === id),
    [dosesToday, id],
  );

  if (!medication) {
    return (
      <AppScreen>
        <EmptyState
          title="Farmaco non trovato"
          description="Il farmaco richiesto non è più disponibile o l'identificativo non è valido."
          actionLabel="Torna ai farmaci"
          onAction={() => router.replace(AppRoutes.medications)}
        />
      </AppScreen>
    );
  }

  const unit: QuantitaUnit = medication.quantityUnit ?? "pillole";
  const unitLabel = getQuantitaUnitLabel(unit);
  const activeDays = medication.schedule.daysActive
    .map((active, index) => (active ? DAY_LABELS[index] : null))
    .filter(Boolean)
    .join(", ");

  const startEdit = () => {
    setDose(medication.dose);
    setQuantity(medication.quantityRemaining ?? "");
    setNotes(medication.notes ?? "");
    setReminder(reminderFromMedication(medication, profile));
    setFormError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormError("");
  };

  const saveEdit = () => {
    if (!reminder) return;
    const error = validateReminderSettings(reminder);
    if (error) {
      setFormError(error);
      return;
    }

    const orari = normalizeOrariForTimesPerDay(reminder.timesPerDay, reminder.orari);
    updateMedication({
      ...medication,
      dose: dose.trim() || medication.dose,
      notes: notes.trim() || undefined,
      quantityRemaining: quantity.trim() || undefined,
      schedule: {
        times: orari.slice(0, reminder.timesPerDay),
        daysActive: therapyDayPlanToDaysActive(reminder.dayPlan),
      },
      notificationLeadId: reminder.notificationLeadId,
      notificationRepeatId: reminder.notificationRepeatId,
    });

    if (reminder.notificationSoundId !== profile.notificationSoundId) {
      updateProfile({ notificationSoundId: reminder.notificationSoundId });
    }
    if (reminder.notificationsEnabled !== profile.notificationsEnabled) {
      updateProfile({ notificationsEnabled: reminder.notificationsEnabled });
    }

    setEditing(false);
    setSnack("Terapia aggiornata.");
  };

  const confirmDelete = () => {
    Alert.alert(
      "Elimina dalla terapia",
      `Vuoi togliere ${medication.name} dalla terapia? Anche i promemoria di questo farmaco verranno rimossi.`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () => {
            removeMedication(medication.id);
            router.replace(AppRoutes.medications);
          },
        },
      ],
    );
  };

  return (
    <AppScreen
      hero={
        <AppTopBar
          icon="pill"
          title={medication.name}
          subtitle={medication.dose}
          eyebrow={medication.source === "aic_scan" ? "Da scansione AIC" : "Inserimento manuale"}
          onBack={() => {
            if (editing) {
              cancelEdit();
              return;
            }
            router.back();
          }}
        />
      }
    >
      <BrandIntroCard
        icon="pill"
        title={medication.name}
        description={`${medication.dose} · ${medication.source === "aic_scan" ? "Aggiunto da scansione AIC" : "Inserito manualmente"}`}
      />

      {editing && reminder ? (
        <AppCard>
          <AppCardContent gap="$4">
            <SectionHeader
              title="Modifica terapia"
              description="Aggiorna dosaggio, orari, giorni e promemoria di questo farmaco."
            />
            <TherapyReminderSettings
              hideIntro
              value={reminder}
              onChange={setReminder}
              dose={dose}
              onDoseChange={setDose}
              unitaQuantita={unit}
            />
            <AppInput
              label={`Quantità in confezione (${unitLabel})`}
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^\d.,]/g, ""))}
              keyboardType="decimal-pad"
              hint={`Puoi aggiornare quante ${unitLabel} restano.`}
              accessibilityLabel={`Quantità restante in ${unitLabel}`}
            />
            <AppInputMultiline
              label="Note"
              value={notes}
              onChangeText={setNotes}
              placeholder="Istruzioni, avvertenze o dettagli utili"
              accessibilityLabel="Note sul farmaco"
            />
            {formError ? (
              <AppText variant="caption" color="error">
                {formError}
              </AppText>
            ) : null}
            <PrimaryButton icon="content-save-outline" fullWidth onPress={saveEdit}>
              Salva modifiche
            </PrimaryButton>
            <SecondaryButton fullWidth onPress={cancelEdit}>
              Annulla
            </SecondaryButton>
          </AppCardContent>
        </AppCard>
      ) : (
        <AppCard>
          <AppCardContent>
            <SectionHeader title="Informazioni" />
            <InfoRow label="Nome" value={medication.name} emphasized />
            <InfoRow label="Forma" value={MEDICATION_FORM_LABELS[medication.form]} />
            {medication.aic ? (
              <InfoRow label="Codice AIC" value={medication.aic} emphasized />
            ) : null}
            <InfoRow label="Dosaggio" value={medication.dose} emphasized />
            <InfoRow
              label="Orari"
              value={medication.schedule.times.join(" · ") || "Nessuno"}
              emphasized
            />
            <InfoRow label="Giorni attivi" value={activeDays || "Nessuno"} />
            <InfoRow
              label="Assunzioni al giorno"
              value={String(medication.schedule.times.length || 0)}
            />
            <InfoRow
              label="Quantità restante"
              value={
                medication.quantityRemaining?.trim()
                  ? `${medication.quantityRemaining.trim()} ${unitLabel}`
                  : "Non indicata"
              }
            />
            <InfoRow
              label="Anticipo notifica"
              value={optionLabel(
                THERAPY_NOTIFICATION_LEAD_OPTIONS,
                medication.notificationLeadId,
                "15 minuti prima",
              )}
            />
            <InfoRow
              label="Ripeti avviso"
              value={optionLabel(
                THERAPY_NOTIFICATION_REPEAT_OPTIONS,
                medication.notificationRepeatId,
                "Ogni 5 minuti",
              )}
            />
            {medication.notes ? <InfoRow label="Note" value={medication.notes} /> : null}
            <InfoRow label="Aggiunto il" value={formatAddedAt(medication.createdAt)} />
            <InfoRow
              label="Origine"
              value={medication.source === "aic_scan" ? "Scansione AIC" : "Inserimento manuale"}
            />
            <XStack width="100%" flexWrap="wrap" gap="$2" paddingTop="$1">
              <AppBadge
                label={medication.active ? "Terapia attiva" : "Sospesa"}
                tone={medication.active ? "success" : "neutral"}
              />
              {medication.source === "aic_scan" ? (
                <AppBadge label="Da AIC" tone="primary" />
              ) : null}
            </XStack>
          </AppCardContent>
        </AppCard>
      )}

      {!editing ? (
        <YStack width="100%" gap="$3">
          <SectionHeader
            title="Assunzioni di oggi"
            description={
              todayDoses.length > 0
                ? `${todayDoses.length} dose${todayDoses.length === 1 ? "" : "i"} programmate`
                : undefined
            }
          />
          {todayDoses.length === 0 ? (
            <EmptyState
              title="Nessuna dose oggi"
              description="Questo farmaco non ha assunzioni previste per oggi."
            />
          ) : (
            todayDoses.map((doseEvent) => (
              <MedicationScheduleCard
                key={doseEvent.id}
                dose={doseEvent}
                compact={doseEvent.status === "taken" || doseEvent.status === "skipped"}
                onMarkTaken={
                  doseEvent.status !== "taken" && doseEvent.status !== "skipped"
                    ? () => markDoseTaken(doseEvent.id)
                    : undefined
                }
              />
            ))
          )}
        </YStack>
      ) : null}

      {!editing ? (
        <YStack width="100%" gap="$3" marginTop="$2">
          <PrimaryButton icon="pencil-outline" fullWidth onPress={startEdit}>
            Modifica terapia
          </PrimaryButton>
          <SecondaryButton icon="history" fullWidth onPress={() => router.push(AppRoutes.journal)}>
            Vedi storico
          </SecondaryButton>
          <AppButton
            variant="danger"
            icon="delete-outline"
            fullWidth
            onPress={confirmDelete}
            accessibilityLabel={`Elimina ${medication.name} dalla terapia`}
          >
            Elimina dalla terapia
          </AppButton>
        </YStack>
      ) : null}

      <AppSnackbar visible={Boolean(snack)} message={snack} onDismiss={() => setSnack("")} />
    </AppScreen>
  );
}
