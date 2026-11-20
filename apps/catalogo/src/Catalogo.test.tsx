import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Catalogo from "./Catalogo";

describe("Catalogo (expuesto)", () => {
  // Se monta sin App ni main.tsx, como lo hace el host: no debe depender de ellos.
  it("se renderiza por sí solo", () => {
    render(<Catalogo />);
    expect(screen.getByRole("region", { name: "Catálogo" })).toBeInTheDocument();
  });
});
