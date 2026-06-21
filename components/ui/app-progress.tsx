import { XStack, type XStackProps } from "tamagui";

type AppProgressProps = XStackProps & {
  progress: number;
  color?: string;
};

export function AppProgress({
  progress,
  color = "$primary",
  height = 4,
  borderRadius = 2,
  ...rest
}: AppProgressProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <XStack
      width="100%"
      height={height}
      backgroundColor="$surfaceMuted"
      borderRadius={borderRadius}
      overflow="hidden"
      {...rest}
    >
      <XStack flex={Math.max(clamped, 0.001)} backgroundColor={color} borderRadius={borderRadius} />
      <XStack flex={Math.max(1 - clamped, 0.001)} />
    </XStack>
  );
}
