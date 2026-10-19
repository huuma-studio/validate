import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    printWidth: 80,
    embeddedLanguageFormatting: "off",
  },
});
