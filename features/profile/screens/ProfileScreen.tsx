import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";
import { YStack } from "tamagui";

import {
  AppCard,
  AppCardContent,
  AppListItem,
  AppScreen,
  AppSnackbar,
  AppSwitch,
  AppText,
  AppTopBar,
  SectionHeader,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import {
  cancelAllMedicationReminders,
  syncMedicationReminders,
} from "@/lib/notifications/medication-reminders";
import {
  ensureNotificationPermissions,
  getNotificationPermissionStatus,
} from "@/lib/notifications/setup";

export function ProfileScreen() {
  const { profile, updateProfile, adherenceToday, medications } = useAppData();
  const [snack, setSnack] = useState("");

  const handleNotificationsToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await ensureNotificationPermissions();
        if (!granted) {
          setSnack(
            Platform.OS === "android"
              ? "Permesso negato. Abilita le notifiche nelle impostazioni di Android."
              : "Permesso negato. Abilita le notifiche nelle impostazioni di iOS.",
          );
          updateProfile({ notificationsEnabled: false });
          return;
        }

        updateProfile({ notificationsEnabled: true });
        try {
          const count = await syncMedicationReminders(medications, true);
          setSnack(
            count > 0
              ? `${count} promemoria programmati sul telefono.`
              : "Notifiche attive. Aggiungi farmaci per i promemoria.",
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Errore programmazione promemoria.";
          setSnack(message);
        }
        return;
      }

      updateProfile({ notificationsEnabled: false });
      await cancelAllMedicationReminders();
      setSnack("Promemoria disattivati.");
    },
    [medications, updateProfile],
  );

  const openSystemSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const checkPermission = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    if (status === "granted") {
      setSnack("Notifiche già autorizzate.");
    } else {
      setSnack("Notifiche non autorizzate. Apri le impostazioni del telefono.");
    }
  }, []);

  return (
    <AppScreen>
      <AppTopBar
        title="Profilo"
        subtitle="Impostazioni personali, notifiche e accessibilità."
      />

      <AppCard variant="highlight">
        <AppCardContent>
          <YStack gap="$2">
            <AppText variant="overline" color="primary">
              Il tuo profilo
            </AppText>
            <AppText variant="headline">
              {profile.name || "Utente PillApp"}
            </AppText>
            {profile.birthYear ? (
              <AppText variant="body" muted>
                Nato/a nel {profile.birthYear}
              </AppText>
            ) : null}
            <AppText variant="title" color="primary">
              Aderenza oggi: {adherenceToday.percentage}%
            </AppText>
          </YStack>
        </AppCardContent>
      </AppCard>

      <YStack width="100%" gap="$3">
        <SectionHeader title="Notifiche e promemoria" />
        <AppCard variant="outlined">
          <AppCardContent gap="$0">
            <AppListItem
              title="Promemoria farmaci"
              description="Ricevi avvisi per le assunzioni programmate"
              trailing={
                <AppSwitch
                  value={profile.notificationsEnabled}
                  onValueChange={(v) => void handleNotificationsToggle(v)}
                  accessibilityLabel="Attiva promemoria farmaci"
                  accessibilityHint="Richiede il permesso notifiche del telefono"
                />
              }
            />
            <AppListItem
              title="Verifica permesso notifiche"
              description="Controlla se PillApp può inviare avvisi"
              icon="bell-ring-outline"
              onPress={() => void checkPermission()}
              accessibilityLabel="Verifica permesso notifiche"
            />
            <AppListItem
              title="Impostazioni di sistema"
              description="Apri le impostazioni del telefono per PillApp"
              icon="cog-outline"
              onPress={() => void openSystemSettings()}
              accessibilityLabel="Apri impostazioni di sistema"
            />
            <AppListItem
              title="Suggerimenti scansione AIC"
              description="Mostra consigli durante la scansione del codice"
              trailing={
                <AppSwitch
                  value={profile.scanHintsEnabled}
                  onValueChange={(v) => updateProfile({ scanHintsEnabled: v })}
                  accessibilityLabel="Suggerimenti scansione AIC"
                />
              }
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionHeader title="Accessibilità" />
        <AppCard variant="outlined">
          <AppCardContent>
            <AppListItem
              title="Testo più grande"
              description="Aumenta la dimensione del testo nelle schermate principali"
              trailing={
                <AppSwitch
                  value={profile.largeText}
                  onValueChange={(v) => updateProfile({ largeText: v })}
                  accessibilityLabel="Testo più grande"
                />
              }
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionHeader title="Privacy e informazioni" />
        <AppCard variant="outlined">
          <AppCardContent gap="$0">
            <AppListItem
              title="Dati salvati sul telefono"
              description="Le informazioni restano sul dispositivo finché non attivi un backup cloud."
              icon="shield-check-outline"
            />
            <AppListItem
              title="Report e condivisione"
              description="Esportazione PDF e invio al medico — in arrivo."
              icon="file-export-outline"
            />
            <AppListItem
              title="Versione PillApp"
              description="1.0.0 — Mercato italiano, codice AIC integrato"
              icon="information-outline"
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <AppSnackbar
        visible={Boolean(snack)}
        message={snack}
        onDismiss={() => setSnack("")}
      />
    </AppScreen>
  );
}
