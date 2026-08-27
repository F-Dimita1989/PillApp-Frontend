import type { ReactNode } from "react";
import { YStack, type YStackProps } from "tamagui";

import { BrandGradientCard } from "@/components/ui/brand-gradient-card";
import { BrandStripe } from "@/components/ui/brand-stripe";
import { CardSurfaceProvider, useCardSurface } from "@/components/ui/card-surface";
import { useAccessibility } from "@/lib/accessibility/context";
import { HealthcareCard, FullWidthStack } from "@/theme/tamagui-primitives";
import { pillappShadows } from "@/theme/tokens";

type AppCardProps = YStackProps & {
  children: ReactNode;
  variant?: "brand" | "elevated" | "outlined" | "muted" | "highlight";
  pressable?: boolean;
};

function isBrandVariant(
  variant: NonNullable<AppCardProps["variant"]>,
): boolean {
  return variant === "brand";
}

export function AppCard({
  children,
  variant = "elevated",
  pressable,
  ...rest
}: AppCardProps) {
  const { highContrast, reduceMotion } = useAccessibility();

  if (isBrandVariant(variant)) {
    return (
      <CardSurfaceProvider surface="brand">
        <BrandGradientCard>
          <YStack width="100%" gap="$3" {...rest}>
            {children}
          </YStack>
        </BrandGradientCard>
      </CardSurfaceProvider>
    );
  }

  const lightVariant =
    variant === "muted"
      ? "muted"
      : variant === "highlight"
        ? "highlight"
        : variant === "elevated"
          ? "elevated"
          : "outlined";
  const cardShadow = highContrast ? pillappShadows.none : pillappShadows.md;

  return (
    <CardSurfaceProvider surface="light">
      <YStack width="100%" overflow="visible" style={cardShadow} {...rest}>
        <HealthcareCard
          variant={lightVariant}
          pressable={pressable}
          {...(highContrast
            ? { borderWidth: 2.5, borderColor: "$textPrimary" }
            : {})}
          {...(reduceMotion && pressable
            ? { pressStyle: { opacity: 1, scale: 1 } }
            : {})}
          width="100%"
          padding={0}
          gap={0}
          overflow="hidden"
          {...pillappShadows.none}
        >
          <BrandStripe />
          <YStack width="100%" padding="$4" gap="$3">
            {children}
          </YStack>
        </HealthcareCard>
      </YStack>
    </CardSurfaceProvider>
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
  const surface = useCardSurface();

  return (
    <FullWidthStack
      gap="$3"
      width="100%"
      flexShrink={0}
      paddingTop="$4"
      borderTopWidth={1}
      borderTopColor={surface === "brand" ? "rgba(255,255,255,0.28)" : "$border"}
      {...rest}
    >
      {children}
    </FullWidthStack>
  );
}
