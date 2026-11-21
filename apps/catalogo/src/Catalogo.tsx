import { type Producto, formatearPrecio } from "@demo/contratos";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useProductos } from "./useProductos";
import { useDispatch } from "react-redux";
import { agregarAlCarrito } from "@demo/contratos/carrito";

// Una columna en celular, dos en tablet y tres en escritorio (primero celular).
const grilla = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
} as const;

// Lo que este microfrontend expone al host. No crea tema ni store: los recibe del contexto de
// quien lo monte (el host o, en standalone, main.tsx). Por eso no importa nada de main.tsx.
export default function Catalogo() {
  const { estado, reintentar } = useProductos();

  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-catalogo">
      <Typography id="titulo-catalogo" variant="h4" component="h1">
        Catálogo
      </Typography>

      {estado.tipo === "cargando" && (
        <Box sx={grilla} role="status" aria-label="Cargando productos">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} variant="rounded" height={280} />
          ))}
        </Box>
      )}

      {estado.tipo === "error" && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reintentar}>
              Reintentar
            </Button>
          }
        >
          {estado.mensaje}
        </Alert>
      )}

      {estado.tipo === "listo" && estado.productos.length === 0 && (
        <Typography>Todavía no hay productos. Volvé pronto.</Typography>
      )}

      {estado.tipo === "listo" && estado.productos.length > 0 && (
        <Box component="ul" sx={{ ...grilla, listStyle: "none", p: 0, m: 0 }}>
          {estado.productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </Box>
      )}
    </Stack>
  );
}

function TarjetaProducto({ producto }: { producto: Producto }) {
  const sinStock = producto.stock === 0;
  const dispatch = useDispatch();

  return (
    <Card component="li" variant="outlined" aria-labelledby={`producto-${producto.id}`}>
      <CardMedia
        component="img"
        image={producto.imagen}
        alt={producto.nombre}
        loading="lazy"
        sx={{ aspectRatio: "4 / 3", objectFit: "cover" }}
      />
      <CardContent>
        <Typography id={`producto-${producto.id}`} variant="h6" component="h2">
          {producto.nombre}
        </Typography>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" component="p" color="primary">
            {formatearPrecio(producto.precio)}
          </Typography>
          {sinStock && <Chip label="Sin stock" size="small" />}
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          disabled={sinStock}
          onClick={() => dispatch(agregarAlCarrito(producto))}
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          Agregar al carrito
        </Button>
      </CardActions>
    </Card>
  );
}
