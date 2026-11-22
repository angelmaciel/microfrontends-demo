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

## D-07 · Tipos de los remotes declarados a mano en el host — aprobada (18/11)

- **Decisión:** `apps/host/src/remotes.d.ts` declara cada módulo expuesto
  (`declare module "catalogo/Catalogo"`). El plugin corre con `dts: false`.
- **Por qué:** es simple, y el typecheck y el CI del host no dependen de que los remotes estén
  levantados ni de descargar archivos de tipos por la red.
- **Riesgo asumido:** si un remote cambia sus props, el compilador del host no lo detecta. Se
  mitiga tipando las props con tipos de `@demo/contratos`.
- **Descartado:** `@mf-types` generados por el plugin (tipos siempre sincronizados, pero suman un
  paso de red al typecheck y más piezas que mantener).

## D-08 · Datos en memoria y usuario de demo con scrypt — aprobada (20/11)

- **Decisión:** la API guarda productos y usuarios en memoria (`apps/api/src/datos.ts`). Hay un
  usuario de demo con la contraseña hasheada con `scrypt` de Node y comparada en tiempo constante.
  El secreto del JWT se lee de `JWT_SECRETO` (mínimo 32 caracteres) y el servidor no arranca sin él.
- **Por qué:** la demo es sobre el frontend; una base de datos suma infraestructura sin cambiar lo
  que se muestra. `scrypt` viene con Node, así que no agrega dependencias.
- **Consecuencias:** los pedidos no se guardan y se pierden al reiniciar. El total se calcula en el
  servidor con sus propios precios; nunca se confía en el precio que manda el cliente.
- **Descartado:** SQLite/Prisma (más piezas para desplegar) y `bcrypt` (dependencia nativa).

## D-09 · El host le pasa callbacks tipados a los remotes — aprobada (21/11)

- **Decisión:** cuando un remote necesita algo que es del host (por ejemplo, navegar al login), lo
  pide con una prop. El tipo de esas props vive en `@demo/contratos` (`PropsCarrito`) y
  `remotes.d.ts` lo usa; `RemoteSeguro` es genérico y exige que las props coincidan.
- **Por qué:** el remote no depende de React Router ni de cómo el host arma sus rutas. Si el equipo
  del carrito cambia sus props, el host deja de compilar en lugar de fallar en producción.
- **Descartado:** compartir `react-router` como singleton para que el remote navegue solo (acopla
  el remote a las rutas del host) y eventos del navegador (`CustomEvent`), que no tienen tipos.
