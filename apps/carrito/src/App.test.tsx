import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { renderConStore } from "./pruebas/renderConStore";

describe("carrito", () => {
  it("se renderiza en modo standalone", () => {
    renderConStore(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });
});
