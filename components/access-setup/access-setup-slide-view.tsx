import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import type { OnboardingSlide } from "@/constants/onboarding-slides";
import type {
  AppPermissionKind,
  AppPermissionState,
} from "@/lib/access-setup/permissions";
import { pillappColors, pillappLayout } from "@/theme/tokens";

const PERMISSION_COPY: Record<
  AppPermissionKind,
  { title: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  camera: { title: "Fotocamera", icon: "camera-outline" },
  gallery: { title: "Galleria", icon: "image-multiple-outline" },
  notifications: { title: "Notifiche", icon: "bell-outline" },
  calendar: { title: "Calendario", icon: "calendar-month-outline" },
};

function permissionStatusLabel(status: AppPermissionState["status"]): string {
  switch (status) {
    case "granted":
      return "OK";
    case "denied":
      return "Negato";
    default:
      return "—";
  }
}

function permissionStatusColor(status: AppPermissionState["status"]): string {
  switch (status) {
    case "granted":
      return pillappColors.success;
    case "denied":
      return pillappColors.error;
    default:
      return pillappColors.textMuted;
  }
}

type AccessSetupSlideViewProps = {
  slide: OnboardingSlide;
  width: number;
  permissionStates?: AppPermissionState[];
  isLoadingPermissions?: boolean;
  hasRequestedPermissions?: boolean;
  permissionsGranted?: boolean;
};

export function AccessSetupSlideView({
  slide,
  width,
  permissionStates = [],
  isLoadingPermissions = false,
  hasRequestedPermissions = false,
  permissionsGranted = false,
}: AccessSetupSlideViewProps) {
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const dense = height < 680;

  return (
    <View style={{ flex: 1, width, paddingTop: dense ? 4 : 8 }}>
      <YStack
        flex={1}
        paddingHorizontal={pillappLayout.screenPaddingX}
        gap={dense ? "$2" : compact ? "$2.5" : "$3"}
        accessibilityRole="summary"
      >
        <YStack width="100%" gap={dense ? "$1.5" : "$2"}>
          <AppText variant="title" color="primary" textAlign="center">
            {slide.title}
          </AppText>
          <AppText
            variant={dense ? "label" : "body"}
            color="primary"
            textAlign="center"
            lineHeight={dense ? 18 : undefined}
          >
            {slide.subtitle}
          </AppText>
        </YStack>

        {slide.id === "permissions" ? (
          <YStack gap={dense ? "$1.5" : "$2"} width="100%">
            {isLoadingPermissions ? (
              <YStack alignItems="center" paddingVertical="$1">
                <ActivityIndicator color={pillappColors.primary} />
              </YStack>
            ) : (
              permissionStates.map((entry) => {
                const copy = PERMISSION_COPY[entry.kind];
                const iconSize = dense ? 30 : 34;

                return (
                  <XStack key={entry.kind} gap="$2.5" alignItems="center">
                    <View
                      style={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: iconSize / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: pillappColors.primarySoft,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={copy.icon}
                        size={dense ? 16 : 18}
                        color={pillappColors.primary}
                      />
                    </View>
                    <XStack flex={1} justifyContent="space-between" alignItems="center" gap="$2">
                      <AppText variant="label" color="primary" fontWeight="600">
                        {copy.title}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={{ color: permissionStatusColor(entry.status) }}
                      >
                        {permissionStatusLabel(entry.status)}
                      </AppText>
                    </XStack>
                  </XStack>
                );
              })
            )}

            {hasRequestedPermissions && !permissionsGranted ? (
              <AppText variant="caption" color="primary" textAlign="center" opacity={0.85}>
                Alcuni accessi sono negati: riprova o apri le impostazioni.
              </AppText>
            ) : null}
          </YStack>
        ) : null}

        {slide.id === "privacy" ? (
          <AppText
            variant={dense ? "label" : "body"}
            color="primary"
            textAlign="center"
            lineHeight={dense ? 18 : 22}
          >
            • Niente email o password{"\n"}• Dati solo sul telefono{"\n"}• Niente
            server esterni{"\n"}• Scansioni solo in app
          </AppText>
        ) : null}
      </YStack>
    </View>
  );
}
