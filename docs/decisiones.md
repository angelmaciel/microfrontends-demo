# Decisiones

Formato: contexto, decisión, por qué y alternativa descartada.

## D-01 · Module Federation con `@module-federation/vite` — aprobada (18/11)

- **Decisión:** usar el plugin oficial de Module Federation 2.0 para Vite (1.23.x), con Vite 8.
- **Por qué:** es el estándar de la industria para microfrontends en runtime, funciona en modo
  desarrollo (no obliga a compilar los remotes para probar) y tiene runtime con manejo de errores.
- **Descartado:** `@originjs/vite-plugin-federation` (sin cambios desde enero y exige compilar los
  remotes), single-spa (más configuración y menos usado con React moderno), iframes (aislamiento
  total pero mala experiencia y comunicación incómoda).

## D-02 · Monorepo con npm workspaces, despliegue independiente — aprobada (18/11)

- **Decisión:** un repo con `apps/host`, `apps/catalogo`, `apps/carrito`, `apps/api` y
  `packages/contratos`. Cada app se compila y despliega por separado.
- **Por qué:** para una demo es más fácil de revisar y ya lo usé en ClotheStore. La independencia
  se demuestra en el despliegue, no en la cantidad de repos.
- **Descartado:** un repo por microfrontend (más realista en empresas grandes, pero triplica el CI
  y complica mostrarlo).

## D-03 · Redux Toolkit con el store en el host — aprobada (18/11)

- **Decisión:** el host crea el store (slices `sesion` y `carrito`) y lo provee. `react-redux` y
  `@reduxjs/toolkit` se comparten como singleton, así los remotes usan `useSelector`/`useDispatch`
  del mismo store. Las acciones y tipos viven en `packages/contratos`.
- **Por qué:** el puesto pide Redux; en ClotheStore usé Zustand, así que muestro las dos.
  Centralizar el store en el host evita que dos remotes tengan copias distintas del carrito.
- **Riesgo asumido:** acopla los remotes al contrato del store. Se mitiga con el contrato tipado
  y versionado. Alternativa para explicar: eventos del navegador (`CustomEvent`) si los equipos
  necesitaran independencia total.

## D-04 · JWT con access token en memoria — aprobada (18/11)

- **Decisión:** la API (Hono + `jose`, HS256, 15 min) emite el token; el host lo guarda en el
  store (memoria, no `localStorage`) y lo envía en `Authorization: Bearer`. Un 401 cierra la
  sesión y lleva al login.
- **Por qué:** memoria evita robo por XSS persistente. Es la misma idea que en ClotheStore, más
  simple para que entre en el plazo.
- **Fuera de alcance:** refresh token rotativo en cookie httpOnly (ya lo hice en ClotheStore;
  lo menciono como mejora).

## D-05 · Material UI como sistema de diseño compartido — aprobada (18/11)

- **Decisión:** MUI 9 con un tema único definido en `packages/contratos`; `@mui/material` y
  `@emotion/*` como singleton.
- **Por qué:** es deseable en el puesto y ya lo uso en Joyería. Un tema compartido muestra cómo
  se mantiene la coherencia visual entre equipos.

## D-06 · Versiones exactas y con al menos 14 días publicadas — aprobada (18/11)

- **Decisión:** versiones exactas (sin `^`) y con al menos 14 días publicadas. Excepción: parches de seguridad.
- **Por qué:** mismo criterio de seguridad que en CalzApp (auditoría de CVE por versión).
