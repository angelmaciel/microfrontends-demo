import { describe, expect, it } from "vitest";
import type { Producto } from "./index";
import {
  agregarAlCarrito,
  cambiarCantidad,
  carritoReducer,
  quitarDelCarrito,
  seleccionarCantidadTotal,
  seleccionarTotal,
  vaciarCarrito,
} from "./carrito";

const yerba: Producto = {
  id: "yerba",
  nombre: "Yerba mate 1 kg",
  precio: 32000,
  imagen: "",
  stock: 2,
};
const termo: Producto = { id: "termo", nombre: "Termo", precio: 185000, imagen: "", stock: 5 };
const sinStock: Producto = { ...termo, id: "camisa", stock: 0 };

const conEstado = (...acciones: Parameters<typeof carritoReducer>[1][]) =>
  acciones.reduce(carritoReducer, carritoReducer(undefined, { type: "@@INIT" }));

describe("slice carrito", () => {
  it("agregar un producto nuevo crea una línea con cantidad 1 y el precio del catálogo", () => {
    expect(conEstado(agregarAlCarrito(yerba)).lineas).toEqual([
      { productoId: "yerba", nombre: "Yerba mate 1 kg", precio: 32000, cantidad: 1 },
    ]);
  });

  it("agregar de nuevo el mismo producto suma una unidad en la misma línea", () => {
    const estado = conEstado(agregarAlCarrito(yerba), agregarAlCarrito(yerba));
    expect(estado.lineas).toHaveLength(1);
    expect(estado.lineas[0]?.cantidad).toBe(2);
  });

  it("no supera el stock del producto", () => {
    const estado = conEstado(
      agregarAlCarrito(yerba),
      agregarAlCarrito(yerba),
      agregarAlCarrito(yerba),
    );
    expect(estado.lineas[0]?.cantidad).toBe(2);
  });

  it("un producto sin stock no se agrega", () => {
    expect(conEstado(agregarAlCarrito(sinStock)).lineas).toEqual([]);
  });

  it("cambiarCantidad actualiza la línea y en cero la quita", () => {
    const base = [agregarAlCarrito(termo), agregarAlCarrito(yerba)];
    expect(
      conEstado(...base, cambiarCantidad({ productoId: "termo", cantidad: 3 })).lineas[0],
    ).toMatchObject({
      cantidad: 3,
    });
    expect(
      conEstado(...base, cambiarCantidad({ productoId: "termo", cantidad: 0 })).lineas,
    ).toHaveLength(1);
  });

  it("quitar y vaciar", () => {
    const base = [agregarAlCarrito(termo), agregarAlCarrito(yerba)];
    expect(conEstado(...base, quitarDelCarrito("termo")).lineas.map((l) => l.productoId)).toEqual([
      "yerba",
    ]);
    expect(conEstado(...base, vaciarCarrito()).lineas).toEqual([]);
  });

  it("los selectores cuentan unidades y suman el total en guaraníes", () => {
    const carrito = conEstado(
      agregarAlCarrito(termo),
      agregarAlCarrito(yerba),
      agregarAlCarrito(yerba),
    );
    expect(seleccionarCantidadTotal({ carrito })).toBe(3);
    expect(seleccionarTotal({ carrito })).toBe(185000 + 2 * 32000);
  });
});
