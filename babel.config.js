module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@components": "./components",
            "@features": "./features",
            "@services": "./services",
            "@hooks": "./hooks",
            "@constants": "./constants",
            "@utils": "./utils",
            "@app-types": "./types",
            "@database": "./database",
          },
        },
      ],
      // Worklets plugin (required by Reanimated 4) has to be listed last
      "react-native-worklets/plugin",
    ],
  };
};
