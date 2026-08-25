const { withAppBuildGradle } = require("expo/config-plugins");

const CMAKE_ARGS = `
        ndk {
            abiFilters "arm64-v8a"
        }
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=128"
            }
        }`;

function withShortCmakeObjectPaths(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("CMAKE_OBJECT_PATH_MAX")) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /defaultConfig \{/,
      `defaultConfig {${CMAKE_ARGS}`,
    );
    return config;
  });
}

module.exports = withShortCmakeObjectPaths;
