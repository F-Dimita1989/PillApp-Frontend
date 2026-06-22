import type { XStackProps } from "tamagui";

import { HealthcareBadgeFrame, HealthcareText } from "@/theme/tamagui-primitives";

type AppBadgeProps = XStackProps & {
  label: string;
  tone?: "primary" | "secondary" | "success" | "neutral" | "warning" | "error";
};

const toneText = {
  primary: "primary" as const,
  secondary: "secondary" as const,
  success: "success" as const,
  neutral: undefined,
  warning: undefined,
  error: "error" as const,
};

export function AppBadge({ label, tone = "neutral", ...rest }: AppBadgeProps) {
  return (
    <HealthcareBadgeFrame tone={tone} {...rest}>
      <HealthcareText
        variant="caption"
        tone={toneText[tone]}
        muted={tone === "neutral" || tone === "warning"}
        fontWeight="600"
        flexShrink={0}
      >
        {label}
      </HealthcareText>
    </HealthcareBadgeFrame>
  );
}
