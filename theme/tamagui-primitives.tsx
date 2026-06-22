import { styled, Text, XStack, YStack } from "tamagui";

import { fullWidthRowProps, fullWidthStackProps } from "@/theme/tamagui-layout";
import { pillappShadows } from "@/theme/tokens";

/** Stack a larghezza piena — base per schermate e card. */
export const FullWidthStack = styled(YStack, {
  ...fullWidthStackProps,
});

/** Riga a larghezza piena — allineamento verticale centrato. */
export const FullWidthRow = styled(XStack, {
  ...fullWidthRowProps,
});

export const HealthcareText = styled(Text, {
  name: "HealthcareText",
  fontFamily: "$body",
  color: "$textPrimary",
  flexShrink: 1,
  maxWidth: "100%",
  variants: {
    variant: {
      display: {
        fontFamily: "$heading",
        fontSize: 28,
        lineHeight: 36,
        fontWeight: "700",
        letterSpacing: -0.3,
      },
      headline: {
        fontFamily: "$heading",
        fontSize: 24,
        lineHeight: 32,
        fontWeight: "700",
        letterSpacing: -0.2,
        paddingVertical: 2,
      },
      title: {
        fontFamily: "$heading",
        fontSize: 20,
        lineHeight: 28,
        fontWeight: "600",
        paddingVertical: 1,
      },
      body: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "400",
      },
      bodyStrong: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "600",
      },
      label: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        letterSpacing: 0.1,
      },
      caption: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
      },
      overline: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "600",
        letterSpacing: 0.6,
        textTransform: "uppercase",
      },
      button: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "600",
        flexShrink: 0,
        textAlign: "center",
      },
    },
    muted: {
      true: {
        color: "$textSecondary",
      },
    },
    tone: {
      primary: { color: "$primaryDark" },
      secondary: { color: "$secondaryDark" },
      success: { color: "$successDark" },
      error: { color: "$error" },
      inverse: { color: "$onPrimary" },
    },
  } as const,
  defaultVariants: {
    variant: "body",
  },
});

export const HealthcareCard = styled(FullWidthStack, {
  name: "HealthcareCard",
  borderRadius: "$3",
  padding: "$4",
  gap: "$3",
  variants: {
    variant: {
      elevated: {
        backgroundColor: "$surface",
        borderWidth: 1,
        borderColor: "$border",
        ...pillappShadows.md,
      },
      outlined: {
        backgroundColor: "$surface",
        borderWidth: 1,
        borderColor: "$border",
        ...pillappShadows.none,
      },
      muted: {
        backgroundColor: "$surfaceMuted",
        borderWidth: 0,
        ...pillappShadows.none,
      },
      highlight: {
        backgroundColor: "$primarySoft",
        borderWidth: 1,
        borderColor: "$borderStrong",
        ...pillappShadows.sm,
      },
    },
    pressable: {
      true: {
        pressStyle: {
          opacity: 0.96,
          scale: 0.995,
        },
      },
    },
  } as const,
  defaultVariants: {
    variant: "elevated",
  },
});

/** Frame bottone — touch target accessibile, feedback morbido. */
export const HealthcareButtonFrame = styled(XStack, {
  name: "HealthcareButton",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  flexShrink: 0,
  gap: "$2",
  borderRadius: "$2",
  overflow: "hidden",
  pressStyle: {
    opacity: 0.92,
    scale: 0.98,
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: "$surface",
        borderWidth: 1.5,
        borderColor: "$primary",
      },
      ghost: {
        backgroundColor: "$surfaceMuted",
        borderWidth: 0,
      },
      success: {
        backgroundColor: "$success",
        borderWidth: 0,
      },
      danger: {
        backgroundColor: "$error",
        borderWidth: 0,
      },
    },
    size: {
      lg: {
        minHeight: 52,
        paddingHorizontal: "$5",
        paddingVertical: 0,
      },
      md: {
        minHeight: 48,
        paddingHorizontal: "$4",
        paddingVertical: 0,
      },
      sm: {
        minHeight: 40,
        paddingHorizontal: "$3",
        paddingVertical: 0,
      },
    },
    disabled: {
      true: {
        opacity: 0.45,
      },
    },
    fullWidth: {
      true: {
        width: "100%",
        alignSelf: "stretch",
      },
      false: {
        alignSelf: "center",
      },
    },
  } as const,
  defaultVariants: {
    variant: "primary",
    size: "lg",
    fullWidth: false,
  },
});

/** Badge stato — pill soft con bordo delicato */
export const HealthcareBadgeFrame = styled(XStack, {
  name: "HealthcareBadge",
  alignSelf: "flex-start",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "$pill",
  paddingHorizontal: "$3",
  paddingVertical: "$1",
  borderWidth: 1,
  variants: {
    tone: {
      primary: {
        backgroundColor: "$primarySoft",
        borderColor: "$borderStrong",
      },
      secondary: {
        backgroundColor: "$secondarySoft",
        borderColor: "$secondary",
      },
      success: {
        backgroundColor: "$successSoft",
        borderColor: "$success",
      },
      neutral: {
        backgroundColor: "$surfaceMuted",
        borderColor: "$border",
      },
      warning: {
        backgroundColor: "$warningSoft",
        borderColor: "$warning",
      },
      error: {
        backgroundColor: "$errorSoft",
        borderColor: "$error",
      },
    },
  } as const,
  defaultVariants: {
    tone: "neutral",
  },
});
