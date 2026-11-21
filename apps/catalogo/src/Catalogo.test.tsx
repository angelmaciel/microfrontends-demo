import type { Producto } from "@demo/contratos";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Catalogo from "./Catalogo";
import { renderConStore } from "./pruebas/renderConStore";

const productos: Producto[] = [
  { id: "yerba", nombre: "Yerba mate 1 kg", precio: 32000, imagen: "/yerba.jpg", stock: 10 },
  { id: "camisa", nombre: "Camisa de ao po'i", precio: 280000, imagen: "/camisa.jpg", stock: 0 },
];

const respuesta = (estado: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });

describe("Catalogo (expuesto)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Se monta sin App ni main.tsx, como lo hace el host: no debe depender de ellos.
  it("mientras carga muestra un indicador", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
    renderConStore(<Catalogo />);
    expect(screen.getByRole("status", { name: "Cargando productos" })).toBeInTheDocument();
  });

  it("lista los productos con su precio en guaraníes y marca los que no tienen stock", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(200, productos)));
    renderConStore(<Catalogo />);

    const tarjetas = await screen.findAllByRole("listitem");
    expect(tarjetas).toHaveLength(2);

    const yerba = screen.getByRole("listitem", { name: "Yerba mate 1 kg" });
    expect(within(yerba).getByText(/32\.000/)).toBeInTheDocument();
    expect(within(yerba).queryByText("Sin stock")).not.toBeInTheDocument();

    const camisa = screen.getByRole("listitem", { name: "Camisa de ao po'i" });
    expect(within(camisa).getByText("Sin stock")).toBeInTheDocument();
  });

  it("si no hay productos lo dice", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(200, [])));
    renderConStore(<Catalogo />);
    expect(await screen.findByText(/Todavía no hay productos/)).toBeInTheDocument();
  });

  it("si la API está caída muestra el error y Reintentar vuelve a pedir", async () => {
    const fetchFalso = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(respuesta(200, productos));
    vi.stubGlobal("fetch", fetchFalso);
    renderConStore(<Catalogo />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectarnos");
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });
});

it("agregar un producto lo suma al carrito del store; sin stock no se puede", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(200, productos)));
  const store = renderConStore(<Catalogo />);

  await userEvent.click(
    await screen.findByRole("button", { name: "Agregar Yerba mate 1 kg al carrito" }),
  );

  expect(store.getState().carrito.lineas).toHaveLength(1);
  expect(
    screen.getByRole("button", { name: "Agregar Camisa de ao po'i al carrito" }),
  ).toBeDisabled();
});
