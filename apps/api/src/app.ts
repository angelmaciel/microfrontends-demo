import { randomUUID } from "node:crypto";
import type {
  ErrorRespuesta,
  LineaCarrito,
  Pedido,
  RespuestaLogin,
  Usuario,
} from "@demo/contratos";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { productos, usuarios } from "./datos";
import { type DatosToken, contrasenaValida, firmarToken, verificarToken } from "./seguridad";

// Orígenes de los microfrontends en desarrollo. En producción se leen del entorno (fase 5).
const ORIGENES = ["http://localhost:5000", "http://localhost:5001", "http://localhost:5002"];

const esquemaLogin = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria").max(200),
});

const esquemaPedido = z.object({
  lineas: z
    .array(
      z.object({
        productoId: z.string().min(1).max(100),
        cantidad: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "El pedido no tiene productos")
    .max(50),
});

type Entorno = { Variables: { usuario: DatosToken } };

const error = (c: Context, estado: 400 | 401 | 404 | 500, mensaje: string) =>
  c.json<ErrorRespuesta>({ error: mensaje }, estado);

/** Lee el JSON del cuerpo y lo valida; devuelve `null` si es inválido. */
async function leerCuerpo<T>(c: Context, esquema: z.ZodType<T>): Promise<T | null> {
  const cuerpo: unknown = await c.req.json().catch(() => null);
  const resultado = esquema.safeParse(cuerpo);
  return resultado.success ? resultado.data : null;
}

interface Opciones {
  /** Secreto para firmar los JWT. Se inyecta para poder probar sin `.env`. */
  secreto: string;
}

export function crearApp({ secreto }: Opciones) {
  const clave = new TextEncoder().encode(secreto);
  const app = new Hono<Entorno>().basePath("/api");

  app.use("*", cors({ origin: ORIGENES, allowHeaders: ["Authorization", "Content-Type"] }));

  // Solo deja pasar requests con un `Authorization: Bearer <token>` válido y vigente.
  const requiereSesion = createMiddleware<Entorno>(async (c, next) => {
    const encabezado = c.req.header("Authorization") ?? "";
    const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : "";
    const usuario = token ? await verificarToken(token, clave) : null;
    if (!usuario) return error(c, 401, "Tu sesión no es válida o expiró. Volvé a ingresar.");
    c.set("usuario", usuario);
    await next();
  });

  app.get("/salud", (c) => c.json({ estado: "ok" }));

  app.post("/auth/login", async (c) => {
    const datos = await leerCuerpo(c, esquemaLogin);
    if (!datos) return error(c, 400, "Revisá el email y la contraseña.");

    const guardado = usuarios.find((u) => u.email === datos.email.toLowerCase());
    // Mismo mensaje si el email no existe o la contraseña falla: no revela qué emails existen.
    if (!guardado || !contrasenaValida(datos.password, guardado.hashContrasena)) {
      return error(c, 401, "Email o contraseña incorrectos");
    }

    const usuario: Usuario = { email: guardado.email, nombre: guardado.nombre };
    const token = await firmarToken({ id: guardado.id, ...usuario }, clave);
    return c.json<RespuestaLogin>({ token, usuario });
  });

  app.get("/productos", (c) => c.json(productos));

  app.post("/pedidos", requiereSesion, async (c) => {
    const datos = await leerCuerpo(c, esquemaPedido);
    if (!datos) return error(c, 400, "El pedido no es válido.");

    // El precio sale siempre del catálogo del servidor, nunca de lo que manda el cliente.
    const lineas: LineaCarrito[] = [];
    for (const { productoId, cantidad } of datos.lineas) {
      const producto = productos.find((p) => p.id === productoId);
      if (!producto) return error(c, 400, "Uno de los productos ya no existe.");
      if (cantidad > producto.stock) {
        return error(c, 400, `No hay stock suficiente de ${producto.nombre}.`);
      }
      lineas.push({ productoId, nombre: producto.nombre, precio: producto.precio, cantidad });
    }

    const pedido: Pedido = {
      id: randomUUID(),
      lineas,
      total: lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0),
      creadoEn: new Date().toISOString(),
    };
    return c.json(pedido, 201);
  });

  app.notFound((c) => error(c, 404, "Ruta no encontrada."));

  // Nunca se devuelve el detalle del error al cliente; se registra en el servidor.
  app.onError((err, c) => {
    console.error(err);
    return error(c, 500, "Ocurrió un error inesperado.");
  });

  return app;
}
