import { requireOptionalNativeModule } from "expo";
import { Linking, Platform } from "react-native";

type ExactAlarmNativeModule = {
  canScheduleExactAlarms: () => Promise<boolean>;
  requestExactAlarmPermission: () => Promise<void>;
};

function getNativeModule(): ExactAlarmNativeModule | null {
  if (Platform.OS !== "android") {
    return null;
  }
  return requireOptionalNativeModule<ExactAlarmNativeModule>("ExactAlarm");
}

export async function canScheduleExactAlarms(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true;
  }
  const native = getNativeModule();
  if (!native) {
    return true;
  }
  return native.canScheduleExactAlarms();
}

export async function requestExactAlarmPermission(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  const native = getNativeModule();
  if (native) {
    await native.requestExactAlarmPermission();
    return;
  }
  await Linking.sendIntent("android.settings.REQUEST_SCHEDULE_EXACT_ALARM").catch(
    () => undefined,
  );
}
