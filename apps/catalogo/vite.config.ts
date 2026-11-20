import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// Librerías con estado global o contexto de React: si cada microfrontend cargara su propia copia,
// habría dos Reacts (hooks rotos), dos stores y dos temas. Como singleton, gana una sola copia.
// La versión sale del package.json de esta app, así no se desincroniza con lo instalado.
const compartidas = [
  "react",
  "react-dom",
  "@mui/material",
  "@emotion/react",
  "@emotion/styled",
  "react-redux",
  "@reduxjs/toolkit",
] as const;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "catalogo",
      filename: "remoteEntry.js",
      // Solo se expone el componente; App.tsx y main.tsx quedan para el modo standalone.
      exposes: { "./Catalogo": "./src/Catalogo.tsx" },
      shared: Object.fromEntries(
        compartidas.map((nombre) => [
          nombre,
          { singleton: true, requiredVersion: pkg.dependencies[nombre] },
        ]),
      ),
      // D-07: el host declara los tipos a mano; no se generan ni publican @mf-types.
      dts: false,
    }),
  ],
  // Puerto fijo: el host ubica a cada remote por su URL (D-01).
  server: { port: 5001, strictPort: true, origin: "http://localhost:5001" },
  preview: { port: 5001, strictPort: true },
  // remoteEntry usa top-level await para inicializar las dependencias compartidas.
  build: { target: "esnext" },
});
