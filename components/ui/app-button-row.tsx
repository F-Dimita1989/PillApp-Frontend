import type { ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";
import { XStack, YStack, type XStackProps } from "tamagui";

type AppButtonRowProps = XStackProps & {
  children: ReactNode;
};

/** Due o più bottoni affiancati, stessa larghezza e centratura. */
export function AppButtonRow({ children, ...rest }: AppButtonRowProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <XStack width="100%" gap="$3" alignItems="stretch" {...rest}>
      {items.map((child, index) => (
        <YStack key={index} flex={1} minWidth={0} justifyContent="center">
          {cloneElement(child as React.ReactElement<{ fullWidth?: boolean }>, {
            fullWidth: true,
          })}
        </YStack>
      ))}
    </XStack>
  );
}
