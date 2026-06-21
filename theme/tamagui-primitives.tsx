import { styled, Text, XStack, YStack } from "tamagui";

import { fullWidthRowProps, fullWidthStackProps } from "@/theme/tamagui-layout";

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
      },
      headline: {
        fontFamily: "$heading",
        fontSize: 24,
        lineHeight: 34,
        fontWeight: "700",
        paddingVertical: 2,
      },
      title: {
        fontFamily: "$heading",
        fontSize: 20,
        lineHeight: 28,
        fontWeight: "700",
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
      },
      caption: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
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
  borderRadius: "$4",
  padding: "$5",
  gap: "$4",
  variants: {
    variant: {
      elevated: {
        backgroundColor: "$surface",
        borderWidth: 1,
        borderColor: "$border",
        shadowColor: "$shadow",
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
      outlined: {
        backgroundColor: "$surface",
        borderWidth: 1,
        borderColor: "$border",
      },
      muted: {
        backgroundColor: "$surfaceMuted",
        borderWidth: 0,
      },
    },
  } as const,
  defaultVariants: {
    variant: "elevated",
  },
});

/** Frame bottone — centratura esplicita icona + testo, niente stretch. */
export const HealthcareButtonFrame = styled(XStack, {
  name: "HealthcareButton",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  flexShrink: 0,
  gap: 8,
  borderRadius: "$3",
  overflow: "hidden",
  pressStyle: {
    opacity: 0.92,
    scale: 0.985,
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: "$surface",
        borderWidth: 2,
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
        paddingHorizontal: 20,
        paddingVertical: 0,
      },
      md: {
        minHeight: 48,
        paddingHorizontal: 16,
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
