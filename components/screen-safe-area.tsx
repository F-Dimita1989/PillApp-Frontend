import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

type ScreenSafeAreaProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Per schermate dentro le tab: evita doppio padding in basso (gestito dalla tab bar). */
  includeBottomInset?: boolean;
};

const TAB_SCREEN_EDGES: Edge[] = ["top", "left", "right"];
const FULL_SCREEN_EDGES: Edge[] = ["top", "bottom", "left", "right"];

export function ScreenSafeArea({
  children,
  style,
  includeBottomInset = false,
}: ScreenSafeAreaProps) {
  return (
    <SafeAreaView
      style={[styles.safeArea, style]}
      edges={includeBottomInset ? FULL_SCREEN_EDGES : TAB_SCREEN_EDGES}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
