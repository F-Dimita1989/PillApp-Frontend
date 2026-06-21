import { useFonts } from "expo-font";
import type { ReactNode } from "react";
import { TamaguiProvider, Theme } from "tamagui";

import { StartupSplash } from "@/components/startup-splash";
import tamaguiConfig from "@/tamagui.config";
import { healthcareFontAssets } from "@/theme/tamagui-fonts";

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [fontsLoaded] = useFonts(healthcareFontAssets);

  if (!fontsLoaded) {
    return <StartupSplash />;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="healthcare">
      <Theme name="healthcare">{children}</Theme>
    </TamaguiProvider>
  );
}

/** @deprecated Usa AppThemeProvider */
export const PillAppPaperProvider = AppThemeProvider;
