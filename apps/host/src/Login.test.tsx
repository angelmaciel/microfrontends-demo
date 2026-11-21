import { cerrarSesion, iniciarSesion } from "@demo/contratos/sesion";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { crearStore } from "./store";
import { renderHost } from "./pruebas/renderHost";

vi.mock("catalogo/Catalogo", () => ({ default: () => <h1>Catálogo</h1> }));
vi.mock("carrito/MiniCarrito", () => ({ default: () => <span>Carrito</span> }));

const login = {
  token: "un.token.jwt",
  usuario: { email: "demo@tienda.com", nombre: "Cliente Demo" },
};

const responder = (estado: number, cuerpo: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { "Content-Type": "application/json" },
    }),
  );

const completarYEnviar = async (email: string, contrasena: string) => {
  await userEvent.type(screen.getByLabelText(/Email/), email);
  await userEvent.type(screen.getByLabelText(/Contraseña/), contrasena);
  await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));
};

describe("login", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("con credenciales correctas guarda la sesión, vuelve a la portada y saluda", async () => {
    const fetchFalso = responder(200, login);
    vi.stubGlobal("fetch", fetchFalso);
    const store = renderHost("/login");

    await completarYEnviar("demo@tienda.com", "demo1234");

    expect(await screen.findByRole("heading", { name: "Catálogo" })).toBeInTheDocument();
    expect(screen.getByText("Hola, Cliente Demo")).toBeInTheDocument();
    expect(store.getState().sesion.token).toBe("un.token.jwt");
    expect(fetchFalso).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "demo@tienda.com", password: "demo1234" }),
      }),
    );
  });

  it("no guarda el token en localStorage", async () => {
    vi.stubGlobal("fetch", responder(200, login));
    renderHost("/login");
    await completarYEnviar("demo@tienda.com", "demo1234");
    await screen.findByText("Hola, Cliente Demo");
    expect(JSON.stringify({ ...localStorage })).not.toContain("un.token.jwt");
  });

  it("con credenciales incorrectas muestra el error de la API y no inicia sesión", async () => {
    vi.stubGlobal("fetch", responder(401, { error: "Email o contraseña incorrectos" }));
    const store = renderHost("/login");

    await completarYEnviar("demo@tienda.com", "mala");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email o contraseña incorrectos");
    expect(store.getState().sesion.token).toBeNull();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  });

  it("si la API no responde avisa que no pudo conectarse", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    renderHost("/login");

    await completarYEnviar("demo@tienda.com", "demo1234");

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectarnos");
  });

  it("si la sesión expiró lo explica en la pantalla de login", () => {
    const store = crearStore();
    store.dispatch(iniciarSesion(login));
    store.dispatch(cerrarSesion({ motivo: "expirada" }));
    renderHost("/login", store);

    expect(screen.getByRole("alert")).toHaveTextContent("Tu sesión expiró");
  });

  it("Salir cierra la sesión y vuelve a mostrar Ingresar", async () => {
    const store = crearStore();
    store.dispatch(iniciarSesion(login));
    renderHost("/", store);

    await userEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
    expect(store.getState().sesion.token).toBeNull();
  });

  it("con la sesión iniciada, /login redirige a la portada", async () => {
    const store = crearStore();
    store.dispatch(iniciarSesion(login));
    renderHost("/login", store);

    expect(await screen.findByRole("heading", { name: "Catálogo" })).toBeInTheDocument();
  });
});
