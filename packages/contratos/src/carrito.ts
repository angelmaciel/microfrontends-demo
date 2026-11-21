import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { LineaCarrito, Producto } from "./index";

// Slice del carrito compartido (D-03). Lo escriben y lo leen tres microfrontends distintos:
// el catálogo agrega, el MiniCarrito cuenta y el Carrito edita y confirma. Como todos usan el
// mismo store del host, un cambio en uno se ve al instante en los otros, sin eventos ni props.

export interface EstadoCarrito {
  lineas: LineaCarrito[];
}

/** Tope por línea; el stock real lo valida el servidor al confirmar el pedido. */
export const CANTIDAD_MAXIMA = 99;

const inicial: EstadoCarrito = { lineas: [] };

const carrito = createSlice({
  name: "carrito",
  initialState: inicial,
  reducers: {
    /** Suma una unidad. Si no hay stock, o ya se agregó todo el stock disponible, no hace nada. */
    agregarAlCarrito: (estado, { payload: producto }: PayloadAction<Producto>) => {
      const linea = estado.lineas.find((l) => l.productoId === producto.id);
      const tope = Math.min(producto.stock, CANTIDAD_MAXIMA);
      if (linea) {
        if (linea.cantidad < tope) linea.cantidad += 1;
      } else if (tope > 0) {
        estado.lineas.push({
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        });
      }
    },
    cambiarCantidad: (
      estado,
      { payload }: PayloadAction<{ productoId: string; cantidad: number }>,
    ) => {
      const linea = estado.lineas.find((l) => l.productoId === payload.productoId);
      if (!linea) return;
      // Bajar a cero equivale a quitar el producto.
      if (payload.cantidad < 1) {
        estado.lineas = estado.lineas.filter((l) => l.productoId !== payload.productoId);
      } else {
        linea.cantidad = Math.min(Math.floor(payload.cantidad), CANTIDAD_MAXIMA);
      }
    },
    quitarDelCarrito: (estado, { payload: productoId }: PayloadAction<string>) => {
      estado.lineas = estado.lineas.filter((l) => l.productoId !== productoId);
    },
    vaciarCarrito: () => inicial,
  },
});

export const { agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito } =
  carrito.actions;
export const carritoReducer = carrito.reducer;

type ConCarrito = { carrito: EstadoCarrito };

export const seleccionarLineas = (estado: ConCarrito) => estado.carrito.lineas;

/** Unidades totales (no líneas): es lo que muestra el contador del encabezado. */
export const seleccionarCantidadTotal = (estado: ConCarrito) =>
  estado.carrito.lineas.reduce((suma, l) => suma + l.cantidad, 0);

/** Total estimado en guaraníes. El total que vale es el que calcula la API al confirmar. */
export const seleccionarTotal = (estado: ConCarrito) =>
  estado.carrito.lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
