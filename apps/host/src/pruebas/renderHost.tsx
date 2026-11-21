import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { App } from "../App";
import { type Store, crearStore } from "../store";

/** Renderiza el host completo en una ruta, con un store nuevo (o el que se pase). */
export function renderHost(ruta = "/", store: Store = crearStore()) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}
