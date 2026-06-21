import { Image } from "expo-image";
import { Image as RNImage, StyleSheet, useWindowDimensions } from "react-native";

import { layout, spacing } from "@/constants/spacing";

const source = require("@/assets/images/aic-scan-example.png");
const asset = RNImage.resolveAssetSource(source);
const ASPECT_RATIO = asset.width / asset.height;

type AicScanExampleImageProps = {
  /** full = riquadro setup; compact = tooltip passo 3 */
  size?: "full" | "compact";
};

export function AicScanExampleImage({ size = "full" }: AicScanExampleImageProps) {
  const { width: screenW } = useWindowDimensions();
  const cardPadding = spacing.md * 2;
  const framingPadding = spacing.sm * 2;
  const fullMaxWidth =
    screenW - layout.screenPaddingHorizontal * 2 - cardPadding - framingPadding;
  const compactMaxWidth =
    screenW - layout.screenPaddingHorizontal * 2 - (spacing.sm + 2) * 2;
  const width =
    size === "compact"
      ? Math.min(compactMaxWidth, 300)
      : fullMaxWidth;
  const height = Math.round(width / ASPECT_RATIO);

  return (
    <Image
      source={source}
      style={[styles.image, { width, height }]}
      contentFit="contain"
      accessibilityRole="image"
      accessibilityLabel="Esempio confezione Tachipirina con codice AIC evidenziato in rosso"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: "center",
    borderRadius: spacing.sm,
  },
});
