import { expect, test } from "@playwright/test";

// El flujo que justifica la arquitectura: tres microfrontends, servidos desde puertos distintos,
// comparten un store y hablan con la API real.
test("agregar en el catálogo, ver el contador, ingresar y confirmar el pedido", async ({
  page,
}) => {
  await page.goto("/");

  // catálogo (remote :5001) → store del host
  const agregarYerba = page.getByRole("button", { name: "Agregar Yerba mate 1 kg al carrito" });
  await agregarYerba.click();
  await agregarYerba.click();

  // contador (remote :5002) lee el mismo store
  const contador = page.getByRole("link", { name: /Carrito \(2 productos\)/ });
  await expect(contador).toBeVisible();

  // navegación del host hacia otro remote
  await contador.click();
  await expect(page.getByRole("heading", { level: 1, name: "Carrito" })).toBeVisible();
  await expect(page.getByLabel("Cantidad de Yerba mate 1 kg")).toHaveText("2");

  // sin sesión, el carrito le pide al host ir al login (irALogin, D-09)
  await page.getByRole("button", { name: "Ingresá para confirmar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel(/Email/).fill("demo@tienda.com");
  await page.getByLabel(/Contraseña/).fill("demo1234");
  await page.getByRole("button", { name: "Ingresar" }).click();

  // vuelve al carrito con los productos intactos y confirma contra la API
  await expect(page).toHaveURL(/\/carrito$/);
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page.getByRole("alert")).toContainText("Pedido confirmado");
  await expect(page.getByRole("alert")).toContainText("Gs.");
  await expect(page.getByRole("link", { name: /Carrito \(0 productos\)/ })).toBeVisible();
});

test("con una contraseña incorrecta no inicia sesión", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/Email/).fill("demo@tienda.com");
  await page.getByLabel(/Contraseña/).fill("incorrecta");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByRole("alert")).toHaveText("Email o contraseña incorrectos");
  await expect(page.getByRole("link", { name: "Ingresar" })).toBeVisible();
});
