"use no memo";

import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { loadTherapyWidgetData } from "./therapy-widget-data";
import { TherapyTodayWidget } from "./therapy-today-widget";
import { THERAPY_WIDGET_NAME } from "./widget-config";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== THERAPY_WIDGET_NAME) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const data = await loadTherapyWidgetData();
      props.renderWidget(<TherapyTodayWidget data={data} />);
      break;
    }
    default:
      break;
  }
}
