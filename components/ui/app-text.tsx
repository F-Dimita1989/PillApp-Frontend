import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import { HealthcareText } from "@/theme/tamagui-primitives";

export type AppTextVariant =
  | "display"
  | "headline"
  | "title"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption";

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
  ...rest
}: AppTextProps) {
  return (
    <HealthcareText variant={variant} muted={muted} tone={color} {...rest}>
      {children}
    </HealthcareText>
  );
}
