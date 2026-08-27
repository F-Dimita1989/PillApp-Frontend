import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";
import { XStack, YStack } from "tamagui";

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
  SecondaryButton,
  SectionHeader,
} from "@/components/ui";
import { SoundPreviewButton } from "@/components/ui/sound-preview-button";
import { THERAPY_REMINDER_SOUNDS, type TherapyReminderSoundId } from "@/constants/therapy-reminder-sounds";
import { useAppData } from "@/features/store/app-data-context";
import {
  cancelAllMedicationReminders,
  syncMedicationReminders,
} from "@/lib/notifications/medication-reminders";
import { previewReminderSound } from "@/lib/notifications/preview-sound";
import {
  ensureNotificationPermissions,
  reviewNotificationPermissions,
} from "@/lib/notifications/setup";
import {
  setSpeechRuntimeEnabled,
  speakAppText,
} from "@/lib/accessibility/speech";
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
  const [snackAction, setSnackAction] = useState<"settings" | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const showSnack = useCallback((message: string, action: "settings" | null = null) => {
    setSnackAction(action);
    setSnack(message);
  }, []);

  const dismissSnack = useCallback(() => {
    setSnack("");
    setSnackAction(null);
  }, []);

  const openSystemSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const handleNotificationsToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await ensureNotificationPermissions();
        if (!granted) {
          showSnack(
            Platform.OS === "android"
              ? "Permesso negato. Abilita le notifiche nelle impostazioni di Android."
              : "Permesso negato. Abilita le notifiche nelle impostazioni di iOS.",
            "settings",
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
          showSnack(
            count > 0
              ? `${count} promemoria programmati sul telefono.`
              : "Notifiche attive. Aggiungi farmaci per i promemoria.",
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Errore programmazione promemoria.";
          showSnack(message);
        }
        return;
      }

      updateProfile({ notificationsEnabled: false });
      await cancelAllMedicationReminders();
      showSnack("Promemoria disattivati.");
    },
    [
      medications,
      profile.notificationSoundEnabled,
      profile.notificationSoundId,
      showSnack,
      updateProfile,
    ],
  );

  const checkPermission = useCallback(async () => {
    try {
      const result = await reviewNotificationPermissions();
      if (result.granted) {
        showSnack("Notifiche autorizzate. PillApp può inviarti i promemoria.");
        return;
      }

      if (!result.canAskAgain) {
        showSnack(
          "Permesso disattivato. Aprilo dalle impostazioni del telefono.",
          "settings",
        );
        await Linking.openSettings();
        return;
      }

      showSnack(
        "Notifiche non autorizzate. Riprova oppure apri le impostazioni.",
        "settings",
      );
    } catch (error) {
      showSnack(
        error instanceof Error ? error.message : "Impossibile verificare i permessi.",
      );
    }
  }, [showSnack]);

  const playPreview = useCallback(
    async (soundId: TherapyReminderSoundId) => {
      setPreviewingId(soundId);
      try {
        await previewReminderSound(soundId, profile.notificationSoundEnabled);
        showSnack(
          profile.notificationSoundEnabled
            ? "Ascolta: è la prova della suoneria."
            : "Prova silenziosa in arrivo: solo vibrazione e avviso.",
        );
      } catch (error) {
        showSnack(
          error instanceof Error ? error.message : "Impossibile provare la suoneria.",
        );
      } finally {
        setPreviewingId(null);
      }
    },
    [profile.notificationSoundEnabled, showSnack],
  );

  const previewSound = useCallback(async () => {
    await playPreview(profile.notificationSoundId);
  }, [playPreview, profile.notificationSoundId]);

  const setSound = (soundId: TherapyReminderSoundId) => {
    updateProfile({ notificationSoundId: soundId });
    void playPreview(soundId);
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
          description="Testo più grande, contrasto, tap più sicuri e lettura vocale."
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
            <AppListItem
              title="Lettura vocale"
              description="Tocca un testo o un pulsante per ascoltarlo."
              icon="volume-high"
              trailing={
                <AppSwitch
                  value={profile.speechEnabled}
                  onValueChange={(speechEnabled) => {
                    setSpeechRuntimeEnabled(speechEnabled);
                    updateProfile({ speechEnabled });
                    if (speechEnabled) {
                      speakAppText(
                        "Lettura vocale attiva. All'apertura di una schermata leggerò il titolo. Tocca un testo per ascoltarlo.",
                        { force: true },
                      );
                    } else {
                      speakAppText("Lettura vocale disattivata.", { force: true });
                    }
                  }}
                  accessibilityLabel="Lettura vocale"
                />
              }
            />
            {profile.speechEnabled ? (
              <YStack paddingTop="$3" paddingBottom="$1">
                <SecondaryButton
                  icon="play-circle-outline"
                  fullWidth
                  onPress={() =>
                    speakAppText(
                      "Questa è una prova di lettura vocale. Tocca qualsiasi testo nell'app per ascoltarlo di nuovo.",
                      { force: true },
                    )
                  }
                >
                  Prova lettura vocale
                </SecondaryButton>
              </YStack>
            ) : null}
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
                      <XStack alignItems="center" gap="$2">
                        <SoundPreviewButton
                          loading={previewingId === sound.id}
                          onPress={() => void playPreview(sound.id)}
                          accessibilityLabel={`Prova ${sound.label}`}
                        />
                        {selected ? (
                          <AppText variant="label" color="primary">
                            Scelta
                          </AppText>
                        ) : null}
                      </XStack>
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
                loading={previewingId === profile.notificationSoundId}
                onPress={() => void previewSound()}
                accessibilityHint="Invia subito una notifica di prova"
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
        onDismiss={dismissSnack}
        actionLabel={snackAction === "settings" ? "Apri" : "OK"}
        onAction={
          snackAction === "settings" ? () => void openSystemSettings() : undefined
        }
      />
    </AppScreen>
  );
}
