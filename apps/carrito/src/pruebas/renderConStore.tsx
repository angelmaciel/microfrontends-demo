import { type StoreTienda, crearStoreTienda } from "@demo/contratos/estado";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";

/** Renderiza con un store nuevo de la tienda (o el que se pase), como lo haría el host. */
export function renderConStore(ui: ReactElement, store: StoreTienda = crearStoreTienda()) {
  render(<Provider store={store}>{ui}</Provider>);
  return store;
}
