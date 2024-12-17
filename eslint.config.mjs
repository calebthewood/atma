// eslint.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import tailwindPlugin from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Ignore patterns
  {
    ignores: [
      "dist/*",
      "**/.cache",
      "**/public",
      "**/node_modules",
      "**/*.esm.js",
    ],
  },
  // Base config
  js.configs.recommended,
  // Compatibility layer for traditional configs
  ...compat.extends("next/core-web-vitals"),

  // Main configuration
  {
    plugins: {
      tailwindcss: tailwindPlugin,
      "@typescript-eslint": tsPlugin,
    },

    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: "tailwind.config.js",
      },
      next: {
        rootDir: ["./"],
      },
    },

    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "warn",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/classnames-order": "off",
      "no-unused-vars": "off",
      "no-undef": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  prettier,
];
