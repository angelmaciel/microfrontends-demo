import type { Producto } from "@demo/contratos";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Catalogo from "./Catalogo";

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
    render(<Catalogo />);
    expect(screen.getByRole("status", { name: "Cargando productos" })).toBeInTheDocument();
  });

  it("lista los productos con su precio en guaraníes y marca los que no tienen stock", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(200, productos)));
    render(<Catalogo />);

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
    render(<Catalogo />);
    expect(await screen.findByText(/Todavía no hay productos/)).toBeInTheDocument();
  });

  it("si la API está caída muestra el error y Reintentar vuelve a pedir", async () => {
    const fetchFalso = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(respuesta(200, productos));
    vi.stubGlobal("fetch", fetchFalso);
    render(<Catalogo />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectarnos");
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });
});
