import { describe, expect, it } from "vitest";
import { cerrarSesion, iniciarSesion, sesionReducer } from "./sesion";

const login = {
  token: "un.token.jwt",
  usuario: { email: "demo@tienda.com", nombre: "Cliente Demo" },
};

describe("slice sesion", () => {
  it("arranca sin sesión", () => {
    expect(sesionReducer(undefined, { type: "@@INIT" })).toEqual({
      token: null,
      usuario: null,
      motivoCierre: null,
    });
  });

  it("iniciarSesion guarda el token y el usuario", () => {
    const estado = sesionReducer(undefined, iniciarSesion(login));
    expect(estado).toEqual({ ...login, motivoCierre: null });
  });

  it("cerrarSesion borra el token", () => {
    const conSesion = sesionReducer(undefined, iniciarSesion(login));
    expect(sesionReducer(conSesion, cerrarSesion())).toEqual({
      token: null,
      usuario: null,
      motivoCierre: null,
    });
  });

  it("cerrarSesion por un 401 recuerda que expiró, y el próximo login lo limpia", () => {
    const conSesion = sesionReducer(undefined, iniciarSesion(login));
    const expirada = sesionReducer(conSesion, cerrarSesion({ motivo: "expirada" }));
    expect(expirada.token).toBeNull();
    expect(expirada.motivoCierre).toBe("expirada");

    expect(sesionReducer(expirada, iniciarSesion(login)).motivoCierre).toBeNull();
  });
});
