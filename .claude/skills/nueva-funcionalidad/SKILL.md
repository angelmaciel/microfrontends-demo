---
name: nueva-funcionalidad
description: Flujo para construir una fase del plan o una funcionalidad de punta a punta en la demo de microfrontends (contrato, API, remote, host, pruebas). Usar al empezar una fase de docs/plan.md o cualquier cambio que cruce más de un workspace.
---

# Construir una funcionalidad de punta a punta

## 1. Plan primero

- Releer `CLAUDE.md`, `docs/plan.md` (la fase que sigue y su sección "qué hay que resolver") y
  `docs/decisiones.md`.
- Escribir un plan corto: qué cambia en `packages/contratos`, en la API, en cada remote y en el
  host, y qué pruebas se agregan. Mostrarlo y esperar aprobación.
- Si hay una decisión abierta: una pregunta por vez, con opciones y recomendación. Registrar lo
  decidido como `D-NN` en `docs/decisiones.md`.

## 2. Contrato (`packages/contratos`)

- Tipos y acciones que cruzan fronteras entre microfrontends. Nada de lógica con efectos.
- Si cambia un tipo existente, revisar todos los consumidores antes de seguir.

## 3. API (`apps/api`)

- Entrada validada con Zod. Rutas protegidas verifican el JWT con `jose`.
- Pruebas con `app.request()` (sin levantar el servidor): caso feliz, validación y 401/403.

## 4. Microfrontends

- Remote: el componente expuesto va aparte de `App.tsx` (standalone). Estados de carga, error y
  vacío visibles.
- Host: `lazy` + `Suspense` + `ErrorBoundary` por remote.
- Dependencias nuevas que tengan estado global o contexto → `shared` singleton en las tres apps.
- Primero celular, accesible, colores del tema compartido.

## 5. Pruebas

- Vitest + Testing Library por componente, consultando por rol y texto.
- Playwright (desde la fase 4) para el flujo del sistema compuesto.

## 6. Cerrar

- Skill `verificar`. Actualizar el Estado en `docs/plan.md`. Commit citando el `D-NN`.
- Anotar en `docs/plan.md` cualquier dato que sirva para la entrevista (medidas, problemas
  encontrados y cómo se resolvieron).
