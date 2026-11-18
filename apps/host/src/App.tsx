import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";

export function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="span">
            Tienda
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shell de la tienda
        </Typography>
        <Box component="p">
          Fase 0: el host todavía no carga microfrontends. En la fase 1 compone el catálogo y el
          carrito con Module Federation.
        </Box>
      </Container>
    </>
  );
}
