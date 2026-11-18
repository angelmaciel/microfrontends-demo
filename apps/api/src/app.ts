import { Hono } from "hono";
import { cors } from "hono/cors";

// Orígenes de los microfrontends en desarrollo. En producción se leen del entorno (fase 5).
const ORIGENES = ["http://localhost:5000", "http://localhost:5001", "http://localhost:5002"];

export const app = new Hono().basePath("/api");

app.use("*", cors({ origin: ORIGENES, allowHeaders: ["Authorization", "Content-Type"] }));

app.get("/salud", (c) => c.json({ estado: "ok" }));
