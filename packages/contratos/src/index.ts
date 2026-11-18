// Contrato entre equipos: lo que cambia acá afecta a todos los microfrontends.
// Cambios incompatibles se versionan; nunca se rompe un tipo en silencio.

export interface Producto {
  id: string;
  nombre: string;
  /** Guaraníes, entero sin decimales. */
  precio: number;
  imagen: string;
  stock: number;
}

export interface LineaCarrito {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export { formatearPrecio } from "./precio";
