import { CssBaseline, ThemeProvider } from "@mui/material";
import { tema } from "@demo/contratos/tema";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { crearStore } from "./store";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("No se encontró el elemento #root");

// El host provee el contexto (store, tema y router) una sola vez; los remotes lo heredan porque
// react-redux, MUI y emotion se comparten como singleton.
createRoot(raiz).render(
  <StrictMode>
    <Provider store={crearStore()}>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
