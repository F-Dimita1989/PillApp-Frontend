import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { TAB_BAR_BASE_HEIGHT } from "@/constants/layout";
import { pillappColors } from "@/theme/tokens";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: pillappColors.primary,
        tabBarInactiveTintColor: pillappColors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          position: "relative",
          display: "flex",
          height: TAB_BAR_BASE_HEIGHT + tabBarBottomInset,
          paddingTop: 10,
          paddingBottom: tabBarBottomInset,
          backgroundColor: pillappColors.surface,
          borderTopWidth: 1,
          borderTopColor: pillappColors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: Platform.OS === "ios" ? "InterSemiBold" : "InterSemiBold",
          marginTop: 2,
        },
        sceneStyle: {
          backgroundColor: pillappColors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size ?? 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Farmaci",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scansione",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "barcode-scan" : "barcode-scan"}
              color={color}
              size={size ?? 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Diario",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "notebook" : "notebook-outline"}
              color={color}
              size={size ?? 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              color={color}
              size={size ?? 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
