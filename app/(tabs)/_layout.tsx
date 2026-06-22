import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { tabBarTheme } from "@/theme/tab-bar";
import { pillappColors } from "@/theme/tokens";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarTheme.activeTintColor,
        tabBarInactiveTintColor: tabBarTheme.inactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          position: "relative",
          display: "flex",
          height: tabBarTheme.height + tabBarBottomInset,
          paddingTop: tabBarTheme.paddingTop,
          paddingBottom: tabBarBottomInset,
          backgroundColor: tabBarTheme.backgroundColor,
          borderTopWidth: tabBarTheme.borderTopWidth,
          borderTopColor: tabBarTheme.borderTopColor,
          elevation: tabBarTheme.elevation,
          shadowOpacity: tabBarTheme.shadowOpacity,
        },
        tabBarLabelStyle: tabBarTheme.labelStyle,
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
