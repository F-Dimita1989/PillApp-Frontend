import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAccessibility } from "@/lib/accessibility/context";
import { pillappAmbientWash } from "@/theme/tokens";

type AppPatternBackgroundProps = {
  children: ReactNode;
};

export function AppPatternBackground({ children }: AppPatternBackgroundProps) {
  const { highContrast } = useAccessibility();

  if (highContrast) {
    return <View style={styles.solid}>{children}</View>;
  }

  return (
    <View style={styles.host}>
      <LinearGradient
        colors={[...pillappAmbientWash.teal.colors]}
        start={pillappAmbientWash.teal.start}
        end={pillappAmbientWash.teal.end}
        style={styles.wash}
      />
      <LinearGradient
        colors={[...pillappAmbientWash.blue.colors]}
        start={pillappAmbientWash.blue.start}
        end={pillappAmbientWash.blue.end}
        style={styles.wash}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  solid: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
