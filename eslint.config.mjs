/* eslint-env node */
//  https://stackoverflow.com/questions/78348933/how-to-use-eslint-flat-config-for-vue-with-typescript

import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

/**
"plugin:vue/base"                       ... Settings and rules to enable correct ESLint parsing.
"plugin:vue/vue3-essential"             ... base, plus rules to prevent errors or unintended behavior.
"plugin:vue/vue3-strongly-recommended"  ... Above, plus rules to considerably improve code readability and/or dev experience.
"plugin:vue/vue3-recommended"           ... Above, plus rules to enforce subjective community defaults to ensure consistency.
*/
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    //extends: [
    //  "plugin:vue/vue3-essential",
    //  "eslint:recommended",
    //  "@vue/eslint-config-prettier/skip-formatting"
    //],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest"
      },
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.node
      }
    },
    rules: {
      "no-console": ["warn"],
      "no-constant-condition": ["warn"],
      "no-unreachable": ["warn"],
      "no-unused-vars": ["warn", { args: "none" }]
    }
  }
];
