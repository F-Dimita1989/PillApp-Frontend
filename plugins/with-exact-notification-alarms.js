const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const EXACT_ALARM_PERMISSIONS = [
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.USE_EXACT_ALARM",
];

const INEXACT_EXACT_CALL = `AlarmManagerCompat.setExactAndAllowWhileIdle(
        alarmManager,
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        operation
      )`;

const ALARM_CLOCK_CALL = `val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      val showIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      val showIntent =
        if (launchIntent != null) {
          PendingIntent.getActivity(context, 0, launchIntent, showIntentFlags)
        } else {
          operation
        }
      alarmManager.setAlarmClock(
        AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent),
        operation
      )`;

function ensureUsesPermission(androidManifest, permission) {
  const usesPermissions = androidManifest.manifest["uses-permission"] ?? [];
  const alreadyListed = usesPermissions.some(
    (entry) => entry.$?.["android:name"] === permission,
  );
  if (!alreadyListed) {
    usesPermissions.push({ $: { "android:name": permission } });
    androidManifest.manifest["uses-permission"] = usesPermissions;
  }
  return androidManifest;
}

function withExactAlarmPermissions(config) {
  return withAndroidManifest(config, (config) => {
    for (const permission of EXACT_ALARM_PERMISSIONS) {
      config.modResults = ensureUsesPermission(config.modResults, permission);
    }
    return config;
  });
}

function withAlarmClockScheduling(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const filePath = path.join(
        config.modRequest.projectRoot,
        "node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoSchedulingDelegate.kt",
      );
      if (!fs.existsSync(filePath)) {
        return config;
      }

      const source = fs.readFileSync(filePath, "utf8");
      if (source.includes("setAlarmClock")) {
        return config;
      }
      if (!source.includes(INEXACT_EXACT_CALL)) {
        return config;
      }

      fs.writeFileSync(filePath, source.replace(INEXACT_EXACT_CALL, ALARM_CLOCK_CALL));
      return config;
    },
  ]);
}

function withExactNotificationAlarms(config) {
  config = withExactAlarmPermissions(config);
  config = withAlarmClockScheduling(config);
  return config;
}

module.exports = withExactNotificationAlarms;
