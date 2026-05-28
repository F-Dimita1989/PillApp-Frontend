import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const LAST_SCANNED_FARMACO_KEY = 'pillapp:lastScannedFarmaco';
const PLAN_KEY = 'pillapp:weeklyTherapyPlan';
const PLAN_NOTIFICATION_IDS_KEY = 'pillapp:weeklyTherapyNotificationIds';
const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'] as const;

type DayKey = (typeof DAYS)[number];
type DayPlan = Record<DayKey, boolean>;

const INITIAL_DAY_PLAN: DayPlan = {
  Lun: true,
  Mar: true,
  Mer: true,
  Gio: true,
  Ven: true,
  Sab: false,
  Dom: false,
};

const DAY_TO_WEEKDAY: Record<DayKey, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  Dom: 1,
  Lun: 2,
  Mar: 3,
  Mer: 4,
  Gio: 5,
  Ven: 6,
  Sab: 7,
};

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
    panelBorder: '#C7DFF2',
    panelBg: '#F2FAFF',
    inputBorder: '#B8D4E8',
    inputBg: '#FFFFFF',
    placeholder: '#667085',
    chipBorder: '#B8D4E8',
    chipBg: '#EAF6FF',
    chipActiveBorder: colors.tint,
    chipActiveBg: '#DCE8FF',
    chipActiveText: '#0F172A',
    saveButton: '#0B5FFF',
    success: '#1B8A3E',
  } as const;
  const insets = useSafeAreaInsets();
  const [aic, setAic] = useState('');
  const [farmacoNome, setFarmacoNome] = useState('');
  const [orario, setOrario] = useState('08:00');
  const [dose, setDose] = useState('1 compressa');
  const [note, setNote] = useState('');
  const [dayPlan, setDayPlan] = useState<DayPlan>(INITIAL_DAY_PLAN);
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
            dayPlan?: Partial<DayPlan>;
          };
          setAic(saved.aic ?? '');
          setFarmacoNome(saved.farmacoNome ?? '');
          setOrario(saved.orario ?? '08:00');
          setDose(saved.dose ?? '1 compressa');
          setNote(saved.note ?? '');
          setDayPlan({
            ...INITIAL_DAY_PLAN,
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

  const toggleDay = (day: DayKey) => {
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

    const activeDays = DAYS.filter((day) => dayPlan[day]);
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
          weekday: DAY_TO_WEEKDAY[day],
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
      setSaveMessage(`Piano salvato. Promemoria attivi: ${reminders} a settimana.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore salvataggio terapia.';
      setSaveMessage(`Attenzione: ${message}`);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}>
        <ThemedText type="title">Terapia Utente</ThemedText>
        <ThemedText style={styles.subtitle}>
          Crea il tuo piano terapeutico settimanale a partire dal farmaco scansionato.
        </ThemedText>

        <ThemedView
          style={[
            styles.card,
            {
              borderColor: ui.panelBorder,
              backgroundColor: ui.panelBg,
            },
          ]}>
          <ThemedText type="subtitle">Farmaco</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: ui.inputBorder,
                color: colors.text,
                backgroundColor: ui.inputBg,
              },
            ]}
            value={aic}
            onChangeText={setAic}
            placeholder="Codice AIC"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[
              styles.input,
              {
                borderColor: ui.inputBorder,
                color: colors.text,
                backgroundColor: ui.inputBg,
              },
            ]}
            value={farmacoNome}
            onChangeText={setFarmacoNome}
            placeholder="Nome farmaco"
            placeholderTextColor={ui.placeholder}
          />
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            {
              borderColor: ui.panelBorder,
              backgroundColor: ui.panelBg,
            },
          ]}>
          <ThemedText type="subtitle">Programmazione</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: ui.inputBorder,
                color: colors.text,
                backgroundColor: ui.inputBg,
              },
            ]}
            value={orario}
            onChangeText={setOrario}
            placeholder="Orario (es. 08:00)"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[
              styles.input,
              {
                borderColor: ui.inputBorder,
                color: colors.text,
                backgroundColor: ui.inputBg,
              },
            ]}
            value={dose}
            onChangeText={setDose}
            placeholder="Dose (es. 1 compressa)"
            placeholderTextColor={ui.placeholder}
          />
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                borderColor: ui.inputBorder,
                color: colors.text,
                backgroundColor: ui.inputBg,
              },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Note utili (facoltative)"
            placeholderTextColor={ui.placeholder}
            multiline
          />
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            {
              borderColor: ui.panelBorder,
              backgroundColor: ui.panelBg,
            },
          ]}>
          <ThemedText type="subtitle">Giorni della settimana</ThemedText>
          <ThemedText style={styles.helper}>Giorni attivi: {activeDaysCount}/7</ThemedText>
          <ThemedView style={styles.daysGrid}>
            {DAYS.map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayChip,
                  {
                    borderColor: ui.chipBorder,
                    backgroundColor: ui.chipBg,
                  },
                  dayPlan[day] ? styles.dayChipActive : null,
                  dayPlan[day] ? { borderColor: ui.chipActiveBorder, backgroundColor: ui.chipActiveBg } : null,
                ]}
                onPress={() => toggleDay(day)}>
                <ThemedText style={[styles.dayChipText, { color: dayPlan[day] ? ui.chipActiveText : colors.text }]}>
                  {day}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        <Pressable
          style={[styles.saveButton, { backgroundColor: ui.saveButton }]}
          onPress={() => void savePlan()}>
          <ThemedText style={styles.saveButtonText}>Salva piano settimanale</ThemedText>
        </Pressable>
        {saveMessage ? (
          <ThemedText style={[styles.successText, { color: ui.success }]}>
            {saveMessage}
          </ThemedText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    opacity: 0.9,
  },
  card: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 17,
    color: '#E0E0E0',
    backgroundColor: '#1F1F1F',
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 14,
    opacity: 0.8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minWidth: 58,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1F1F1F',
  },
  dayChipActive: {
    borderColor: '#0B5FFF',
    backgroundColor: '#163E94',
  },
  dayChipText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#0B5FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  successText: {
    color: '#1B8A3E',
    fontWeight: '700',
  },
});
