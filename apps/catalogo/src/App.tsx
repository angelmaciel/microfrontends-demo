import { Container } from "@mui/material";
import Catalogo from "./Catalogo";

// Modo standalone: el equipo desarrolla y prueba el microfrontend sin levantar el host.
// Renderiza lo mismo que se expone, envuelto en un layout mínimo.
export function App() {
  return (
    <Container component="main" sx={{ py: 4 }}>
      <Catalogo />
    </Container>
  );
}
