const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.transformer.unstable_allowRequireContext = true;

module.exports = withNativeWind(config, { input: "./global.css" });
