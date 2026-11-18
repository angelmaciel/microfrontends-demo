# Microfrontends demo — tienda

Tienda mínima dividida en **microfrontends React** que se despliegan por separado y se componen en
el navegador con **Module Federation**. Incluye estado compartido con **Redux Toolkit**,
autenticación con **JWT**, **Material UI** como sistema de diseño común y pruebas con **Vitest +
Testing Library**.

> En construcción. El estado de cada fase está en [docs/plan.md](docs/plan.md) y las decisiones de
> arquitectura, con su porqué, en [docs/decisiones.md](docs/decisiones.md).

## Arquitectura

| App                  | Puerto | Responsabilidad                                         |
| -------------------- | ------ | ------------------------------------------------------- |
| `apps/host`          | 5000   | Shell: layout, rutas, sesión y store; carga los remotes |
| `apps/catalogo`      | 5001   | Lista de productos y "agregar al carrito"               |
| `apps/carrito`       | 5002   | Carrito, contador del encabezado y confirmación         |
| `apps/api`           | 4000   | Login con JWT, productos y pedidos protegidos           |
| `packages/contratos` | —      | Tipos, utilidades y tema compartidos                    |

## Cómo correrlo

Requiere Node 24.22.1 o superior.

```bash
npm ci
npm run dev
```

Abrir http://localhost:5000. Cada microfrontend también corre solo, por ejemplo
`npm run dev -w @demo/catalogo` → http://localhost:5001.

## Calidad

```bash
npm run verificar
```

Corre lint, tipos, formato y pruebas. Lo mismo corre en GitHub Actions en cada push, junto con el
escaneo de secretos y la auditoría de dependencias.
