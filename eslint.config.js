import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/coverage/**",
    "**/.__mf__temp/**",
    "**/__mf__virtual/**",
    "**/@mf-types/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Microfrontends y contrato: código de navegador con React.
    files: ["apps/{host,catalogo,carrito}/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"], reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  {
    // La API corre en Node.
    files: ["apps/api/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    // El servidor anuncia el puerto por consola; config y pruebas no exportan componentes.
    files: ["apps/api/src/servidor.ts"],
    rules: { "no-console": "off" },
  },
  {
    files: ["**/*.config.{ts,js}", "**/*.test.{ts,tsx}", "**/main.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
]);
