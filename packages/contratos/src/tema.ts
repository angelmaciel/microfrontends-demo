import { createTheme } from "@mui/material/styles";

// Un solo tema para todos los microfrontends: así se ven como una sola aplicación (D-05).
export const tema = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f4e79" },
    secondary: { main: "#c2185b" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
});
