import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { pillappColors } from "@/theme/tokens";

export function StartupSplash() {
  return (
    <View style={styles.background}>
      <ScreenSafeArea includeBottomInset style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/pillapp-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo PillApp"
          />
          <ActivityIndicator size="large" color={pillappColors.primary} />
        </View>
      </ScreenSafeArea>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: pillappColors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logo: {
    width: 280,
    height: 280,
  },
});
