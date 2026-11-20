import { serve } from "@hono/node-server";
import { crearApp } from "./app";

const secreto = process.env.JWT_SECRETO;
// Sin un secreto fuerte cualquiera podría fabricar tokens válidos: mejor no arrancar.
if (!secreto || secreto.length < 32) {
  console.error(
    "Falta JWT_SECRETO (mínimo 32 caracteres). Copiá apps/api/.env.example a apps/api/.env.",
  );
  process.exit(1);
}

const puerto = Number(process.env.PUERTO ?? 4000);
const app = crearApp({ secreto });

serve({ fetch: app.fetch, port: puerto }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}/api`);
});
