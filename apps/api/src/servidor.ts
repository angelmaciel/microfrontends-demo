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

// En producción, los dominios de los microfrontends separados por coma. Sin la variable se usan
// los de desarrollo (localhost), así `npm run dev` no necesita configurar nada.
const origenes = process.env.ORIGENES_PERMITIDOS?.split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

// Render (y la mayoría de las plataformas) asigna el puerto en PORT; PUERTO queda para local.
const puerto = Number(process.env.PORT ?? process.env.PUERTO ?? 4000);
const app = crearApp({ secreto, origenes });

serve({ fetch: app.fetch, port: puerto }, (info) => {
  console.log(`API escuchando en el puerto ${info.port}`);
});
