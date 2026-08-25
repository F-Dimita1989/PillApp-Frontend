import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";
import { YStack } from "tamagui";

import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import { ProfileSummaryCard } from "@/components/profile/profile-summary-card";
import {
  AppCard,
  AppCardContent,
  AppListItem,
  AppScreen,
  AppSnackbar,
  AppSwitch,
  AppText,
  AppTopBar,
  PrimaryButton,
  SectionHeader,
} from "@/components/ui";
import { THERAPY_REMINDER_SOUNDS, type TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import { useAppData } from "@/features/store/app-data-context";
import {
  cancelAllMedicationReminders,
  syncMedicationReminders,
} from "@/lib/notifications/medication-reminders";
import { previewReminderSound } from "@/lib/notifications/preview-sound";
import {
  ensureNotificationPermissions,
  getNotificationPermissionStatus,
} from "@/lib/notifications/setup";
import type { ProfileAvatarId } from "@/constants/profile-avatars";

export function ProfileScreen() {
  const {
    profile,
    updateProfile,
    adherenceToday,
    medications,
    measurements,
    journalNotes,
  } = useAppData();
  const [snack, setSnack] = useState("");
  const [previewing, setPreviewing] = useState(false);

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
          const count = await syncMedicationReminders(medications, true, {
            soundId: profile.notificationSoundId,
            playSound: profile.notificationSoundEnabled,
          });
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
    [
      medications,
      profile.notificationSoundEnabled,
      profile.notificationSoundId,
      updateProfile,
    ],
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

  const previewSound = useCallback(async () => {
    setPreviewing(true);
    try {
      await previewReminderSound(
        profile.notificationSoundId,
        profile.notificationSoundEnabled,
      );
      setSnack(
        profile.notificationSoundEnabled
          ? "Ascolta: la prova arriverà tra un attimo."
          : "Prova silenziosa in arrivo: solo vibrazione e avviso.",
      );
    } catch (error) {
      setSnack(
        error instanceof Error ? error.message : "Impossibile provare la suoneria.",
      );
    } finally {
      setPreviewing(false);
    }
  }, [profile.notificationSoundEnabled, profile.notificationSoundId]);

  const setSound = (soundId: TherapyReminderSoundId) => {
    updateProfile({ notificationSoundId: soundId });
    setSnack("Suoneria aggiornata. I prossimi promemoria useranno questo suono.");
  };

  return (
    <AppScreen
      hero={
        <AppTopBar
          icon="account-heart-outline"
          eyebrow="Il tuo spazio"
          title="Profilo"
          subtitle="Riepilogo, accessibilità, avatar e suoni dei promemoria."
        />
      }
    >
      <ProfileSummaryCard
        profile={profile}
        medicationCount={medications.filter((item) => item.active).length}
        adherencePercent={adherenceToday.percentage}
        measurementCount={measurements.length}
        noteCount={journalNotes.length}
      />

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Avatar"
          description="Scegli un simbolo facile da riconoscere."
        />
        <AppCard>
          <AppCardContent>
            <ProfileAvatarPicker
              value={profile.avatarId}
              onChange={(avatarId: ProfileAvatarId) => updateProfile({ avatarId })}
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Accessibilità"
          description="Opzioni pensate per lettura più chiara e tap più sicuri."
        />
        <AppCard>
          <AppCardContent gap="$0">
            <AppListItem
              title="Testo più grande"
              description="Ingrandisce scritte in tutta l'app, più leggibili."
              icon="format-size"
              trailing={
                <AppSwitch
                  value={profile.largeText}
                  onValueChange={(largeText) => updateProfile({ largeText })}
                  accessibilityLabel="Testo più grande"
                />
              }
            />
            <AppListItem
              title="Contrasto alto"
              description="Testi più scuri e bordi più visibili."
              icon="contrast-circle"
              trailing={
                <AppSwitch
                  value={profile.highContrast}
                  onValueChange={(highContrast) => updateProfile({ highContrast })}
                  accessibilityLabel="Contrasto alto"
                />
              }
            />
            <AppListItem
              title="Pulsanti più grandi"
              description="Aree di tocco più ampie, più facili da premere."
              icon="gesture-tap"
              trailing={
                <AppSwitch
                  value={profile.easyTap}
                  onValueChange={(easyTap) => updateProfile({ easyTap })}
                  accessibilityLabel="Pulsanti più grandi"
                />
              }
            />
            <AppListItem
              title="Riduci animazioni"
              description="Meno movimenti: più stabile per chi è sensibile."
              icon="motion"
              trailing={
                <AppSwitch
                  value={profile.reduceMotion}
                  onValueChange={(reduceMotion) => updateProfile({ reduceMotion })}
                  accessibilityLabel="Riduci animazioni"
                />
              }
            />
            <AppListItem
              title="Vibrazione di conferma"
              description="Un piccolo tocco quando confermi o premi un pulsante."
              icon="vibrate"
              trailing={
                <AppSwitch
                  value={profile.hapticsEnabled}
                  onValueChange={(hapticsEnabled) => updateProfile({ hapticsEnabled })}
                  accessibilityLabel="Vibrazione di conferma"
                />
              }
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Notifiche e suonerie"
          description="Scegli come vuoi essere avvisato per i farmaci."
        />
        <AppCard>
          <AppCardContent gap="$0">
            <AppListItem
              title="Promemoria farmaci"
              description="Ricevi avvisi per le assunzioni programmate"
              trailing={
                <AppSwitch
                  value={profile.notificationsEnabled}
                  onValueChange={(value) => void handleNotificationsToggle(value)}
                  accessibilityLabel="Attiva promemoria farmaci"
                  accessibilityHint="Richiede il permesso notifiche del telefono"
                />
              }
            />
            <AppListItem
              title="Suono della notifica"
              description="Se spento, il promemoria vibra senza suonare"
              trailing={
                <AppSwitch
                  value={profile.notificationSoundEnabled}
                  onValueChange={(notificationSoundEnabled) =>
                    updateProfile({ notificationSoundEnabled })
                  }
                  accessibilityLabel="Suono della notifica"
                />
              }
            />
          </AppCardContent>
        </AppCard>

        {profile.notificationsEnabled ? (
          <AppCard>
            <AppCardContent>
              <AppText variant="overline" color="primary">
                Suoneria
              </AppText>
              {THERAPY_REMINDER_SOUNDS.map((sound) => {
                const selected = profile.notificationSoundId === sound.id;
                return (
                  <AppListItem
                    key={sound.id}
                    title={sound.label}
                    description={sound.description}
                    icon={
                      sound.id === "soft"
                        ? "volume-medium"
                        : sound.id === "alert"
                          ? "bell-alert"
                          : "bell-ring"
                    }
                    trailing={
                      selected ? (
                        <AppText variant="label" color="primary">
                          Scelta
                        </AppText>
                      ) : undefined
                    }
                    onPress={() => setSound(sound.id)}
                    accessibilityLabel={`Scegli suoneria ${sound.label}`}
                    accessibilityState={{ selected }}
                  />
                );
              })}
              <PrimaryButton
                icon="play"
                fullWidth
                loading={previewing}
                onPress={() => void previewSound()}
                accessibilityHint="Invia una notifica di prova tra un secondo"
              >
                Prova suoneria
              </PrimaryButton>
            </AppCardContent>
          </AppCard>
        ) : null}

        <AppCard>
          <AppCardContent gap="$0">
            <AppListItem
              title="Verifica permesso notifiche"
              description="Controlla se PillApp può inviare avvisi"
              icon="bell-check-outline"
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
                  onValueChange={(scanHintsEnabled) =>
                    updateProfile({ scanHintsEnabled })
                  }
                  accessibilityLabel="Suggerimenti scansione AIC"
                />
              }
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionHeader title="Privacy e informazioni" />
        <AppCard>
          <AppCardContent gap="$0">
            <AppListItem
              title="Dati salvati sul telefono"
              description="Le informazioni restano sul dispositivo finché non attivi un backup cloud."
              icon="shield-check-outline"
            />
            <AppListItem
              title="Report per il medico"
              description="Dal Diario puoi salvare un PDF e inviarlo al tuo medico."
              icon="file-pdf-box"
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
