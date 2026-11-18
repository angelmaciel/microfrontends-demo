import { serve } from "@hono/node-server";
import { app } from "./app";

const puerto = Number(process.env.PUERTO ?? 4000);

serve({ fetch: app.fetch, port: puerto }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}/api`);
});
