// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Support SVGs as React components (react-native-svg-transformer)
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  // expo-sqlite's build output uses extensionless relative exports, which
  // breaks under Metro's strict package-exports resolution. Disable it.
  unstable_enablePackageExports: false,
};

module.exports = config;
