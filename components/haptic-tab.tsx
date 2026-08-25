import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";

import { useAccessibility } from "@/lib/accessibility/context";
import { playAppHaptic } from "@/lib/accessibility/haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  const { hapticsEnabled } = useAccessibility();

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        void playAppHaptic(hapticsEnabled, "light");
        props.onPressIn?.(ev);
      }}
    />
  );
}
