import { scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { Usuario } from "@demo/contratos";

const ALGORITMO = "HS256";
/** Vida corta: si el token se filtra, sirve poco tiempo (D-04). */
export const DURACION_SEGUNDOS = 15 * 60;

/** Compara la contraseña con el hash `sal:hash` guardado. */
export function contrasenaValida(contrasena: string, guardado: string): boolean {
  const [sal, hash] = guardado.split(":");
  if (!sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64url");
  const calculado = scryptSync(contrasena, sal, esperado.length);
  // Comparación en tiempo constante: no revela por timing cuántos bytes coinciden.
  return timingSafeEqual(calculado, esperado);
}

export interface DatosToken extends Usuario {
  id: string;
}

/** `ahora` (en segundos) se puede fijar en las pruebas para fabricar tokens vencidos. */
export async function firmarToken(
  datos: DatosToken,
  clave: Uint8Array,
  ahora = Math.floor(Date.now() / 1000),
): Promise<string> {
  return new SignJWT({ email: datos.email, nombre: datos.nombre })
    .setProtectedHeader({ alg: ALGORITMO })
    .setSubject(datos.id)
    .setIssuedAt(ahora)
    .setExpirationTime(ahora + DURACION_SEGUNDOS)
    .sign(clave);
}

/** Devuelve los datos del token o `null` si falta, está adulterado o venció. */
export async function verificarToken(token: string, clave: Uint8Array): Promise<DatosToken | null> {
  try {
    // Se fija el algoritmo: evita que un token con "alg: none" u otro algoritmo pase la verificación.
    const { payload } = await jwtVerify(token, clave, { algorithms: [ALGORITMO] });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.nombre !== "string"
    ) {
      return null;
    }
    return { id: payload.sub, email: payload.email, nombre: payload.nombre };
  } catch {
    return null;
  }
}
