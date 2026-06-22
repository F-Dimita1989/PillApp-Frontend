import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";

type InfoRowProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  /** Evidenzia il valore (es. dose, orario) */
  emphasized?: boolean;
};

export function InfoRow({ label, value, hint, icon, emphasized = false }: InfoRowProps) {
  return (
    <XStack
      width="100%"
      alignItems="flex-start"
      justifyContent="space-between"
      gap="$3"
      paddingVertical="$2"
      accessibilityRole="text"
    >
      <XStack flex={1} alignItems="center" gap="$2" minWidth={0}>
        {icon}
        <AppText variant="label" muted>
          {label}
        </AppText>
      </XStack>
      <YStack flex={1.2} alignItems="flex-end" gap="$1" minWidth={0}>
        {typeof value === "string" || typeof value === "number" ? (
          <AppText variant={emphasized ? "bodyStrong" : "body"} textAlign="right">
            {value}
          </AppText>
        ) : (
          value
        )}
        {hint ? (
          <AppText variant="caption" muted textAlign="right">
            {hint}
          </AppText>
        ) : null}
      </YStack>
    </XStack>
  );
}
