# Microfrontends demo

Tienda mínima dividida en microfrontends React que se componen en el navegador con Module
Federation. Es una demo para la entrevista de Frontend Developer (React y microfrontends) del
**lunes 23/11/2026**: tiene que estar terminada, publicada y ser fácil de explicar.

**Al empezar una sesión, leer [docs/plan.md](docs/plan.md)** (fases, estado y qué resolver en la
fase que sigue) y [docs/decisiones.md](docs/decisiones.md). Al cerrar una fase, actualizar la
columna Estado de `docs/plan.md`.

## Cómo trabajamos

- **Plan antes de código.** Ante algo ambiguo: una pregunta por vez, con opciones y recomendación.
- **Una fase / un vertical a la vez**, cada una cierra con commit y `npm run verificar` en verde.
- **El usuario maneja los servidores de desarrollo.** No levantar `npm run dev` sin pedirlo; para
  verificar usar la skill `verificar`.
- **Nunca mostrar secretos.** El `.env` se lee en silencio; nada de valores en logs, errores ni chat.
- Las decisiones se registran en [docs/decisiones.md](docs/decisiones.md) como `D-NN` y se citan en
  los commits.
- Dependencias: versión exacta y con al menos 14 días publicada (D-06). Excepción: parches de
  seguridad. `npm audit` tiene que dar 0.
- Mensajes de commit en español, sin trailer `Co-Authored-By` ni pie "Generated with Claude Code".
- Lo que se construye tiene que poder explicarlo el usuario en la entrevista: preferir código claro
  a código ingenioso, y comentar el _por qué_ de cada decisión de arquitectura.

## Comandos (desde la raíz)

| Comando                         | Qué hace                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                   | levanta api :4000, host :5000, catalogo :5001, carrito :5002 |
| `npm run dev -w @demo/catalogo` | un solo microfrontend en modo standalone                     |
| `npm run verificar`             | lint + tipos + formato + pruebas (antes de cada commit)      |
| `npm run build`                 | build de producción de cada app                              |
| `npm test -- --project host`    | pruebas de un solo workspace                                 |
| `npm run test:cov`              | pruebas con cobertura                                        |

## Estructura

```
apps/
  host/        shell: layout MUI, React Router, login, store Redux; carga los remotes (:5000)
  catalogo/    microfrontend del catálogo (:5001)
  carrito/     microfrontend del carrito y el pedido (:5002)
  api/         Hono + jose: /api/auth/login, /api/productos, /api/pedidos (:4000)
packages/
  contratos/   tipos de dominio, utilidades puras y tema MUI compartidos (el contrato entre equipos)
docs/          plan y decisiones
```

## Stack

React 19.3 · TypeScript 6 estricto · Vite 8 · `@module-federation/vite` 1.23 · Redux Toolkit 2 +
react-redux 9 · React Router 8 · Material UI 9 · Hono 4 + `jose` · Zod 4 · Vitest 5 + Testing
Library · Playwright (fase 4) · GitHub Actions · npm workspaces · Node 24.

## Reglas de código

- **Fronteras entre microfrontends:** un remote nunca importa código de otro remote ni del host.
  Lo compartido va a `packages/contratos`; lo que se consume en runtime, por Module Federation.
- **Dependencias compartidas:** todo lo que guarda estado global o contexto de React (`react`,
  `react-dom`, `react-redux`, `@reduxjs/toolkit`, `@mui/material`, `@emotion/*`) se declara
  `singleton` en `shared` y con la misma versión en cada app.
- **Cada remote corre solo:** su `App.tsx` es el modo standalone; lo que expone va en un componente
  aparte que no depende de `main.tsx`.
- **Resiliencia:** el host carga cada remote con `lazy` + `Suspense` + `ErrorBoundary`. Si un remote
  falla, el resto de la página sigue andando.
- **Estado (D-03):** el store vive en el host; los remotes usan `useSelector`/`useDispatch` con las
  acciones y tipos de `@demo/contratos`.
- **Auth (D-04):** el token vive en memoria (store), nunca en `localStorage`. Viaja como
  `Authorization: Bearer`. Un 401 cierra la sesión.
- **API:** toda entrada se valida con Zod. Errores con mensajes en español y sin detalles internos.
- **Dinero:** enteros en guaraníes; mostrar con `formatearPrecio` de `@demo/contratos`.
- **UI:** primero celular, accesible (roles, labels, foco visible). Colores y formas solo desde el
  tema de `@demo/contratos/tema`.
- **Pruebas:** Testing Library consultando por rol y texto visible, como lo usaría una persona;
  nada de `data-testid` salvo que no haya alternativa.
- **Nombres:** dominio y textos de UI en español; términos del framework en inglés.
- Comentarios solo para explicar el _por qué_.
