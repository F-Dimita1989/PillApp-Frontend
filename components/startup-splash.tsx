import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { Colors } from "@/constants/theme";

export function StartupSplash() {
  const colors = Colors.light;

  return (
    <LinearGradient
      colors={["#EAF8FF", "#D7F0FF", "#C7E8FF"]}
      style={styles.gradientBackground}
    >
      <ScreenSafeArea includeBottomInset style={styles.safeArea}>
      <View style={styles.loaderContainer}>
        <Image
          source={require("@/assets/images/pillapp-splash.png")}
          style={styles.loaderImage}
        />
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
      </ScreenSafeArea>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loaderImage: {
    width: 220,
    height: 220,
  },
});
