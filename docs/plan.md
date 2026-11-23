# Plan — Demo de microfrontends (tienda)

Objetivo: mostrar, en una demo chica pero completa, cómo diseño e implemento una arquitectura de
microfrontends con React, con el mismo método de trabajo que en mis otros proyectos (plan,
decisiones registradas, pruebas y CI como puerta de entrada).

Fecha límite: lunes 23/11/2026.

## Qué se construye

Una tienda mínima dividida en tres aplicaciones React que se despliegan por separado y se componen
en el navegador con **Module Federation**, más una API chica que emite JWT.

```
                        ┌────────────────────────────────────────┐
  navegador ──────────▶ │ host (shell) :5000                     │
                        │  layout MUI · React Router · login     │
                        │  store Redux (sesión + carrito)        │
                        │  ErrorBoundary + Suspense por remote   │
                        └──────┬───────────────────┬─────────────┘
              carga en runtime │                   │ carga en runtime
                ┌──────────────▼──────┐   ┌────────▼─────────────┐
                │ catalogo :5001      │   │ carrito :5002        │
                │ expone ./Catalogo   │   │ expone ./Carrito     │
                │                     │   │        ./MiniCarrito │
                └──────────┬──────────┘   └────────┬─────────────┘
                           │ REST + JWT            │ REST + JWT
                        ┌──▼───────────────────────▼──┐
                        │ api (Hono) :4000            │
                        │ /auth/login · /productos    │
                        │ /pedidos (protegido)        │
                        └─────────────────────────────┘
```

- **host**: arma la página, maneja rutas, sesión y el store. No conoce el código de los remotes:
  solo sabe la URL de su `remoteEntry`.
- **catalogo**: lista productos (con estados de carga, error y vacío) y agrega al carrito.
- **carrito**: muestra el carrito, el contador del encabezado y confirma el pedido (requiere sesión).
- **packages/contratos**: tipos y acciones compartidas (el "contrato" entre equipos).
- **api**: login con JWT (`jose`), productos públicos y pedidos protegidos.

Cada remote **también corre solo** (modo standalone) para que su equipo lo desarrolle y lo pruebe
sin levantar el host.

## Fases (una vertical a la vez, cada una cierra con pruebas en verde)

| Fase | Día    | Contenido                                                                                            | Cierra cuando                                                            | Estado       |
| ---- | ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| 0    | mié 18 | Monorepo (npm workspaces), TS estricto, ESLint, Vitest, CI de calidad y seguridad, docs              | `npm run verificar` en verde                                             | ✅ hecha     |
| 1    | jue 19 | host + catalogo + carrito federados, React compartido como singleton, fallback si un remote no carga | Se ve el catálogo dentro del host y el host sobrevive si apago un remote | ✅ hecha     |
| 2    | jue 19 | API Hono + login JWT + ruta protegida + 401 → cerrar sesión; catálogo con productos reales           | Pruebas de API y del flujo de login                                      | ✅ hecha     |
| 3    | vie 20 | Store Redux compartido: agregar en catalogo, ver en carrito y en el contador                         | Prueba E2E del flujo completo                                            | ✅ hecha     |
| 4    | sáb 21 | Más pruebas de componentes, Playwright E2E del sistema compuesto y su job en CI                      | CI en verde                                                              | ✅ hecha     |
| 5    | dom 22 | Deploy (cada app por separado), README con diagrama y guion de la entrevista                         | URL pública funcionando                                                  | ⏭️ siguiente |

### Fase 1 — qué hay que resolver al empezar

- Configurar `@module-federation/vite` en las tres apps: `catalogo` expone `./Catalogo`, `carrito`
  expone `./Carrito` y `./MiniCarrito`, y el host los declara como `remotes`.
- `shared` como singleton: `react`, `react-dom`, `@mui/material`, `@emotion/react`,
  `@emotion/styled`, `react-redux`, `@reduxjs/toolkit`.
