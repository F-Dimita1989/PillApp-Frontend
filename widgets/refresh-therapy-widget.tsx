"use no memo";

import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { loadTherapyWidgetData } from "./therapy-widget-data";
import { TherapyTodayWidget } from "./therapy-today-widget";
import { THERAPY_WIDGET_NAME } from "./widget-config";

/**
 * Android ridisegna il widget da sé al massimo ogni 30 minuti: senza questa
 * chiamata dopo ogni modifica resterebbe indietro rispetto all'app.
 */
export async function refreshTherapyWidget(): Promise<void> {
  if (Platform.OS !== "android") return;

  try {
    const data = await loadTherapyWidgetData();
    await requestWidgetUpdate({
      widgetName: THERAPY_WIDGET_NAME,
      renderWidget: () => <TherapyTodayWidget data={data} />,
    });
  } catch {
    /* nessun widget sulla home o modulo nativo non disponibile */
  }
}
