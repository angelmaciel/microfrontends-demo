// Contrato entre equipos: lo que cambia acá afecta a todos los microfrontends y a la API.
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

/** Datos públicos del usuario: nunca incluye la contraseña ni su hash. */
export interface Usuario {
  email: string;
  nombre: string;
}

/** Respuesta de `POST /api/auth/login`. */
export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

/** Cuerpo de `POST /api/pedidos`: solo ids y cantidades; el precio lo pone el servidor. */
export interface NuevoPedido {
  lineas: { productoId: string; cantidad: number }[];
}

/** Respuesta de `POST /api/pedidos`. */
export interface Pedido {
  id: string;
  lineas: LineaCarrito[];
  /** Guaraníes, calculado en el servidor con los precios del catálogo. */
  total: number;
  /** Fecha ISO 8601. */
  creadoEn: string;
}

/** Forma de todo error de la API. */
export interface ErrorRespuesta {
  error: string;
}

export { formatearPrecio } from "./precio";
