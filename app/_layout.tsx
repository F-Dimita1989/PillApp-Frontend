import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppEntryFlow } from "@/components/app-entry-flow";
import { StartupSplash } from "@/components/startup-splash";
import { AppPatternBackground } from "@/components/ui/app-pattern-background";
import { AppDataProvider } from "@/features/store/app-data-context";
import { getHasCompletedAccessSetup } from "@/lib/access-setup/storage";
import { initializeNotifications } from "@/lib/notifications/setup";
import { getHasSeenOnboarding } from "@/lib/onboarding/storage";
import { hasCompletedSetup } from "@/lib/profile/storage";
import { AppThemeProvider } from "@/providers/app-theme-provider";
import { PillAppCoachmarkProvider } from "@/providers/coachmark-provider";
import { pillappColors } from "@/theme/tokens";

export const unstable_settings = {
  anchor: "(tabs)",
};

void SplashScreen.preventAutoHideAsync().catch(() => {});

void SystemUI.setBackgroundColorAsync(pillappColors.surface);
void initializeNotifications();

function applyPhoneSystemBars(): void {
  void SystemUI.setBackgroundColorAsync(pillappColors.surface);
  if (Platform.OS !== "android") return;
  void NavigationBar.setBackgroundColorAsync(pillappColors.surface).catch(
    () => {},
  );
  void NavigationBar.setButtonStyleAsync("dark").catch(() => {});
  void NavigationBar.setPositionAsync("relative").catch(() => {});
  void NavigationBar.setVisibilityAsync("visible").catch(() => {});
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: pillappColors.primary,
    background: "transparent",
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
    applyPhoneSystemBars();
  }, []);

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

  if (!hasSeenOnboarding || needsAccessSetup || needsSetup) {
    return (
      <AppThemeProvider>
        <PillAppCoachmarkProvider>
          <SafeAreaProvider>
            <ThemeProvider value={navigationTheme}>
              <AppPatternBackground>
                <AppEntryFlow
                  hasSeenOnboarding={hasSeenOnboarding}
                  needsAccessSetup={needsAccessSetup}
                  needsSetup={needsSetup}
                  startAtAccessSetup={hasSeenOnboarding && needsAccessSetup}
                  onAccessSetupComplete={handleAccessSetupComplete}
                  onProfileSetupComplete={() => setNeedsSetup(false)}
                  onSkipProfileSetup={handleSkipProfileSetup}
                />
              </AppPatternBackground>
              <StatusBar
                style="dark"
                backgroundColor="#FFFFFF"
                translucent={false}
              />
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
              <AppPatternBackground>
              <View
                style={{ flex: 1, backgroundColor: "transparent" }}
              >
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: "transparent" },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </View>
              </AppPatternBackground>
              <StatusBar
                style="dark"
                backgroundColor="#FFFFFF"
                translucent={false}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        </PillAppCoachmarkProvider>
      </AppDataProvider>
    </AppThemeProvider>
  );
}
