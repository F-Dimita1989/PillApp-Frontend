export const AIC_SCAN_TOUR_STORAGE_KEY = "pillapp:aicScanTourStatus";

export const AIC_SCAN_TOUR_KEY = "pillapp-aic-scan-tour";

export const AIC_TOUR_ANCHORS = {
  intro: "aic-tour-intro",
  scanButton: "aic-tour-scan-button",
  framingBox: "aic-tour-framing-box",
  resultCard: "aic-tour-result-card",
} as const;

export type AicScanTourStatus = "completed" | "skipped";
