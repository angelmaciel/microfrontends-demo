import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("api", () => {
  it("GET /api/salud responde ok", async () => {
    const res = await app.request("/api/salud");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ estado: "ok" });
  });

  it("permite CORS solo a los orígenes de los microfrontends", async () => {
    const permitido = await app.request("/api/salud", {
      headers: { Origin: "http://localhost:5000" },
    });
    expect(permitido.headers.get("access-control-allow-origin")).toBe("http://localhost:5000");

    const ajeno = await app.request("/api/salud", { headers: { Origin: "https://evil.example" } });
    expect(ajeno.headers.get("access-control-allow-origin")).toBeNull();
  });
});
