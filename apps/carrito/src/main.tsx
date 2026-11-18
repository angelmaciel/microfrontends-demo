import { CssBaseline, ThemeProvider } from "@mui/material";
import { tema } from "@demo/contratos/tema";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("No se encontró el elemento #root");

createRoot(raiz).render(
  <StrictMode>
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
