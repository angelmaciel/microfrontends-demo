import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("catalogo", () => {
  it("se renderiza en modo standalone", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
  });
});
