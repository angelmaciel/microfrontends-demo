import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MiniCarrito from "./MiniCarrito";

describe("MiniCarrito", () => {
  it("anuncia la cantidad a los lectores de pantalla", () => {
    render(<MiniCarrito />);
    expect(screen.getByText("(0 productos)", { exact: false })).toBeInTheDocument();
  });
});
