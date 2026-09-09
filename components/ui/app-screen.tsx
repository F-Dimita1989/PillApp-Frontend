import { NavigationContext } from "@react-navigation/native";
import { useContext, useEffect, useRef, type ReactNode } from "react";
import {
  InteractionManager,
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
  const navigation = useContext(NavigationContext);
  const scrollRef = useRef<ScrollView>(null);
  const pinToTopUntilRef = useRef(0);
  const screenBackground = highContrast ? "#FFFFFF" : "transparent";

  useEffect(() => {
    if (!scroll || !navigation) {
      return;
    }

    let interaction: { cancel: () => void } | undefined;
    const scrollToTop = () => {
      pinToTopUntilRef.current = Date.now() + 600;
      const run = () => {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      };
      run();
      requestAnimationFrame(run);
      interaction?.cancel();
      interaction = InteractionManager.runAfterInteractions(run);
    };

    scrollToTop();
    const unsubscribe = navigation.addListener("focus", scrollToTop);
    return () => {
      unsubscribe();
      interaction?.cancel();
    };
  }, [navigation, scroll]);

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
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollGrow}
      contentOffset={{ x: 0, y: 0 }}
      {...scrollProps}
      onContentSizeChange={(width, height) => {
        scrollProps?.onContentSizeChange?.(width, height);
        if (Date.now() < pinToTopUntilRef.current) {
          scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        }
      }}
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
