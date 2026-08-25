import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { pillappLayout, pillappSpace } from "@/theme/tokens";

type ProfileSetupLayoutProps = {
  hero: ReactNode;
  children: ReactNode;
  scrollable?: boolean;
};

export function ProfileSetupLayout({
  hero,
  children,
  scrollable = true,
}: ProfileSetupLayoutProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = pillappLayout.screenPaddingX;
  const bottomPadding =
    insets.bottom + (scrollable ? pillappSpace[4] : pillappSpace[3]);
  const mainContent = (
    <YStack width="100%" maxWidth={420} alignSelf="center">
      {children}
    </YStack>
  );

  return (
    <YStack flex={1} width="100%">
      {hero}
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: horizontalPadding,
              paddingTop: pillappSpace[3],
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            {mainContent}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              width: "100%",
              paddingHorizontal: horizontalPadding,
              paddingTop: pillappSpace[3],
              paddingBottom: bottomPadding,
              justifyContent: "flex-end",
            }}
          >
            {mainContent}
          </View>
        )}
      </KeyboardAvoidingView>
    </YStack>
  );
}
