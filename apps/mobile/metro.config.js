// Metro config that works with any Expo SDK
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Follow PNPM symlinks and force a single React copy
config.resolver.unstable_enableSymlinks = true;
config.resolver.alias = {
  react: path.resolve(__dirname, "node_modules/react"),
  "react-native": path.resolve(__dirname, "node_modules/react-native"),
};

module.exports = config;
