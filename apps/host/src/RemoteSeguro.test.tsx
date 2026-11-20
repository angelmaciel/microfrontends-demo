import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RemoteSeguro } from "./RemoteSeguro";

const Remoto = () => <p>Contenido del remote</p>;
const cargaOk = () => Promise.resolve({ default: Remoto });
const cargaCaida = () => Promise.reject(new Error("remoteEntry no responde"));

describe("RemoteSeguro", () => {
  // El boundary loguea el error a propósito; se silencia para no ensuciar la salida.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el remote cuando carga", async () => {
    render(<RemoteSeguro cargar={cargaOk} nombre="el catálogo" />);
    expect(await screen.findByText("Contenido del remote")).toBeInTheDocument();
  });

  it("si el remote no carga, muestra un aviso y el resto de la página sigue", async () => {
    render(
      <>
        <h1>Tienda</h1>
        <RemoteSeguro cargar={cargaCaida} nombre="el catálogo" />
      </>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar el catálogo");
    expect(screen.getByRole("heading", { name: "Tienda" })).toBeInTheDocument();
  });

  it("reintentar vuelve a pedir el remote", async () => {
    const cargar = vi.fn().mockImplementationOnce(cargaCaida).mockImplementation(cargaOk);
    render(<RemoteSeguro cargar={cargar} nombre="el catálogo" />);

    await userEvent.click(await screen.findByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Contenido del remote")).toBeInTheDocument();
    expect(cargar).toHaveBeenCalledTimes(2);
  });

  it("si el remote falla al renderizar, también lo aísla", async () => {
    const RemotoRoto = () => {
      throw new Error("bug en el remote");
    };
    render(
      <RemoteSeguro cargar={() => Promise.resolve({ default: RemotoRoto })} nombre="el carrito" />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar el carrito");
  });

  it("la variante compacta muestra un aviso corto", async () => {
    render(<RemoteSeguro cargar={cargaCaida} nombre="el carrito" variante="compacta" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("el carrito no disponible");
  });
});
