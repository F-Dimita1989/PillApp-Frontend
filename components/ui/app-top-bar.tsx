import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  IntroHeroArc,
  appScreenHeroLayout,
} from "@/components/ui/intro-hero-arc";
import { pillappColors, pillappLayout } from "@/theme/tokens";

type HeroIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

const HERO_ICON_SIZE = 40;

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: HeroIcon;
  showLogo?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
};

export function AppTopBar({
  title,
  subtitle,
  eyebrow,
  icon,
  showLogo = false,
  onBack,
  trailing,
}: AppTopBarProps) {
  const layout = appScreenHeroLayout;

  return (
    <View style={styles.host}>
      <IntroHeroArc
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        showLogo={showLogo}
        parentPaddingX={layout.parentPaddingX}
        arcHeight={layout.arcHeight}
        emblemSize={layout.emblemSize}
        emblemRaiseExtra={layout.emblemRaiseExtra}
        emblem={
          icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={HERO_ICON_SIZE}
              color={pillappColors.secondary}
            />
          ) : undefined
        }
      />

      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Indietro"
          accessibilityHint="Torna alla schermata precedente"
          hitSlop={8}
          style={[styles.backButton, { top: 8 }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={pillappColors.onPrimary}
          />
        </Pressable>
      ) : null}

      {trailing ? (
        <View style={[styles.trailing, { top: 8 }]}>{trailing}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: pillappLayout.screenPaddingX,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    zIndex: 4,
  },
  trailing: {
    position: "absolute",
    right: pillappLayout.screenPaddingX,
    zIndex: 4,
  },
});
