import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { XStack, YStack } from "tamagui";

import { BrandIconBadge, SecondaryButton } from "@/components/ui";
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

const TEXT_SIZES = {
  title: { fontSize: 19, lineHeight: 26 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
} as const;

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
  onOpenTerms?: () => void;
};

export function AccessSetupSlideView({
  slide,
  width,
  permissionStates = [],
  isLoadingPermissions = false,
  hasRequestedPermissions = false,
  permissionsGranted = false,
  onOpenTerms,
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
        {slide.id === "privacy" ? (
          <YStack gap={dense ? "$2" : "$3"} width="100%">
            <YStack alignItems="center" gap={dense ? "$1.5" : "$2"} width="100%">
              <AppText
                variant="title"
                color="secondary"
                textAlign="center"
                {...TEXT_SIZES.title}
              >
                {slide.title}
              </AppText>
              <AppText
                variant={dense ? "label" : "body"}
                color="primary"
                textAlign="center"
                {...(dense ? TEXT_SIZES.label : TEXT_SIZES.body)}
              >
                {slide.subtitle}
              </AppText>
              <AppText
                variant={dense ? "label" : "body"}
                color="primary"
                textAlign="center"
                {...(dense ? TEXT_SIZES.label : TEXT_SIZES.body)}
              >
                • Niente email o password{"\n"}• Dati solo sul telefono{"\n"}•
                Niente server esterni{"\n"}• Scansioni solo in app
              </AppText>
            </YStack>

            <SecondaryButton
              size="md"
              icon="file-document-outline"
              fullWidth
              onPress={onOpenTerms}
              accessibilityLabel="Leggi condizioni e termini"
            >
              Leggi condizioni e termini
            </SecondaryButton>
          </YStack>
        ) : null}

        {slide.id === "permissions" ? (
          <YStack gap={dense ? "$1.5" : "$2"} width="100%">
            <YStack width="100%" gap="$1" alignItems="center">
              <AppText
                variant="title"
                color="secondary"
                textAlign="center"
                {...TEXT_SIZES.title}
              >
                {slide.title}
              </AppText>
              <AppText
                variant={dense ? "label" : "body"}
                color="primary"
                textAlign="center"
                {...(dense ? TEXT_SIZES.label : TEXT_SIZES.body)}
              >
                {slide.subtitle}
              </AppText>
            </YStack>

            {isLoadingPermissions ? (
              <YStack alignItems="center" paddingVertical="$1">
                <ActivityIndicator color={pillappColors.secondary} />
              </YStack>
            ) : (
              permissionStates.map((entry) => {
                const copy = PERMISSION_COPY[entry.kind];
                const iconSize = dense ? 30 : 34;

                return (
                  <XStack key={entry.kind} gap="$2.5" alignItems="center">
                    <BrandIconBadge
                      name={copy.icon}
                      size={iconSize}
                      iconSize={dense ? 16 : 18}
                    />
                    <XStack
                      flex={1}
                      justifyContent="space-between"
                      alignItems="center"
                      gap="$2"
                    >
                      <AppText
                        variant="label"
                        color="secondary"
                        fontWeight="600"
                        {...TEXT_SIZES.label}
                      >
                        {copy.title}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={{ color: permissionStatusColor(entry.status) }}
                        {...TEXT_SIZES.caption}
                      >
                        {permissionStatusLabel(entry.status)}
                      </AppText>
                    </XStack>
                  </XStack>
                );
              })
            )}

            {hasRequestedPermissions && !permissionsGranted ? (
              <AppText
                variant="caption"
                color="primary"
                textAlign="center"
                opacity={0.85}
                {...TEXT_SIZES.caption}
              >
                Alcuni accessi sono negati: riprova o apri le impostazioni.
              </AppText>
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </View>
  );
}
