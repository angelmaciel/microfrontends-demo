import type { PropsCarrito } from "@demo/contratos";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderHost } from "./pruebas/renderHost";

// En las pruebas no hay remotes levantados: se reemplazan los módulos federados por dobles.
// Así se prueba la composición del host sin depender de la red.
vi.mock("catalogo/Catalogo", () => ({ default: () => <h1>Catálogo</h1> }));
// El doble del carrito usa la prop del contrato, como lo haría el remote real.
vi.mock("carrito/Carrito", () => ({
  default: ({ irALogin }: PropsCarrito) => (
    <>
      <h1>Carrito</h1>
      <button onClick={irALogin}>Ingresá para confirmar</button>
    </>
  ),
}));
vi.mock("carrito/MiniCarrito", () => ({ default: () => <span>Carrito (0 productos)</span> }));

describe("host", () => {
  it("en la portada compone el catálogo y el contador del carrito", async () => {
    renderHost("/");
    expect(await screen.findByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Carrito (0 productos)" })).toHaveAttribute(
      "href",
      "/carrito",
    );
  });

  it("navegar con el link del encabezado cambia de microfrontend", async () => {
    renderHost("/");
    await screen.findByRole("heading", { level: 1, name: "Catálogo" });

    await userEvent.click(screen.getByRole("link", { name: "Carrito (0 productos)" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });

  it("en /carrito muestra el microfrontend del carrito", async () => {
    renderHost("/carrito");
    expect(await screen.findByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });

  it("el carrito pide ir al login con irALogin y, al ingresar, se vuelve al carrito", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ token: "tkn", usuario: { email: "demo@tienda.com", nombre: "Demo" } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        ),
    );
    renderHost("/carrito");

    await userEvent.click(await screen.findByRole("button", { name: "Ingresá para confirmar" }));
    expect(screen.getByRole("heading", { name: "Ingresar" })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Email/), "demo@tienda.com");
    await userEvent.type(screen.getByLabelText(/Contraseña/), "demo1234");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("heading", { name: "Carrito" })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("una ruta desconocida muestra un aviso", () => {
    renderHost("/no-existe");
    expect(screen.getByText("No encontramos esa página.")).toBeInTheDocument();
  });
});
