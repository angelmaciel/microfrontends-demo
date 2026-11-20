import { Stack, Typography } from "@mui/material";

// Lo que este microfrontend expone al host. No crea tema ni store: los recibe del contexto de
// quien lo monte (el host o, en standalone, main.tsx). Por eso no importa nada de main.tsx.
export default function Catalogo() {
  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-catalogo">
      <Typography id="titulo-catalogo" variant="h4" component="h1">
        Catálogo
      </Typography>
      <Typography>Pronto vas a ver acá los productos de la tienda.</Typography>
    </Stack>
  );
}
