import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// Misma lista y mismo criterio que en cada remote: una sola copia de lo que tiene estado global.
const compartidas = [
  "react",
  "react-dom",
  "@mui/material",
  "@emotion/react",
  "@emotion/styled",
  "react-redux",
  "@reduxjs/toolkit",
] as const;

// El host solo conoce la URL del remoteEntry de cada remote, no su código. En el deploy (fase 5)
// se cambian por variable de entorno sin tocar el código del host.
const urlCatalogo = process.env.REMOTE_CATALOGO_URL ?? "http://localhost:5001";
const urlCarrito = process.env.REMOTE_CARRITO_URL ?? "http://localhost:5002";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      remotes: {
        catalogo: {
          type: "module",
          name: "catalogo",
          entry: `${urlCatalogo}/remoteEntry.js`,
        },
        carrito: {
          type: "module",
          name: "carrito",
          entry: `${urlCarrito}/remoteEntry.js`,
        },
      },
      shared: Object.fromEntries(
        compartidas.map((nombre) => [
          nombre,
          { singleton: true, requiredVersion: pkg.dependencies[nombre] },
        ]),
      ),
      // D-07: los tipos de los remotes están declarados en src/remotes.d.ts.
      dts: false,
    }),
  ],
  // Puerto fijo: el host ubica a cada remote por su URL (D-01).
  server: { port: 5000, strictPort: true },
  preview: { port: 5000, strictPort: true },
  build: { target: "esnext" },
});
