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
| 1    | jue 19 | host + catalogo + carrito federados, React compartido como singleton, fallback si un remote no carga | Se ve el catálogo dentro del host y el host sobrevive si apago un remote | ⏭️ siguiente |
| 2    | jue 19 | API Hono + login JWT + ruta protegida + 401 → cerrar sesión                                          | Pruebas de API y del flujo de login                                      | pendiente    |
| 3    | vie 20 | Store Redux compartido: agregar en catalogo, ver en carrito y en el contador                         | Prueba E2E del flujo completo                                            | pendiente    |
| 4    | sáb 21 | Más pruebas de componentes, Playwright E2E del sistema compuesto y su job en CI                      | CI en verde                                                              | pendiente    |
| 5    | dom 22 | Deploy (cada app por separado), README con diagrama y guion de la entrevista                         | URL pública funcionando                                                  | pendiente    |

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

### Dato medido en la fase 0 (sirve para la entrevista)

Sin federar, cada app compila su propia copia de React y MUI: **~319 kB cada una (~103 kB gzip)**.
Al compartirlas como singleton en la fase 1, el navegador las descarga una sola vez. Medir de nuevo
al cerrar la fase 1 y anotar la diferencia.

## Qué voy a poder explicar en la entrevista

1. Por qué microfrontends y **cuándo no** conviene usarlos.
2. Cómo se integran en runtime (Module Federation) frente a hacerlo en build (paquetes npm).
3. Dependencias compartidas: React y react-redux como singleton y qué pasa si las versiones chocan.
4. Comunicación entre microfrontends: store compartido frente a eventos, y el contrato tipado.
5. Resiliencia: si un remote se cae, el resto de la app sigue andando.
6. Autenticación con JWT: dónde vive el token, cómo viaja y qué pasa con un 401.
7. Pruebas en cada nivel: unidad, componente y E2E del sistema compuesto.
