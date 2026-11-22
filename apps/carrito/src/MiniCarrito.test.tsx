import type { Producto } from "@demo/contratos";
import { agregarAlCarrito } from "@demo/contratos/carrito";
import { crearStoreTienda } from "@demo/contratos/estado";
import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MiniCarrito from "./MiniCarrito";
import { renderConStore } from "./pruebas/renderConStore";

const yerba: Producto = { id: "yerba", nombre: "Yerba", precio: 32000, imagen: "", stock: 10 };

describe("MiniCarrito", () => {
  it("anuncia la cantidad a los lectores de pantalla", () => {
    renderConStore(<MiniCarrito />);
    expect(screen.getByText("(0 productos)", { exact: false })).toBeInTheDocument();
  });

  it("se actualiza cuando otro microfrontend agrega al store compartido", () => {
    const store = crearStoreTienda();
    renderConStore(<MiniCarrito />, store);

    // Simula al catálogo: despacha en el mismo store sin tocar el componente.
    act(() => {
      store.dispatch(agregarAlCarrito(yerba));
    });
    expect(screen.getByText("(1 producto)", { exact: false })).toBeInTheDocument();

    act(() => {
      store.dispatch(agregarAlCarrito(yerba));
    });
    expect(screen.getByText("(2 productos)", { exact: false })).toBeInTheDocument();
  });
});
