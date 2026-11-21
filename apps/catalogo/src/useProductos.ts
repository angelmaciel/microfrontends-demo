import type { Producto } from "@demo/contratos";
import { ErrorApi, pedirApi } from "@demo/contratos/cliente";
import { useEffect, useState } from "react";

export type EstadoProductos =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; productos: Producto[] };

// Pide los productos a la API y expone los tres estados que la UI tiene que mostrar.
// Un estado único (en vez de `cargando`, `error` y `datos` sueltos) evita combinaciones
// imposibles, como "cargando y con error a la vez".
export function useProductos() {
  const [estado, setEstado] = useState<EstadoProductos>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si el componente se desmonta o se reintenta, se cancela el pedido anterior: así una
    // respuesta vieja nunca pisa a una nueva.
    const control = new AbortController();
    pedirApi<Producto[]>("/productos", { signal: control.signal })
      .then((productos) => setEstado({ tipo: "listo", productos }))
      .catch((causa: unknown) => {
        if (control.signal.aborted) return;
        const mensaje =
          causa instanceof ErrorApi ? causa.message : "No pudimos cargar los productos.";
        setEstado({ tipo: "error", mensaje });
      });
    return () => control.abort();
  }, [intento]);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  };

  return { estado, reintentar };
}
