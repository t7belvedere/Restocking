const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const emptyModulePath = path.join(__dirname, ".metro-empty-module.js");
fs.writeFileSync(emptyModulePath, "module.exports = {};");

const config = mergeConfig(getDefaultConfig(__dirname), {
  transformer: {
    unstable_allowRequireContext: true,
  },
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.endsWith(".module.css")) {
        return { filePath: emptyModulePath, type: "sourceFile" };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });
