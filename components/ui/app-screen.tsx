import type { ReactNode } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    type ScrollViewProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { YStack, type YStackProps } from "tamagui";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { useAccessibility } from "@/lib/accessibility/context";
import { screenContentProps } from "@/theme/tamagui-layout";

type AppScreenProps = {
  children: ReactNode;
  /** Header hero: scorre insieme al contenuto, non resta fisso. */
  hero?: ReactNode;
  scroll?: boolean;
  contentStyle?: YStackProps;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "style">;
  style?: StyleProp<ViewStyle>;
};

export function AppScreen({
  children,
  hero,
  scroll = true,
  contentStyle,
  scrollProps,
  style,
}: AppScreenProps) {
  const { highContrast } = useAccessibility();
  const screenBackground = highContrast ? "#FFFFFF" : "transparent";

  const body = (
    <YStack
      {...screenContentProps}
      paddingTop={hero ? "$3" : "$4"}
      {...contentStyle}
    >
      {children}
    </YStack>
  );

  const screen = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollGrow}
      {...scrollProps}
    >
      {hero}
      {body}
    </ScrollView>
  ) : (
    <YStack flex={1}>
      {hero}
      {body}
    </YStack>
  );

  return (
    <YStack
      flex={1}
      backgroundColor={screenBackground}
      style={[{ backgroundColor: screenBackground }, style]}
    >
      <ScreenSafeArea
        edges={
          Platform.OS === "android"
            ? ["left", "right"]
            : ["top", "left", "right"]
        }
        style={[styles.screen, { backgroundColor: screenBackground }]}
      >
        {screen}
      </ScreenSafeArea>
    </YStack>
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
