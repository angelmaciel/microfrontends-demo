import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorApi, pedirApi } from "./cliente";

const BASE = "http://api.prueba/api";

const responder = (estado: number, cuerpo: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { "Content-Type": "application/json" },
    }),
  );

describe("pedirApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devuelve el JSON de una respuesta exitosa", async () => {
    vi.stubGlobal("fetch", responder(200, [{ id: "a" }]));
    await expect(pedirApi("/productos", { base: BASE })).resolves.toEqual([{ id: "a" }]);
  });

  it("envía el token como Authorization: Bearer y el cuerpo como JSON", async () => {
    const fetchFalso = responder(201, { id: "p-1" });
    vi.stubGlobal("fetch", fetchFalso);

    await pedirApi("/pedidos", { base: BASE, metodo: "POST", cuerpo: { a: 1 }, token: "tkn" });

    expect(fetchFalso).toHaveBeenCalledWith(
      `${BASE}/pedidos`,
      expect.objectContaining({
        method: "POST",
        body: '{"a":1}',
        headers: { "Content-Type": "application/json", Authorization: "Bearer tkn" },
      }),
    );
  });

  it("sin token no manda el header Authorization", async () => {
    const fetchFalso = responder(200, []);
    vi.stubGlobal("fetch", fetchFalso);
    await pedirApi("/productos", { base: BASE });
    expect(fetchFalso.mock.calls[0]?.[1]?.headers).not.toHaveProperty("Authorization");
  });

  it("un 401 se convierte en ErrorApi no autorizado con el mensaje de la API", async () => {
    vi.stubGlobal("fetch", responder(401, { error: "Tu sesión expiró." }));
    const error = await pedirApi("/pedidos", { base: BASE }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({
      estado: 401,
      message: "Tu sesión expiró.",
      esNoAutorizado: true,
    });
  });

  it("si la respuesta de error no es JSON usa un mensaje genérico", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", { status: 502 })));
    await expect(pedirApi("/productos", { base: BASE })).rejects.toMatchObject({
      estado: 502,
      message: "Ocurrió un error inesperado.",
    });
  });

  it("si no hay conexión devuelve un ErrorApi con estado 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(pedirApi("/productos", { base: BASE })).rejects.toMatchObject({
      estado: 0,
      esNoAutorizado: false,
    });
  });
});
