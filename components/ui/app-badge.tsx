import { XStack, type XStackProps } from "tamagui";

import { HealthcareText } from "@/theme/tamagui-primitives";

type AppBadgeProps = XStackProps & {
  label: string;
  tone?: "primary" | "secondary" | "success" | "neutral" | "warning" | "error";
};

const toneStyles = {
  primary: { bg: "$primarySoft", tone: "primary" as const, border: "$primary" },
  secondary: { bg: "$secondarySoft", tone: "secondary" as const, border: "$secondary" },
  success: { bg: "$successSoft", tone: "success" as const, border: "$success" },
  neutral: { bg: "$surfaceMuted", tone: undefined, border: "$border" },
  warning: { bg: "$warningSoft", tone: undefined, border: "$warning" },
  error: { bg: "$errorSoft", tone: "error" as const, border: "$error" },
} as const;

export function AppBadge({ label, tone = "neutral", ...rest }: AppBadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <XStack
      alignSelf="flex-start"
      alignItems="center"
      justifyContent="center"
      backgroundColor={toneStyle.bg}
      borderColor={toneStyle.border}
      borderWidth={1}
      borderRadius="$2"
      paddingHorizontal="$3"
      paddingVertical="$1"
      {...rest}
    >
      <HealthcareText
        variant="caption"
        tone={toneStyle.tone}
        muted={tone === "neutral"}
        fontWeight="700"
        flexShrink={0}
      >
        {label}
      </HealthcareText>
    </XStack>
  );
}
