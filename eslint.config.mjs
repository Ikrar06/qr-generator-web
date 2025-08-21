import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parser: await import("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-require-imports": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-assign-module-variable": "off", // Disable this rule temporarily
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": ["warn", {
        forbid: [">", "}"]
      }]
    },
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "*.config.js",
      "*.config.ts"
    ]
  }
];

export default eslintConfig;