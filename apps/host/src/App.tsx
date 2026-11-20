import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Route, Routes } from "react-router";
import { RemoteSeguro } from "./RemoteSeguro";

// Los imports apuntan a módulos que existen recién en runtime: Module Federation los resuelve
// descargando el remoteEntry de cada remote. Se definen acá, fuera del componente, para que sean
// funciones estables.
const cargarCatalogo = () => import("catalogo/Catalogo");
const cargarCarrito = () => import("carrito/Carrito");
const cargarMiniCarrito = () => import("carrito/MiniCarrito");

export function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Button component={Link} to="/" color="inherit" sx={{ fontSize: "1.25rem" }}>
            Tienda
          </Button>
          {/* La navegación es del host; el remote solo dibuja el contador. */}
          <Button component={Link} to="/carrito" color="inherit">
            <RemoteSeguro cargar={cargarMiniCarrito} nombre="el carrito" variante="compacta" />
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<RemoteSeguro cargar={cargarCatalogo} nombre="el catálogo" />} />
          <Route
            path="/carrito"
            element={<RemoteSeguro cargar={cargarCarrito} nombre="el carrito" />}
          />
          <Route path="*" element={<Typography>No encontramos esa página.</Typography>} />
        </Routes>
      </Container>
    </>
  );
}
