import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RespuestaLogin, Usuario } from "./index";

// Slice de sesión compartido (D-03): el host crea el store con este reducer y cualquier
// microfrontend puede leer la sesión o despachar `cerrarSesion` (por ejemplo, ante un 401)
// sin importar código del host. El token vive solo en memoria, nunca en localStorage (D-04).

export interface EstadoSesion {
  token: string | null;
  usuario: Usuario | null;
  /** Por qué se cerró la última sesión; el login lo usa para avisar "tu sesión expiró". */
  motivoCierre: "expirada" | null;
}

const inicial: EstadoSesion = { token: null, usuario: null, motivoCierre: null };

const sesion = createSlice({
  name: "sesion",
  initialState: inicial,
  reducers: {
    iniciarSesion: (_estado, accion: PayloadAction<RespuestaLogin>) => ({
      token: accion.payload.token,
      usuario: accion.payload.usuario,
      motivoCierre: null,
    }),
    cerrarSesion: (_estado, accion: PayloadAction<{ motivo: "expirada" } | undefined>) => ({
      ...inicial,
      motivoCierre: accion.payload?.motivo ?? null,
    }),
  },
});

export const { iniciarSesion, cerrarSesion } = sesion.actions;
export const sesionReducer = sesion.reducer;

/** Selector tipado: sirve para cualquier store que monte el slice bajo la clave `sesion`. */
export const seleccionarSesion = (estado: { sesion: EstadoSesion }) => estado.sesion;
