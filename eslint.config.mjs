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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-else-return": "warn",
      "prefer-template": "warn",
      "object-shorthand": ["warn", "always"],

      "no-shadow": "error",
      "no-param-reassign": ["error", { props: true }],

      "no-console": ["warn", { allow: ["warn", "error"] }],

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Avoid parent imports; prefer absolute or aliased paths.",
            },
          ],
        },
      ],

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // TypeScript specifics
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["**/*.{config,cjs,mjs}.js"],
    languageOptions: {
      sourceType: "script",
    },
    rules: {
      "no-console": "off",
    },
  },
];
export default eslintConfig;
