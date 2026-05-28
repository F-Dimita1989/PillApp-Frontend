import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const GUEST_PROFILE_KEY = 'pillapp:guestProfile';

export default function RootLayout() {
  const colors = Colors.light;
  const [showStartupLoader, setShowStartupLoader] = useState(true);
  const [isCheckingGuest, setIsCheckingGuest] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartupLoader(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadGuestProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
        setNeedsOnboarding(!saved);
      } finally {
        setIsCheckingGuest(false);
      }
    };

    void loadGuestProfile();
  }, []);

  const completeOnboarding = async () => {
    const normalizedName = guestName.trim();
    if (!normalizedName) {
      return;
    }
    await AsyncStorage.setItem(
      GUEST_PROFILE_KEY,
      JSON.stringify({
        name: normalizedName,
        createdAt: new Date().toISOString(),
      })
    );
    setNeedsOnboarding(false);
  };

  if (showStartupLoader) {
    return (
      <LinearGradient colors={['#EAF8FF', '#D7F0FF', '#C7E8FF']} style={styles.gradientBackground}>
        <View style={styles.loaderContainer}>
          <Image source={require('@/assets/images/pillapp-splash.png')} style={styles.loaderImage} />
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </LinearGradient>
    );
  }

  if (isCheckingGuest) {
    return (
      <LinearGradient colors={['#EAF8FF', '#D7F0FF', '#C7E8FF']} style={styles.gradientBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </LinearGradient>
    );
  }

  if (needsOnboarding) {
    const onboardingCardBg = '#FFFFFF';
    const onboardingCardBorder = '#D0D5DD';
    const inputBg = '#F8FAFC';
    const inputBorder = '#98A2B3';

    return (
      <ThemeProvider value={DefaultTheme}>
        <LinearGradient colors={['#EAF8FF', '#D7F0FF', '#C7E8FF']} style={styles.gradientBackground}>
          <View style={styles.onboardingScreen}>
          <ScrollView contentContainerStyle={styles.onboardingContainer}>
            <Image source={require('@/assets/images/pillapp-splash.png')} style={styles.onboardingLogo} />
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>Benvenuto in PillApp</Text>
            <Text style={[styles.onboardingSubtitle, { color: colors.text }]}>
              Prima di iniziare, inserisci il tuo nome o nickname.
            </Text>

            <View
              style={[
                styles.onboardingCard,
                {
                  backgroundColor: onboardingCardBg,
                  borderColor: onboardingCardBorder,
                },
              ]}>
              <TextInput
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Es. Mario o SuperNonna"
                placeholderTextColor="#667085"
                style={[
                  styles.onboardingInput,
                  {
                    color: colors.text,
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}
              />
              <Text style={[styles.onboardingHint, { color: colors.text }]}>
                PillApp scansiona il codice AIC, recupera i dati del farmaco e ti aiuta a creare il piano terapeutico settimanale con promemoria.
              </Text>
              <Pressable
                style={[
                  styles.onboardingButton,
                  {
                    backgroundColor: colors.tint,
                    opacity: guestName.trim() ? 1 : 0.5,
                  },
                ]}
                disabled={!guestName.trim()}
                onPress={() => void completeOnboarding()}>
                <Text style={styles.onboardingButtonText}>Inizia</Text>
              </Pressable>
            </View>
          </ScrollView>
          </View>
        </LinearGradient>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <LinearGradient colors={['#EAF8FF', '#D7F0FF', '#C7E8FF']} style={styles.gradientBackground}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      </LinearGradient>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderImage: {
    width: 220,
    height: 220,
  },
  onboardingScreen: {
    flex: 1,
  },
  onboardingContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: 'center',
    gap: 12,
  },
  onboardingLogo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  onboardingTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  onboardingCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  onboardingInput: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 18,
  },
  onboardingHint: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  onboardingButton: {
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
