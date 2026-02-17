import js from "@eslint/js";
import globals from "globals";
import {defineConfig} from "eslint/config";

export default defineConfig([
  {
      files: ["src/js/**/*.js"],
      plugins: { js },
      extends: ["js/recommended"],
      languageOptions: {
          ecmaVersion: 2020,
          sourceType: "script",
          globals: {
              ...globals.browser,
              IDRViewer: "writable"
          }
      },
      rules: {
          "strict": ["error", "function"],
          "no-empty": ["error", { "allowEmptyCatch": true }],
          "no-prototype-builtins": "off",
          "no-unused-vars": ["error", { "caughtErrors": "all", "caughtErrorsIgnorePattern": "^ignore" }],
          "no-var": "error"
      }
  },
  {
      files: ["scripts/**/*.js"],
      plugins: { js },
      extends: ["js/recommended"],
      languageOptions: {
          ecmaVersion: 2020,
          sourceType: "commonjs",
          globals: globals.node
      }
  }
]);
