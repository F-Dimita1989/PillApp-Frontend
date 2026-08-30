const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const BACKUP_DOMAINS = ["root", "file", "database", "sharedpref", "external"];

const DATA_EXTRACTION_RULES_RESOURCE = "data_extraction_rules";
const BACKUP_RULES_RESOURCE = "backup_rules";

function excludeElements(indent) {
  return BACKUP_DOMAINS.map(
    (domain) => `${indent}<exclude domain="${domain}" path="." />`,
  ).join("\n");
}

/**
 * Da API 31 allowBackup="false" ferma solo il backup su cloud: i trasferimenti
 * device-to-device vanno esclusi qui, sezione per sezione.
 */
function dataExtractionRulesXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
${excludeElements("    ")}
  </cloud-backup>
  <device-transfer>
${excludeElements("    ")}
  </device-transfer>
</data-extraction-rules>
`;
}

function backupRulesXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
${excludeElements("  ")}
</full-backup-content>
`;
}

function withBackupRuleResources(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const xmlDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      await fs.promises.mkdir(xmlDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(xmlDir, `${DATA_EXTRACTION_RULES_RESOURCE}.xml`),
        dataExtractionRulesXml(),
        "utf8",
      );
      await fs.promises.writeFile(
        path.join(xmlDir, `${BACKUP_RULES_RESOURCE}.xml`),
        backupRulesXml(),
        "utf8",
      );
      return config;
    },
  ]);
}

function withBackupDisabledManifest(config) {
  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );
    application.$["android:allowBackup"] = "false";
    application.$["android:fullBackupContent"] =
      `@xml/${BACKUP_RULES_RESOURCE}`;
    application.$["android:dataExtractionRules"] =
      `@xml/${DATA_EXTRACTION_RULES_RESOURCE}`;
    return config;
  });
}

function withDisabledAndroidBackup(config) {
  config = withBackupDisabledManifest(config);
  config = withBackupRuleResources(config);
  return config;
}

module.exports = withDisabledAndroidBackup;
