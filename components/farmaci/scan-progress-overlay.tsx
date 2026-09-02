import { Modal, StyleSheet, View } from "react-native";

import { AppCard, AppCardContent } from "@/components/ui";
import { ScanProgressStatus } from "@/components/farmaci/scan-progress-status";
import type { MedicineScanProgress } from "@/lib/farmaci/scan";

type ScanProgressOverlayProps = {
  visible: boolean;
  step: MedicineScanProgress;
};

export function ScanProgressOverlay({ visible, step }: ScanProgressOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.cardWrap}>
          <AppCard>
            <AppCardContent>
              <ScanProgressStatus step={step} />
            </AppCardContent>
          </AppCard>
        </View>
      </View>
    </Modal>
  );
}

export function waitForUiPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 380,
  },
});
