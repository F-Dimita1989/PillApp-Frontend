import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { PillAppColors } from "@/constants/colors";

export function StartupSplash() {
  return (
    <View style={styles.background}>
      <ScreenSafeArea includeBottomInset style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Image
            source={require("@/assets/images/pillapp-logo.png")}
            style={styles.loaderImage}
            accessibilityLabel="Logo PillApp"
          />
          <ActivityIndicator size="large" color={PillAppColors.primary} />
        </View>
      </ScreenSafeArea>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: PillAppColors.surface,
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
    width: 440,
    height: 440,
  },
});
