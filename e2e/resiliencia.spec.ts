import { expect, test } from "@playwright/test";

// Simula que el remote del carrito está caído: se cortan todas las peticiones a su origen.
// No hace falta apagar el servidor, y la prueba es repetible.
test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:5002/**", (ruta) => ruta.abort("connectionrefused"));
});

test("si el carrito no carga, el catálogo sigue andando y el encabezado avisa", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Catálogo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Agregar .* al carrito$/ }).first()).toBeEnabled();
  await expect(page.getByRole("alert")).toHaveText("el carrito no disponible");
});

test("la página del carrito muestra el aviso con Reintentar", async ({ page }) => {
  await page.goto("/carrito");

  const aviso = page.getByRole("alert").filter({ hasText: "No pudimos cargar el carrito" });
  await expect(aviso).toBeVisible();
  await expect(aviso.getByRole("button", { name: "Reintentar" })).toBeVisible();
});

test("si la API está caída, el catálogo ofrece reintentar", async ({ page }) => {
  await page.route("http://localhost:4000/**", (ruta) => ruta.abort("connectionrefused"));
  await page.goto("/");

  await expect(page.getByRole("alert").filter({ hasText: "No pudimos conectarnos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
});
