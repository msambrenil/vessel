import { createRequire } from "module";
import nextPlugin from "@next/eslint-plugin-next";

const require = createRequire(import.meta.url);
const babelParser = require("next/dist/compiled/babel/eslint-parser");

export default [
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: ["next/babel"],
          caller: {
            supportsTopLevelAwait: true,
          },
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "coverage/**",
      ".agents/**",
      "eslint.config.mjs",
    ],
  },
];
