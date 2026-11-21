import { type StoreTienda, crearStoreTienda } from "@demo/contratos/estado";

// El store vive en el host y es uno solo para toda la página (D-03). Los remotes lo usan a
// través del <Provider> del host, porque react-redux y RTK se comparten como singleton.
// Los slices salen del contrato, así el host y los remotes en standalone arman el mismo store.
// Es una función para que cada prueba arranque con un store limpio.
export const crearStore = crearStoreTienda;

export type Store = StoreTienda;
