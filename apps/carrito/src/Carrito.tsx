import { Stack, Typography } from "@mui/material";

// Página del carrito que se expone al host. El contenido real llega con el store (fase 3).
export default function Carrito() {
  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-carrito">
      <Typography id="titulo-carrito" variant="h4" component="h1">
        Carrito
      </Typography>
      <Typography>Tu carrito está vacío.</Typography>
    </Stack>
  );
}
