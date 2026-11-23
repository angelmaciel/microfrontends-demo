import type { Pedido, Producto, RespuestaLogin } from "@demo/contratos";
import { describe, expect, it } from "vitest";
import { crearApp } from "./app";
import { DURACION_SEGUNDOS, firmarToken } from "./seguridad";

// Secreto solo de prueba: la app se crea con él, sin depender de un .env.
const SECRETO = "secreto-de-prueba-con-mas-de-32-caracteres";
const app = crearApp({ secreto: SECRETO });
const clave = new TextEncoder().encode(SECRETO);
const usuarioDemo = { id: "u-1", email: "demo@tienda.com", nombre: "Cliente Demo" };

const enviar = (ruta: string, cuerpo: unknown, token?: string) =>
  app.request(ruta, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(cuerpo),
  });

const iniciarSesion = async () => {
  const res = await enviar("/api/auth/login", {
    email: "demo@tienda.com",
    password: "demo1234",
  });
  return ((await res.json()) as RespuestaLogin).token;
};

describe("api", () => {
  it("GET /api/salud responde ok", async () => {
    const res = await app.request("/api/salud");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ estado: "ok" });
  });

  it("permite CORS solo a los orígenes de los microfrontends", async () => {
    const permitido = await app.request("/api/salud", {
      headers: { Origin: "http://localhost:5000" },
    });
    expect(permitido.headers.get("access-control-allow-origin")).toBe("http://localhost:5000");

    const ajeno = await app.request("/api/salud", { headers: { Origin: "https://evil.example" } });
    expect(ajeno.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("en producción permite los orígenes que recibe y ya no los de localhost", async () => {
    const produccion = crearApp({
      secreto: SECRETO,
      origenes: ["https://tienda-host.onrender.com"],
    });

    const publicado = await produccion.request("/api/salud", {
      headers: { Origin: "https://tienda-host.onrender.com" },
    });
    expect(publicado.headers.get("access-control-allow-origin")).toBe(
      "https://tienda-host.onrender.com",
    );

    const local = await produccion.request("/api/salud", {
      headers: { Origin: "http://localhost:5000" },
    });
    expect(local.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("una ruta inexistente responde 404 en español", async () => {
    const res = await app.request("/api/no-existe");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Ruta no encontrada." });
  });
});

describe("POST /api/auth/login", () => {
  it("con credenciales correctas devuelve el token y los datos públicos del usuario", async () => {
    const res = await enviar("/api/auth/login", {
      email: "demo@tienda.com",
      password: "demo1234",
    });
    expect(res.status).toBe(200);
    const cuerpo = (await res.json()) as RespuestaLogin;
    expect(cuerpo.usuario).toEqual({ email: "demo@tienda.com", nombre: "Cliente Demo" });
    expect(cuerpo.token.split(".")).toHaveLength(3);
    expect(JSON.stringify(cuerpo)).not.toContain("hash");
  });

  it("acepta el email con mayúsculas", async () => {
    const res = await enviar("/api/auth/login", {
      email: "Demo@Tienda.com",
      password: "demo1234",
    });
    expect(res.status).toBe(200);
  });

  it.each([
    ["contraseña incorrecta", { email: "demo@tienda.com", password: "otra" }],
    ["email inexistente", { email: "nadie@tienda.com", password: "demo1234" }],
  ])("con %s responde 401 con el mismo mensaje", async (_caso, credenciales) => {
    const res = await enviar("/api/auth/login", credenciales);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Email o contraseña incorrectos" });
  });

  it.each([
    ["email inválido", { email: "no-es-email", password: "x" }],
    ["sin contraseña", { email: "demo@tienda.com" }],
    ["cuerpo vacío", null],
  ])("con %s responde 400", async (_caso, cuerpo) => {
    const res = await enviar("/api/auth/login", cuerpo);
    expect(res.status).toBe(400);
  });

  it("con JSON malformado responde 400 y no 500", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{no es json",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/productos", () => {
  it("es público y devuelve precios enteros en guaraníes", async () => {
    const res = await app.request("/api/productos");
    expect(res.status).toBe(200);
    const productos = (await res.json()) as Producto[];
    expect(productos.length).toBeGreaterThan(0);
    for (const p of productos) expect(Number.isInteger(p.precio)).toBe(true);
  });
});

describe("POST /api/pedidos", () => {
  const pedidoValido = { lineas: [{ productoId: "yerba-1kg", cantidad: 2 }] };

  it("sin token responde 401", async () => {
    const res = await enviar("/api/pedidos", pedidoValido);
    expect(res.status).toBe(401);
  });

  it("con un token adulterado responde 401", async () => {
    const token = await iniciarSesion();
    const adulterado = `${token.slice(0, -2)}xx`;
    const res = await enviar("/api/pedidos", pedidoValido, adulterado);
    expect(res.status).toBe(401);
  });

  it("con un token firmado con otro secreto responde 401", async () => {
    const ajena = new TextEncoder().encode("otro-secreto-que-no-es-el-de-la-api-123");
    const token = await firmarToken(usuarioDemo, ajena);
    const res = await enviar("/api/pedidos", pedidoValido, token);
    expect(res.status).toBe(401);
  });

  it("con un token vencido responde 401", async () => {
    const haceUnRato = Math.floor(Date.now() / 1000) - DURACION_SEGUNDOS - 60;
    const token = await firmarToken(usuarioDemo, clave, haceUnRato);
    const res = await enviar("/api/pedidos", pedidoValido, token);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: "Tu sesión no es válida o expiró. Volvé a ingresar.",
    });
  });

  it("con sesión crea el pedido y calcula el total con los precios del servidor", async () => {
    const token = await iniciarSesion();
    // El cliente intenta mandar un precio propio: se ignora.
    const res = await enviar(
      "/api/pedidos",
      { lineas: [{ productoId: "yerba-1kg", cantidad: 2, precio: 1 }] },
      token,
    );
    expect(res.status).toBe(201);
    const pedido = (await res.json()) as Pedido;
    expect(pedido.total).toBe(64000);
    expect(pedido.lineas[0]).toMatchObject({ nombre: "Yerba mate 1 kg", precio: 32000 });
  });

  it.each([
    ["sin líneas", { lineas: [] }],
    ["cantidad cero", { lineas: [{ productoId: "yerba-1kg", cantidad: 0 }] }],
    ["cantidad con decimales", { lineas: [{ productoId: "yerba-1kg", cantidad: 1.5 }] }],
    ["producto inexistente", { lineas: [{ productoId: "no-existe", cantidad: 1 }] }],
    ["sin stock", { lineas: [{ productoId: "camisa-aopoi", cantidad: 1 }] }],
  ])("con %s responde 400", async (_caso, cuerpo) => {
    const token = await iniciarSesion();
    const res = await enviar("/api/pedidos", cuerpo, token);
    expect(res.status).toBe(400);
  });
});
