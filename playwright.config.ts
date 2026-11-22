import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// E2E del sistema compuesto: la API y las tres apps compiladas (`vite preview`), cada una en su
// puerto, como en producción. Es la única prueba que ejercita la federación de verdad: en Vitest
// los remotes son dobles.

// Secreto aleatorio por corrida: la API no arranca sin uno y así no hay secretos en el repo.
const JWT_SECRETO = process.env.JWT_SECRETO ?? randomBytes(32).toString("base64url");
const enCI = Boolean(process.env.CI);

const app = (nombre: string, puerto: number) => ({
  command: `npm run preview -w @demo/${nombre}`,
  url: `http://localhost:${puerto}`,
  // Nunca reutiliza servidores ya levantados: un E2E prueba lo que se despliega (el build), no un
  // `npm run dev` que quizás arrancó con código viejo. Por eso hay que apagar `npm run dev` antes.
  reuseExistingServer: false,
  timeout: 60_000,
});

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: enCI,
  retries: enCI ? 1 : 0,
  reporter: enCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "npm run start -w @demo/api",
      url: "http://localhost:4000/api/salud",
      reuseExistingServer: false,
      env: { JWT_SECRETO, PUERTO: "4000" },
      timeout: 60_000,
    },
    app("catalogo", 5001),
    app("carrito", 5002),
    app("host", 5000),
  ],
});
