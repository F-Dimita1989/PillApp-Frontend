import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CoachmarkProvider,
  asyncStorage,
} from "@edwardloopez/react-native-coachmark";
import type { ReactNode } from "react";

import { PillAppColors } from "@/constants/colors";
import { PillAppMaterialTheme } from "@/constants/theme";
import { radii, spacing } from "@/constants/spacing";

const coachmarkTheme = {
  backdropColor: PillAppColors.onBackground,
  backdropOpacity: 0.16,
  holeShadowOpacity: 0.4,
  tooltip: {
    maxWidth: 360,
    radius: radii.md,
    bg: PillAppColors.surface,
    fg: PillAppColors.onSurface,
    arrowSize: 8,
    padding: spacing.md,
    buttonPrimaryBg: PillAppMaterialTheme.colors.primary,
    buttonSecondaryBg: PillAppColors.onSurfaceVariant,
  },
  motion: {
    durationMs: 320,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  },
};

const coachmarkStorage = asyncStorage(AsyncStorage);

type PillAppCoachmarkProviderProps = {
  children: ReactNode;
};

export function PillAppCoachmarkProvider({
  children,
}: PillAppCoachmarkProviderProps) {
  return (
    <CoachmarkProvider theme={coachmarkTheme} storage={coachmarkStorage}>
      {children}
    </CoachmarkProvider>
  );
}
