import { Container, Typography } from "@mui/material";

// Modo standalone: el equipo desarrolla y prueba el microfrontend sin levantar el host.
export function App() {
  return (
    <Container component="main" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Catálogo
      </Typography>
      <Typography>
        Modo standalone. En la fase 1 se expone al host con Module Federation.
      </Typography>
    </Container>
  );
}
