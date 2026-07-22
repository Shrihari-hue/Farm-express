module.exports = {
  root: true,
  extends: ["eslint-config-expo"],
  ignorePatterns: ["/dist/*", "node_modules/*"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
