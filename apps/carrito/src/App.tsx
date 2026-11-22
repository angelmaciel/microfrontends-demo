import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import Carrito from "./Carrito";
import MiniCarrito from "./MiniCarrito";

// En standalone no hay login (es del host): se avisa en lugar de navegar.
const irALogin = () => {
  window.alert("En modo standalone no hay login. Probá confirmar el pedido dentro del host.");
};

// Modo standalone: el equipo desarrolla y prueba sus dos piezas expuestas sin levantar el host.
export function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="span">
            Carrito (standalone)
          </Typography>
          <MiniCarrito />
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        <Carrito irALogin={irALogin} />
      </Container>
    </>
  );
}
