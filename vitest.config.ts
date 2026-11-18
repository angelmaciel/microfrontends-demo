import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const microfrontend = (nombre: string) => ({
  plugins: [react()],
  test: {
    name: nombre,
    root: `apps/${nombre}`,
    environment: "jsdom",
    setupFiles: ["../../vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

// Un proyecto por workspace: cada equipo corre lo suyo con `vitest --project <nombre>`.
export default defineConfig({
  test: {
    projects: [
      microfrontend("host"),
      microfrontend("catalogo"),
      microfrontend("carrito"),
      {
        test: {
          name: "api",
          root: "apps/api",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "contratos",
          root: "packages/contratos",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["apps/*/src/**", "packages/*/src/**"],
      exclude: ["**/*.test.*", "**/main.tsx", "**/servidor.ts"],
    },
  },
});
