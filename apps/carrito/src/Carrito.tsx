import {
  type LineaCarrito,
  type Pedido,
  type PropsCarrito,
  formatearPrecio,
} from "@demo/contratos";
import {
  cambiarCantidad,
  quitarDelCarrito,
  seleccionarLineas,
  seleccionarTotal,
  vaciarCarrito,
} from "@demo/contratos/carrito";
import { ErrorApi, pedirApi } from "@demo/contratos/cliente";
import type { EstadoTienda } from "@demo/contratos/estado";
import { cerrarSesion, seleccionarSesion } from "@demo/contratos/sesion";
import { Alert, Box, Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type EstadoEnvio =
  | { tipo: "inactivo" }
  | { tipo: "enviando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "confirmado"; pedido: Pedido };

// Página del carrito que se expone al host. `irALogin` viene del host: el carrito no conoce
// el router, así que cuando necesita una sesión le pide al host que navegue (D-07).
export default function Carrito({ irALogin }: PropsCarrito) {
  const lineas = useSelector((e: EstadoTienda) => seleccionarLineas(e));
  const total = useSelector((e: EstadoTienda) => seleccionarTotal(e));
  const { token } = useSelector(seleccionarSesion);
  const dispatch = useDispatch();
  const [envio, setEnvio] = useState<EstadoEnvio>({ tipo: "inactivo" });

  const confirmar = async () => {
    if (!token) return irALogin();
    setEnvio({ tipo: "enviando" });
    try {
      const pedido = await pedirApi<Pedido>("/pedidos", {
        metodo: "POST",
        token,
        // Solo ids y cantidades: el precio y el total los calcula el servidor.
        cuerpo: { lineas: lineas.map(({ productoId, cantidad }) => ({ productoId, cantidad })) },
      });
      dispatch(vaciarCarrito());
      setEnvio({ tipo: "confirmado", pedido });
    } catch (causa) {
      if (causa instanceof ErrorApi && causa.esNoAutorizado) {
        // El token venció o es inválido (D-04): se cierra la sesión y se pide ingresar de nuevo.
        // El carrito se conserva, así el usuario no pierde lo que había elegido.
        dispatch(cerrarSesion({ motivo: "expirada" }));
        irALogin();
        return;
      }
      setEnvio({
        tipo: "error",
        mensaje: causa instanceof ErrorApi ? causa.message : "No pudimos confirmar el pedido.",
      });
    }
  };

  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-carrito">
      <Typography id="titulo-carrito" variant="h4" component="h1">
        Carrito
      </Typography>

      {envio.tipo === "confirmado" && (
        <Alert severity="success">
          ¡Pedido confirmado! Número {envio.pedido.id.slice(0, 8)} por{" "}
          {formatearPrecio(envio.pedido.total)}.
        </Alert>
      )}

      {lineas.length === 0 ? (
        envio.tipo !== "confirmado" && <Typography>Tu carrito está vacío.</Typography>
      ) : (
        <>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
            {lineas.map((linea) => (
              <Linea key={linea.productoId} linea={linea} />
            ))}
          </Stack>

          <Typography variant="h6" component="p">
            Total estimado: {formatearPrecio(total)}
          </Typography>

          {envio.tipo === "error" && <Alert severity="error">{envio.mensaje}</Alert>}

          <Button
            variant="contained"
            size="large"
            onClick={confirmar}
            disabled={envio.tipo === "enviando"}
          >
            {!token
              ? "Ingresá para confirmar"
              : envio.tipo === "enviando"
                ? "Confirmando…"
                : "Confirmar pedido"}
          </Button>
        </>
      )}
    </Stack>
  );
}

function Linea({ linea }: { linea: LineaCarrito }) {
  const dispatch = useDispatch();
  const { productoId, nombre, precio, cantidad } = linea;
  const cambiar = (nueva: number) => dispatch(cambiarCantidad({ productoId, cantidad: nueva }));

  return (
    <Paper component="li" variant="outlined" sx={{ p: 2 }} aria-label={nombre}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{nombre}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatearPrecio(precio)} c/u
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton
            aria-label={`Quitar una unidad de ${nombre}`}
            onClick={() => cambiar(cantidad - 1)}
          >
            −
          </IconButton>
          <Typography
            aria-label={`Cantidad de ${nombre}`}
            sx={{ minWidth: 24, textAlign: "center" }}
          >
            {cantidad}
          </Typography>
          <IconButton
            aria-label={`Sumar una unidad de ${nombre}`}
            onClick={() => cambiar(cantidad + 1)}
          >
            +
          </IconButton>
          <Button
            color="error"
            onClick={() => dispatch(quitarDelCarrito(productoId))}
            aria-label={`Quitar ${nombre} del carrito`}
          >
            Quitar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
