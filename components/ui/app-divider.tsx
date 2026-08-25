import { YStack, type YStackProps } from "tamagui";

import { useCardSurface } from "@/components/ui/card-surface";

export function AppDivider(props: YStackProps) {
  const onBrand = useCardSurface() === "brand";

  return (
    <YStack
      width="100%"
      height={1}
      backgroundColor={onBrand ? "rgba(255,255,255,0.28)" : "$border"}
      marginVertical="$2"
      {...props}
    />
  );
}
