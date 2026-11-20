import { configureStore } from "@reduxjs/toolkit";
import { sesionReducer } from "@demo/contratos/sesion";

// El store vive en el host y es uno solo para toda la página (D-03). Los remotes lo usan a
// través del <Provider> del host, porque react-redux y RTK se comparten como singleton.
// Es una función para que cada prueba arranque con un store limpio.
export function crearStore() {
  return configureStore({
    reducer: { sesion: sesionReducer },
  });
}

export type Store = ReturnType<typeof crearStore>;
