import type { ReactNode } from "react";
import { ScrollView, StyleSheet, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { YStack, type YStackProps } from "tamagui";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { screenContentProps } from "@/theme/tamagui-layout";
import { pillappColors } from "@/theme/tokens";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: YStackProps;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "style">;
  style?: StyleProp<ViewStyle>;
};

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
  scrollProps,
  style,
}: AppScreenProps) {
  const content = (
    <YStack {...screenContentProps} {...contentStyle}>
      {children}
    </YStack>
  );

  return (
    <ScreenSafeArea style={[styles.screen, { backgroundColor: pillappColors.background }, style]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollGrow}
          {...scrollProps}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollGrow: {
    flexGrow: 1,
  },
});
