import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("catalogo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("se renderiza en modo standalone", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]")));
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
    expect(await screen.findByText(/Todavía no hay productos/)).toBeInTheDocument();
  });
});
