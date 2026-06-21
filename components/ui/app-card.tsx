import type { ReactNode } from "react";
import { YStack, type YStackProps } from "tamagui";

import { HealthcareCard, FullWidthStack } from "@/theme/tamagui-primitives";

type AppCardProps = YStackProps & {
  children: ReactNode;
  variant?: "elevated" | "outlined" | "muted";
  /** @deprecated Usa variant */
  mode?: "elevated" | "outlined" | "contained";
};

export function AppCard({ children, variant, mode, ...rest }: AppCardProps) {
  const resolvedVariant =
    variant ??
    (mode === "outlined" ? "outlined" : mode === "contained" ? "muted" : "elevated");

  return (
    <HealthcareCard variant={resolvedVariant} overflow="visible" {...rest}>
      {children}
    </HealthcareCard>
  );
}

export function AppCardContent({ children, ...rest }: YStackProps & { children: ReactNode }) {
  return (
    <FullWidthStack gap="$4" flexShrink={0} overflow="visible" {...rest}>
      {children}
    </FullWidthStack>
  );
}

/** Area azioni in fondo alla card — separata dai campi, mai sovrapposta. */
export function AppCardActions({ children, ...rest }: YStackProps & { children: ReactNode }) {
  return (
    <FullWidthStack
      gap="$3"
      width="100%"
      flexShrink={0}
      paddingTop="$4"
      borderTopWidth={1}
      borderTopColor="$border"
      {...rest}
    >
      {children}
    </FullWidthStack>
  );
}
