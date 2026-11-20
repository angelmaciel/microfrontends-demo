import { Badge, Box } from "@mui/material";

// Texto solo para lectores de pantalla: el número del badge es visual y se oculta para ellos.
const soloLectores = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// Contador del encabezado. Solo muestra la cantidad: la navegación al carrito es del host, así
// este remote no depende de React Router. La cantidad sale del store en la fase 3.
export default function MiniCarrito() {
  const cantidad = 0;
  return (
    <Badge
      badgeContent={cantidad}
      showZero
      color="secondary"
      slotProps={{ badge: { "aria-hidden": true } }}
    >
      <Box component="span" sx={{ pr: 1 }}>
        Carrito
        <Box component="span" sx={soloLectores}>
          {` (${cantidad} productos)`}
        </Box>
      </Box>
    </Badge>
  );
}
