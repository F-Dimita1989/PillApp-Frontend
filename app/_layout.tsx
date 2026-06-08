import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OnboardingScreen } from "@/components/onboarding-screen";
import { PostOnboardingFlow } from "@/components/post-onboarding-flow";
import { ScreenSafeArea } from "@/components/screen-safe-area";
import { StartupSplash } from "@/components/startup-splash";
import { getHasSeenOnboarding } from "@/lib/onboarding/storage";
import { hasCompletedSetup } from "@/lib/profile/storage";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [seenOnboarding, setupDone] = await Promise.all([
          getHasSeenOnboarding(),
          hasCompletedSetup(),
        ]);

        setHasSeenOnboarding(seenOnboarding);
        setNeedsSetup(!setupDone);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StartupSplash />
      </SafeAreaProvider>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <ScreenSafeArea includeBottomInset>
            <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
          </ScreenSafeArea>
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (needsSetup) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <PostOnboardingFlow onComplete={() => setNeedsSetup(false)} />
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <LinearGradient
          colors={["#EAF8FF", "#D7F0FF", "#C7E8FF"]}
          style={styles.gradientBackground}
        >
          <Stack screenOptions={{ contentStyle: { backgroundColor: "transparent" } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </LinearGradient>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
});
