import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import { useCardSurface } from "@/components/ui/card-surface";
import { useAccessibility } from "@/lib/accessibility/context";
import { scaleFontSize } from "@/lib/accessibility/prefs";
import { HealthcareText } from "@/theme/tamagui-primitives";

export type AppTextVariant =
  | "display"
  | "headline"
  | "title"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption"
  | "overline";

const VARIANT_SIZES: Record<AppTextVariant, { fontSize: number; lineHeight: number }> = {
  display: { fontSize: 28, lineHeight: 36 },
  headline: { fontSize: 24, lineHeight: 32 },
  title: { fontSize: 20, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 13, lineHeight: 18 },
  overline: { fontSize: 12, lineHeight: 16 },
};

type HealthcareTextProps = GetProps<typeof HealthcareText>;

type AppTextProps = Omit<HealthcareTextProps, "variant" | "tone"> & {
  variant?: AppTextVariant;
  muted?: boolean;
  color?: "primary" | "secondary" | "success" | "error" | "inverse";
  children: ReactNode;
};

export function AppText({
  variant = "body",
  muted = false,
  color,
  children,
  opacity,
  onLongPress,
  fontSize: fontSizeOverride,
  lineHeight: lineHeightOverride,
  ...rest
}: AppTextProps) {
  const surface = useCardSurface();
  const { fontScale, highContrast, largeText } = useAccessibility();
  const onBrand = surface === "brand";
  const resolvedColor = color ?? (onBrand ? "inverse" : undefined);
  const resolvedMuted = onBrand || highContrast ? false : muted;
  const resolvedOpacity =
    opacity ?? (onBrand && muted ? 0.88 : onBrand && color === "primary" ? 1 : undefined);
  const sizes = VARIANT_SIZES[variant];
  const baseFontSize =
    typeof fontSizeOverride === "number" ? fontSizeOverride : sizes.fontSize;
  const baseLineHeight =
    typeof lineHeightOverride === "number" ? lineHeightOverride : sizes.lineHeight;

  return (
    <HealthcareText
      variant={variant}
      muted={resolvedMuted}
      tone={resolvedColor}
      opacity={resolvedOpacity}
      {...rest}
      fontSize={
        largeText ? scaleFontSize(baseFontSize, fontScale) : fontSizeOverride
      }
      lineHeight={
        largeText ? scaleFontSize(baseLineHeight, fontScale) : lineHeightOverride
      }
      fontWeight={
        rest.fontWeight ??
        (highContrast &&
        (variant === "body" || variant === "caption" || variant === "label")
          ? "700"
          : undefined)
      }
      onLongPress={onLongPress}
    >
      {children}
    </HealthcareText>
  );
}
