import { Tabs } from "expo-router";
import { Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { TAB_BAR_BASE_HEIGHT } from "@/constants/layout";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const tabBarBottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          position: "relative",
          display: "flex",
          height: TAB_BAR_BASE_HEIGHT + tabBarBottomInset,
          paddingTop: 8,
          paddingBottom: tabBarBottomInset,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#B9DDF5",
          elevation: 8,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        sceneStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("@/assets/icons/home-icons8.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Terapia Utente",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("@/assets/icons/therapy-icons8.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
