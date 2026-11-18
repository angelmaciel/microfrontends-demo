import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("host", () => {
  it("muestra el encabezado del shell", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Shell de la tienda" }),
    ).toBeInTheDocument();
  });
});
