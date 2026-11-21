import { CssBaseline, ThemeProvider } from "@mui/material";
import { crearStoreTienda } from "@demo/contratos/estado";
import { tema } from "@demo/contratos/tema";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("No se encontró el elemento #root");

// Modo standalone: sin host no hay store compartido, así que se crea uno local con los mismos
// slices del contrato. Dentro del host este archivo no se usa: el remote toma el store del host.
createRoot(raiz).render(
  <StrictMode>
    <Provider store={crearStoreTienda()}>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
