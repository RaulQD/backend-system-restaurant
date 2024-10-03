import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    ignores: ["node_modules", "dist/", "build/"],
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
  },
  {
    "env": {
      "node": true,
      "commonjs": true
    },
    rules: {
      eqeqeq: "error",
      "no-unused-vars": "error",
      "prefer-const": ["error", { "ignoreReadBeforeAssign": true }],
      "no-unused-vars": "off",
      "quotes": ["error", "single"],
      "semi": ["error", "never"],
      "camelcase": "off"
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];