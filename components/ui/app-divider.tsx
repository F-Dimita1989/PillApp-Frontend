import { YStack, type YStackProps } from "tamagui";

export function AppDivider(props: YStackProps) {
  return (
    <YStack
      width="100%"
      height={1}
      backgroundColor="$border"
      marginVertical="$2"
      {...props}
    />
  );
}
