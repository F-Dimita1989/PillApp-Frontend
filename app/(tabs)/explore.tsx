import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ScreenSafeArea } from '@/components/screen-safe-area';
import { TherapyWeekCalendar } from '@/components/therapy-week-calendar';
import { syncTherapyPlanToDeviceCalendar } from '@/lib/calendar/device-calendar';
import {
  INITIAL_THERAPY_DAY_PLAN,
  THERAPY_DAY_TO_WEEKDAY,
  THERAPY_DAYS,
  type TherapyDayKey,
  type TherapyDayPlan,
} from '@/lib/therapy/types';

const LAST_SCANNED_FARMACO_KEY = 'pillapp:lastScannedFarmaco';
const PLAN_KEY = 'pillapp:weeklyTherapyPlan';
const PLAN_NOTIFICATION_IDS_KEY = 'pillapp:weeklyTherapyNotificationIds';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TherapyUserScreen() {
  const colors = Colors.light;
  const ui = {
    mutedBorder: '#B8D4E8',
    inputBg: '#F8FAFC',
    placeholder: '#667085',
    saveButton: '#0B5FFF',
    success: '#1B8A3E',
    error: '#C62828',
  } as const;
  const [aic, setAic] = useState('');
  const [farmacoNome, setFarmacoNome] = useState('');
  const [orario, setOrario] = useState('08:00');
  const [dose, setDose] = useState('1 compressa');
  const [note, setNote] = useState('');
  const [dayPlan, setDayPlan] = useState<TherapyDayPlan>(INITIAL_THERAPY_DAY_PLAN);
  const [saveMessage, setSaveMessage] = useState('');

  const activeDaysCount = useMemo(() => Object.values(dayPlan).filter(Boolean).length, [dayPlan]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const hydrateData = async () => {
        const [scannedRaw, savedPlanRaw] = await Promise.all([
          AsyncStorage.getItem(LAST_SCANNED_FARMACO_KEY),
          AsyncStorage.getItem(PLAN_KEY),
        ]);

        if (!isMounted) return;

        if (scannedRaw) {
          const parsed = JSON.parse(scannedRaw) as {
            aic?: string;
            data?: Record<string, unknown>;
          };
          const nomeDaScansione =
            (parsed.data?.nome as string | undefined) ||
            (parsed.data?.denominazione as string | undefined) ||
            (parsed.data?.nome_commerciale as string | undefined) ||
            '';
          setAic(parsed.aic ?? '');
          setFarmacoNome(nomeDaScansione);
        }

        if (savedPlanRaw) {
          const saved = JSON.parse(savedPlanRaw) as {
            aic?: string;
            farmacoNome?: string;
            orario?: string;
            dose?: string;
            note?: string;
            dayPlan?: Partial<TherapyDayPlan>;
          };
          setAic(saved.aic ?? '');
          setFarmacoNome(saved.farmacoNome ?? '');
          setOrario(saved.orario ?? '08:00');
          setDose(saved.dose ?? '1 compressa');
          setNote(saved.note ?? '');
          setDayPlan({
            ...INITIAL_THERAPY_DAY_PLAN,
            ...(saved.dayPlan ?? {}),
          });
        }
      };

      void hydrateData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const toggleDay = (day: TherapyDayKey) => {
    setDayPlan((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const parseTime = (rawTime: string): { hour: number; minute: number } | null => {
    const match = rawTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) {
      return null;
    }
    return {
      hour: Number(match[1]),
      minute: Number(match[2]),
    };
  };

  const clearPreviousNotifications = async () => {
    const existingIdsRaw = await AsyncStorage.getItem(PLAN_NOTIFICATION_IDS_KEY);
    const existingIds = existingIdsRaw ? (JSON.parse(existingIdsRaw) as string[]) : [];
    await Promise.all(existingIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    await AsyncStorage.removeItem(PLAN_NOTIFICATION_IDS_KEY);
  };

  const scheduleWeeklyNotifications = async (): Promise<number> => {
    const time = parseTime(orario);
    if (!time) {
      throw new Error('Formato orario non valido. Usa HH:mm (es. 08:00).');
    }

    const activeDays = THERAPY_DAYS.filter((day) => dayPlan[day]);
    if (activeDays.length === 0) {
      throw new Error('Seleziona almeno un giorno della settimana per i promemoria.');
    }

    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (finalStatus !== 'granted') {
      const request = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }
    if (finalStatus !== 'granted') {
      throw new Error('Permesso notifiche non concesso.');
    }

    await clearPreviousNotifications();

    const notificationIds: string[] = [];
    for (const day of activeDays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Promemoria terapia',
          body: `${farmacoNome || 'Farmaco'} - ${dose} alle ${orario}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: THERAPY_DAY_TO_WEEKDAY[day],
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
      notificationIds.push(id);
    }

    await AsyncStorage.setItem(PLAN_NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
    return notificationIds.length;
  };

  const savePlan = async () => {
    try {
      const payload = {
        aic,
        farmacoNome,
        orario,
        dose,
        note,
        dayPlan,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(payload));
      const reminders = await scheduleWeeklyNotifications();

      let calendarEvents = 0;
      try {
        calendarEvents = await syncTherapyPlanToDeviceCalendar({
          farmacoNome,
          orario,
          dose,
          dayPlan,
        });
      } catch (calendarError) {
        const message =
          calendarError instanceof Error
            ? calendarError.message
            : 'Errore sincronizzazione calendario.';
        setSaveMessage(
          `Piano salvato. Promemoria: ${reminders}. Calendario: ${message}`,
        );
        return;
      }

      setSaveMessage(
        `Piano salvato. Promemoria: ${reminders}. Eventi nel calendario del telefono: ${calendarEvents}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore salvataggio terapia.';
      setSaveMessage(`Attenzione: ${message}`);
    }
  };

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, styles.scrollContent]}>
        <ThemedText type="title">Terapia Utente</ThemedText>
        <ThemedText style={styles.subtitle}>
          Programma la terapia e visualizza la settimana dal calendario reale del telefono.
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle">Farmaco</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: ui.mutedBorder, color: colors.text, backgroundColor: ui.inputBg }]}
            value={aic}
            onChangeText={setAic}
            placeholder="Codice AIC"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[styles.input, { borderColor: ui.mutedBorder, color: colors.text, backgroundColor: ui.inputBg }]}
            value={farmacoNome}
            onChangeText={setFarmacoNome}
            placeholder="Nome farmaco"
            placeholderTextColor={ui.placeholder}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Programmazione</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: ui.mutedBorder, color: colors.text, backgroundColor: ui.inputBg }]}
            value={orario}
            onChangeText={setOrario}
            placeholder="Orario (es. 08:00)"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[styles.input, { borderColor: ui.mutedBorder, color: colors.text, backgroundColor: ui.inputBg }]}
            value={dose}
            onChangeText={setDose}
            placeholder="Dose (es. 1 compressa)"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[styles.input, styles.notesInput, { borderColor: ui.mutedBorder, color: colors.text, backgroundColor: ui.inputBg }]}
            value={note}
            onChangeText={setNote}
            placeholder="Note utili (facoltative)"
            placeholderTextColor={ui.placeholder}
            multiline
          />
        </View>

        <View style={styles.section}>
          <TherapyWeekCalendar dayPlan={dayPlan} onToggleDay={toggleDay} />
          <ThemedText style={styles.helper}>
            Giorni terapia attivi: {activeDaysCount}/7 · Tocca un giorno per attivarlo o disattivarlo
          </ThemedText>
        </View>

        <Pressable
          style={[styles.saveButton, { backgroundColor: ui.saveButton }]}
          onPress={() => void savePlan()}>
          <ThemedText style={styles.saveButtonText}>Salva piano settimanale</ThemedText>
        </Pressable>
        {saveMessage ? (
          <ThemedText
            style={[
              styles.feedbackText,
              { color: saveMessage.startsWith('Attenzione') ? ui.error : ui.success },
            ]}>
            {saveMessage}
          </ThemedText>
        ) : null}
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    gap: 14,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    opacity: 0.9,
  },
  section: {
    gap: 10,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 17,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 14,
    opacity: 0.85,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackText: {
    fontWeight: '600',
    lineHeight: 22,
  },
});
