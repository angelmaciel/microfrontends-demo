import { cerrarSesion, seleccionarSesion } from "@demo/contratos/sesion";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link, Route, Routes, useNavigate } from "react-router";
import { Login } from "./Login";
import { RemoteSeguro } from "./RemoteSeguro";

// Los imports apuntan a módulos que existen recién en runtime: Module Federation los resuelve
// descargando el remoteEntry de cada remote. Se definen acá, fuera del componente, para que sean
// funciones estables.
const cargarCatalogo = () => import("catalogo/Catalogo");
const cargarCarrito = () => import("carrito/Carrito");
const cargarMiniCarrito = () => import("carrito/MiniCarrito");

export function App() {
  const { usuario } = useSelector(seleccionarSesion);
  const dispatch = useDispatch();
  const navegar = useNavigate();
  // El carrito pide ir al login sin conocer el router; el host decide a dónde y recuerda volver.
  const irALogin = () => navegar("/login", { state: { desde: "/carrito" } });

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Button component={Link} to="/" color="inherit" sx={{ fontSize: "1.25rem" }}>
            Tienda
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {usuario ? (
            <>
              {/* En celular se oculta el nombre para que entren los botones. */}
              <Typography component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Hola, {usuario.nombre}
              </Typography>
              <Button color="inherit" onClick={() => dispatch(cerrarSesion())}>
                Salir
              </Button>
            </>
          ) : (
            <Button component={Link} to="/login" color="inherit">
              Ingresar
            </Button>
          )}
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
            element={
              <RemoteSeguro cargar={cargarCarrito} props={{ irALogin }} nombre="el carrito" />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Typography>No encontramos esa página.</Typography>} />
        </Routes>
      </Container>
    </>
  );
}
