const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Handle .module.css files as assets (fixes @expo/log-box CSS module imports)
config.resolver.assetExts.push("module.css");

module.exports = withNativeWind(config, { input: "./global.css" });