- En el host: `React.lazy` + `Suspense` + un `ErrorBoundary` por remote, con un mensaje amable
  si el remote no carga.
- Tipos de los remotes: declarar los módulos (`declare module "catalogo/Catalogo"`) o usar los
  tipos que genera el plugin (`@mf-types`). Decidir y registrar como D-07.
- Separar en cada remote el componente expuesto (`Catalogo.tsx`) de su `App.tsx` standalone.

### Fase 3 — qué hay que resolver al empezar

- Slice `carrito` en `@demo/contratos` (agregar, quitar, cambiar cantidad, vaciar), montado en el
  store del host junto a `sesion`.
- Catálogo: botón "Agregar al carrito" que despacha la acción del contrato; deshabilitado sin stock.
- MiniCarrito y Carrito leen el store con `useSelector`; el contador refleja lo que se agrega.
- Confirmar pedido: `POST /api/pedidos` con el token. Sin sesión, mandar al login; ante un 401,
  despachar `cerrarSesion({ motivo: "expirada" })`.
- Cada remote en modo standalone necesita su propio store mínimo con los mismos slices.
- Ticket #3: el encabezado no se recupera cuando el carrito vuelve (evaluar si entra).

### Fase 4 — qué hay que resolver al empezar

- Playwright con el sistema compuesto levantado (api, host y los dos remotes en modo preview).
- E2E del flujo completo: agregar en el catálogo → el contador sube → carrito → ingresar →
  confirmar el pedido → el carrito queda vacío.
- E2E de resiliencia: con el carrito apagado, el catálogo sigue andando.
- Job de CI que construye las apps, las levanta y corre Playwright.
- Ticket #3: el encabezado no se recupera cuando el carrito vuelve.
- Proteger `main` en GitHub: PR obligatorio y checks del CI en verde.

### Fase 5 — qué hay que resolver al empezar

- Dónde se despliega cada pieza: los tres frontends como sitios estáticos independientes y la API
  como servicio Node. Registrar la elección como decisión.
- URLs de producción: `REMOTE_CATALOGO_URL` y `REMOTE_CARRITO_URL` al compilar el host,
  `VITE_API_URL` en las tres apps y los orígenes de CORS de la API por variable de entorno.
- `JWT_SECRETO` como secreto del servicio, nunca en el repo.
- Si el plan gratuito duerme la API, avisarlo en la UI o despertarla antes de la entrevista.
- README con el diagrama, el link público y el guion de la entrevista.

### Dato medido en la fase 0 (sirve para la entrevista)

Sin federar, cada app compila su propia copia de React y MUI: **~319 kB cada una (~103 kB gzip)**.
Al compartirlas como singleton en la fase 1, el navegador las descarga una sola vez. Medir de nuevo
al cerrar la fase 1 y anotar la diferencia.

### Dato medido en la fase 1

Con `shared` singleton, lo propio que descarga cada remote al montarse en el host es su
`remoteEntry.js` (~7 kB gzip) más el chunk expuesto (<0,5 kB gzip): **~8 kB por remote**, contra
~103 kB gzip de la fase 0. React y MUI llegan una sola vez, desde el host. Costo: un paquete
compartido no se puede achicar con tree-shaking, porque cualquier remote podría usar cualquier
componente. `@mui/material` entero pesa ~142 kB gzip.

## Qué voy a poder explicar en la entrevista

1. Por qué microfrontends y **cuándo no** conviene usarlos.
2. Cómo se integran en runtime (Module Federation) frente a hacerlo en build (paquetes npm).
3. Dependencias compartidas: React y react-redux como singleton y qué pasa si las versiones chocan.
4. Comunicación entre microfrontends: store compartido frente a eventos, y el contrato tipado.
5. Resiliencia: si un remote se cae, el resto de la app sigue andando.
6. Autenticación con JWT: dónde vive el token, cómo viaja y qué pasa con un 401.
7. Pruebas en cada nivel: unidad, componente y E2E del sistema compuesto.
