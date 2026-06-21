import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { AppCard } from "@/components/ui/app-card";

type PillCardProps = {
  children: ReactNode;
  mode?: "elevated" | "outlined" | "contained";
  style?: StyleProp<ViewStyle>;
};

/** @deprecated Usa AppCard */
export function PillCard({ children, mode = "elevated", style }: PillCardProps) {
  const variant =
    mode === "contained" ? "muted" : mode === "outlined" ? "outlined" : "elevated";

  return (
    <AppCard variant={variant} style={style}>
      {children}
    </AppCard>
  );
}
