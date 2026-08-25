import { LinearGradient } from "expo-linear-gradient";

import { pillappBrandGradient } from "@/theme/tokens";

export function BrandStripe({ height = 6 }: { height?: number }) {
  return (
    <LinearGradient
      colors={[...pillappBrandGradient.colors]}
      locations={[...pillappBrandGradient.locations]}
      start={pillappBrandGradient.start}
      end={pillappBrandGradient.end}
      style={{ height, width: "100%" }}
    />
  );
}
