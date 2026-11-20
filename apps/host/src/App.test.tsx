import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

// En las pruebas no hay remotes levantados: se reemplazan los módulos federados por dobles.
// Así se prueba la composición del host sin depender de la red.
vi.mock("catalogo/Catalogo", () => ({ default: () => <h1>Catálogo</h1> }));
vi.mock("carrito/Carrito", () => ({ default: () => <h1>Carrito</h1> }));
vi.mock("carrito/MiniCarrito", () => ({ default: () => <span>Carrito (0 productos)</span> }));

const renderEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );

describe("host", () => {
  it("en la portada compone el catálogo y el contador del carrito", async () => {
    renderEn("/");
    expect(await screen.findByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Carrito (0 productos)" })).toHaveAttribute(
      "href",
      "/carrito",
    );
  });

  it("en /carrito muestra el microfrontend del carrito", async () => {
    renderEn("/carrito");
    expect(await screen.findByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });

  it("una ruta desconocida muestra un aviso", () => {
    renderEn("/no-existe");
    expect(screen.getByText("No encontramos esa página.")).toBeInTheDocument();
  });
});
