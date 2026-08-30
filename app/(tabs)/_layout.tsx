import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { BrandTabBarBackground } from "@/components/ui/brand-tab-bar-background";
import { useAccessibility } from "@/lib/accessibility/context";
import { tabBarTheme } from "@/theme/tab-bar";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { easyTap, largeText } = useAccessibility();
  const contentHeight =
    easyTap || largeText
      ? tabBarTheme.comfortableContentHeight
      : tabBarTheme.contentHeight;
  const tabBarBottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarTheme.activeTintColor,
        tabBarInactiveTintColor: tabBarTheme.inactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: BrandTabBarBackground,
        tabBarHideOnKeyboard: false,
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          position: "relative",
          height: contentHeight + tabBarBottomInset,
          paddingTop: tabBarTheme.paddingTop,
          paddingBottom: tabBarBottomInset,
          backgroundColor: tabBarTheme.backgroundColor,
          borderTopWidth: tabBarTheme.borderTopWidth,
          borderTopColor: tabBarTheme.borderTopColor,
          elevation: tabBarTheme.elevation,
          shadowOpacity: tabBarTheme.shadowOpacity,
        },
        tabBarItemStyle: {
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          ...tabBarTheme.labelStyle,
          ...(largeText ? { fontSize: 12, lineHeight: 16 } : {}),
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={tabBarTheme.iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        listeners={{
          tabPress: () => {
            router.navigate("/medications");
          },
        }}
        options={{
          title: "Farmaci",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="pill"
              color={color}
              size={tabBarTheme.iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scansione",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="barcode-scan"
              color={color}
              size={tabBarTheme.iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Diario",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "notebook" : "notebook-outline"}
              color={color}
              size={tabBarTheme.iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              color={color}
              size={tabBarTheme.iconSize}
            />
          ),
        }}
      />
    </Tabs>
  );
}
