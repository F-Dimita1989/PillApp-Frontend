import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";

type SetupStepHeaderProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export function SetupStepHeader({
  title,
  subtitle,
  centered = true,
}: SetupStepHeaderProps) {
  return (
    <YStack width="100%" gap="$2" alignItems={centered ? "center" : "stretch"}>
      <AppText
        variant="headline"
        textAlign={centered ? "center" : "left"}
        paddingHorizontal="$1"
      >
        {title}
      </AppText>
      {subtitle ? (
        <AppText
          variant="body"
          muted
          textAlign={centered ? "center" : "left"}
          paddingHorizontal="$1"
        >
          {subtitle}
        </AppText>
      ) : null}
    </YStack>
  );
}
