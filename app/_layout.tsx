import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { PostOnboardingFlow } from "@/components/post-onboarding-flow";
import { StartupSplash } from "@/components/startup-splash";
import { pillappColors } from "@/theme/tokens";
import { getHasCompletedAccessSetup } from "@/lib/access-setup/storage";
import { getHasSeenOnboarding } from "@/lib/onboarding/storage";
import { initializeNotifications } from "@/lib/notifications/setup";
import { hasCompletedSetup } from "@/lib/profile/storage";
import { AppThemeProvider } from "@/providers/app-theme-provider";
import { PillAppCoachmarkProvider } from "@/providers/coachmark-provider";
import { AppDataProvider } from "@/features/store/app-data-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

void SplashScreen.preventAutoHideAsync().catch(() => {});

void SystemUI.setBackgroundColorAsync(pillappColors.background);
void initializeNotifications();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: pillappColors.primary,
    background: pillappColors.background,
    card: pillappColors.surface,
    text: pillappColors.textPrimary,
    border: pillappColors.border,
  },
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [needsAccessSetup, setNeedsAccessSetup] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [seenOnboarding, accessSetupDone, setupDone] = await Promise.all([
          getHasSeenOnboarding(),
          getHasCompletedAccessSetup(),
          hasCompletedSetup(),
        ]);

        setHasSeenOnboarding(seenOnboarding);
        setNeedsAccessSetup(seenOnboarding && !accessSetupDone);
        setNeedsSetup(!setupDone);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    void bootstrap();
  }, []);

  const handleAccessSetupComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    setNeedsAccessSetup(false);
  }, []);

  const handleSkipProfileSetup = useCallback(() => {
    setHasSeenOnboarding(true);
    setNeedsSetup(false);
  }, []);

  if (isLoading) {
    return (
      <AppThemeProvider>
        <PillAppCoachmarkProvider>
          <SafeAreaProvider>
            <StartupSplash />
          </SafeAreaProvider>
        </PillAppCoachmarkProvider>
      </AppThemeProvider>
    );
  }

  if (!hasSeenOnboarding || needsAccessSetup) {
    return (
      <AppThemeProvider>
        <PillAppCoachmarkProvider>
          <SafeAreaProvider>
            <ThemeProvider value={navigationTheme}>
              <OnboardingFlow
                startAtAccessSetup={hasSeenOnboarding && needsAccessSetup}
                onComplete={handleAccessSetupComplete}
                onSkipProfileSetup={handleSkipProfileSetup}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        </PillAppCoachmarkProvider>
      </AppThemeProvider>
    );
  }

  if (needsSetup) {
    return (
      <AppThemeProvider>
        <PillAppCoachmarkProvider>
          <SafeAreaProvider>
            <ThemeProvider value={navigationTheme}>
              <PostOnboardingFlow onComplete={() => setNeedsSetup(false)} />
              <StatusBar style="dark" />
            </ThemeProvider>
          </SafeAreaProvider>
        </PillAppCoachmarkProvider>
      </AppThemeProvider>
    );
  }

  return (
    <AppThemeProvider>
      <AppDataProvider>
        <PillAppCoachmarkProvider>
          <SafeAreaProvider>
            <ThemeProvider value={navigationTheme}>
              <View style={{ flex: 1, backgroundColor: pillappColors.background }}>
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: "transparent" },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                </Stack>
              </View>
              <StatusBar style="dark" />
            </ThemeProvider>
          </SafeAreaProvider>
        </PillAppCoachmarkProvider>
      </AppDataProvider>
    </AppThemeProvider>
  );
}
