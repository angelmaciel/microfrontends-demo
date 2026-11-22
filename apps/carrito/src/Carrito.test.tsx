import type { Producto } from "@demo/contratos";
import { agregarAlCarrito } from "@demo/contratos/carrito";
import { crearStoreTienda } from "@demo/contratos/estado";
import { iniciarSesion } from "@demo/contratos/sesion";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Carrito from "./Carrito";
import { renderConStore } from "./pruebas/renderConStore";

const yerba: Producto = {
  id: "yerba",
  nombre: "Yerba mate 1 kg",
  precio: 32000,
  imagen: "",
  stock: 10,
};
const termo: Producto = { id: "termo", nombre: "Termo", precio: 185000, imagen: "", stock: 5 };

const respuesta = (estado: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });

/** Store con yerba x2 y termo x1; con sesión si se pide. */
function storeConProductos({ conSesion = false } = {}) {
  const store = crearStoreTienda();
  store.dispatch(agregarAlCarrito(yerba));
  store.dispatch(agregarAlCarrito(yerba));
  store.dispatch(agregarAlCarrito(termo));
  if (conSesion) {
    store.dispatch(
      iniciarSesion({ token: "tkn", usuario: { email: "demo@tienda.com", nombre: "Demo" } }),
    );
  }
  return store;
}

describe("Carrito (expuesto)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sin productos dice que está vacío", () => {
    renderConStore(<Carrito irALogin={vi.fn()} />);
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
  });

  it("muestra cada línea con su cantidad y el total en guaraníes", () => {
    renderConStore(<Carrito irALogin={vi.fn()} />, storeConProductos());

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByLabelText("Cantidad de Yerba mate 1 kg")).toHaveTextContent("2");
    expect(screen.getByText(/Total estimado/)).toHaveTextContent(/249\.000/);
  });

  it("sumar, restar y quitar actualizan el store", async () => {
    const store = renderConStore(<Carrito irALogin={vi.fn()} />, storeConProductos());

    await userEvent.click(screen.getByRole("button", { name: "Sumar una unidad de Termo" }));
    expect(screen.getByLabelText("Cantidad de Termo")).toHaveTextContent("2");

    await userEvent.click(
      screen.getByRole("button", { name: "Quitar una unidad de Yerba mate 1 kg" }),
    );
    expect(screen.getByLabelText("Cantidad de Yerba mate 1 kg")).toHaveTextContent("1");

    await userEvent.click(screen.getByRole("button", { name: "Quitar Termo del carrito" }));
    expect(store.getState().carrito.lineas.map((l) => l.productoId)).toEqual(["yerba"]);
  });

  it("sin sesión, confirmar pide ingresar y no llama a la API", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);
    const irALogin = vi.fn();
    renderConStore(<Carrito irALogin={irALogin} />, storeConProductos());

    await userEvent.click(screen.getByRole("button", { name: "Ingresá para confirmar" }));

    expect(irALogin).toHaveBeenCalledOnce();
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("con sesión confirma el pedido con el token, muestra el número y vacía el carrito", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(
      respuesta(201, {
        id: "abcd1234-0000",
        lineas: [],
        total: 249000,
        creadoEn: "2026-11-21T00:00:00.000Z",
      }),
    );
    vi.stubGlobal("fetch", fetchFalso);
    const store = renderConStore(
      <Carrito irALogin={vi.fn()} />,
      storeConProductos({ conSesion: true }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Pedido confirmado.*abcd1234/);
    expect(store.getState().carrito.lineas).toEqual([]);

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(opciones.headers).toMatchObject({ Authorization: "Bearer tkn" });
    // Solo viajan ids y cantidades: nunca el precio.
    expect(JSON.parse(opciones.body as string)).toEqual({
      lineas: [
        { productoId: "yerba", cantidad: 2 },
        { productoId: "termo", cantidad: 1 },
      ],
    });
  });

  it("si la API responde 401 cierra la sesión, avisa que expiró y conserva el carrito", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(401, { error: "Expiró" })));
    const irALogin = vi.fn();
    const store = renderConStore(
      <Carrito irALogin={irALogin} />,
      storeConProductos({ conSesion: true }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(irALogin).toHaveBeenCalledOnce();
    expect(store.getState().sesion).toMatchObject({ token: null, motivoCierre: "expirada" });
    expect(store.getState().carrito.lineas).toHaveLength(2);
  });

  it("si falla por otro motivo muestra el mensaje de la API y permite reintentar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(400, { error: "No hay stock suficiente de Termo." })),
    );
    renderConStore(<Carrito irALogin={vi.fn()} />, storeConProductos({ conSesion: true }));

    await userEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No hay stock suficiente de Termo.");
    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeEnabled();
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2);
  });
});
