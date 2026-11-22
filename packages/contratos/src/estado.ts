import { configureStore } from "@reduxjs/toolkit";
import { carritoReducer } from "./carrito";
import { sesionReducer } from "./sesion";

// La forma del estado global es parte del contrato: el host la monta y los remotes la leen.
// Tener los reducers juntos acá garantiza que el host y cada remote en standalone armen
// exactamente el mismo store.
export const reductores = {
  sesion: sesionReducer,
  carrito: carritoReducer,
};

/** Store con todos los slices. Lo usa el host y, en modo standalone, cada remote. */
export function crearStoreTienda() {
  return configureStore({ reducer: reductores });
}

export type StoreTienda = ReturnType<typeof crearStoreTienda>;
export type EstadoTienda = ReturnType<StoreTienda["getState"]>;
