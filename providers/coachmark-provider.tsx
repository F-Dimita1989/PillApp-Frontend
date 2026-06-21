import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CoachmarkProvider,
  asyncStorage,
} from "@edwardloopez/react-native-coachmark";
import type { ReactNode } from "react";

import { pillappCoachmarkTheme } from "@/constants/coachmark-theme";

const coachmarkStorage = asyncStorage(AsyncStorage);

type PillAppCoachmarkProviderProps = {
  children: ReactNode;
};

export function PillAppCoachmarkProvider({
  children,
}: PillAppCoachmarkProviderProps) {
  return (
    <CoachmarkProvider theme={pillappCoachmarkTheme} storage={coachmarkStorage}>
      {children}
    </CoachmarkProvider>
  );
}
