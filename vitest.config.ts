import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Módulos que en runtime resuelve Module Federation; en las pruebas apuntan a un módulo de relleno.
// El query string hace que cada uno sea un módulo distinto, así vi.mock puede simularlos por
// separado aunque compartan archivo.
const remotesFalsos = Object.fromEntries(
  ["catalogo/Catalogo", "carrito/Carrito", "carrito/MiniCarrito"].map((id) => [
    id,
    `${fileURLToPath(new URL("./apps/host/src/pruebas/remoteFalso.tsx", import.meta.url))}?remote=${id}`,
  ]),
);

const microfrontend = (nombre: string) => ({
  plugins: [react()],
  resolve: nombre === "host" ? { alias: remotesFalsos } : {},
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
