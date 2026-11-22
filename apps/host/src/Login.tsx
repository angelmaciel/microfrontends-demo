import type { RespuestaLogin } from "@demo/contratos";
import { ErrorApi, pedirApi } from "@demo/contratos/cliente";
import { iniciarSesion, seleccionarSesion } from "@demo/contratos/sesion";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { type FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router";

export function Login() {
  const { usuario, motivoCierre } = useSelector(seleccionarSesion);
  const dispatch = useDispatch();
  const navegar = useNavigate();
  // Si vino desde otra página (por ejemplo, el carrito al confirmar), vuelve ahí al ingresar.
  const { state } = useLocation() as { state: { desde?: string } | null };
  const destino = state?.desde ?? "/";
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={destino} replace />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const respuesta = await pedirApi<RespuestaLogin>("/auth/login", {
        metodo: "POST",
        cuerpo: { email, password: contrasena },
      });
      // El token queda solo en el store (memoria): nunca en localStorage, así un XSS no puede
      // leerlo de forma persistente (D-04). Recargar la página cierra la sesión.
      dispatch(iniciarSesion(respuesta));
      navegar(destino, { replace: true });
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : "Ocurrió un error inesperado.");
      setEnviando(false);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={enviar}
      noValidate
      spacing={2}
      sx={{ maxWidth: 400, mx: "auto" }}
      aria-labelledby="titulo-login"
    >
      <Typography id="titulo-login" variant="h4" component="h1">
        Ingresar
      </Typography>

      {motivoCierre === "expirada" && (
        <Alert severity="info">Tu sesión expiró. Volvé a ingresar para continuar.</Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" size="large" disabled={enviando}>
        {enviando ? "Ingresando…" : "Ingresar"}
      </Button>
      <Typography variant="body2" color="text.secondary">
        Usuario de prueba: demo@tienda.com / demo1234
      </Typography>
    </Stack>
  );
}
