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
            "@types": "./types",
            "@database": "./database",
          },
        },
      ],
      // Reanimated plugin has to be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
