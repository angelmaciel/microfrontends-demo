import { seleccionarCantidadTotal } from "@demo/contratos/carrito";
import type { EstadoTienda } from "@demo/contratos/estado";
import { Badge, Box } from "@mui/material";
import { useSelector } from "react-redux";

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
// este remote no depende de React Router. Lee el store del host, que agrega el catálogo: los dos
// microfrontends se comunican a través del estado, sin conocerse entre sí.
export default function MiniCarrito() {
  const cantidad = useSelector((estado: EstadoTienda) => seleccionarCantidadTotal(estado));
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
          {` (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}
        </Box>
      </Box>
    </Badge>
  );
}
