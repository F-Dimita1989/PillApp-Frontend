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
  const compactMaxWidth =
    screenW - layout.screenPaddingHorizontal * 2 - (spacing.sm + 2) * 2;
  const compactWidth = Math.min(compactMaxWidth, 300);

  return (
    <Image
      source={source}
      style={[
        styles.image,
        size === "compact"
          ? { width: compactWidth, height: Math.round(compactWidth / ASPECT_RATIO) }
          : { width: "100%", aspectRatio: ASPECT_RATIO },
      ]}
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
