import type { ErrorRespuesta } from "./index";

/** URL de la API. En el deploy (fase 5) se define con VITE_API_URL al compilar cada app. */
export const URL_API: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** Error de la API con el status HTTP. `estado: 0` significa que no hubo respuesta (red caída). */
export class ErrorApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }

  /** El token falta, es inválido o venció: quien llama debe despachar `cerrarSesion`. */
  get esNoAutorizado() {
    return this.estado === 401;
  }
}

interface Opciones {
  metodo?: "GET" | "POST";
  cuerpo?: unknown;
  /** Si viene, viaja como `Authorization: Bearer` (D-04). */
  token?: string | null;
  signal?: AbortSignal;
  base?: string;
}

// Un solo cliente para todos los microfrontends: así el formato de errores, el header de
// autorización y el manejo del 401 son iguales en cada equipo.
export async function pedirApi<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = "GET", cuerpo, token, signal, base = URL_API } = opciones;

  const headers: Record<string, string> = {};
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    });
  } catch (causa) {
    // Una cancelación no es un error de red: se deja pasar para que quien llama la ignore.
    if (causa instanceof DOMException && causa.name === "AbortError") throw causa;
    throw new ErrorApi(0, "No pudimos conectarnos con el servidor. Probá de nuevo en un momento.");
  }

  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => null)) as Partial<ErrorRespuesta> | null;
    throw new ErrorApi(respuesta.status, datos?.error ?? "Ocurrió un error inesperado.");
  }
  return (await respuesta.json()) as T;
}
