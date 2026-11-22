import { Alert, Box, Button, CircularProgress, Stack } from "@mui/material";
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
  lazy,
  useState,
} from "react";

// Un `lazy` por remote, guardado fuera de React. No puede vivir en el estado del componente:
// React Router navega dentro de una transición, y si el remote suspende, React descarta ese
// render sin guardar el estado; al reintentar crearía otro `lazy`, que vuelve a suspender, y así
// para siempre (la URL cambiaba pero la página no). Fuera de React sobrevive a esos descartes.
// La clave es la función `cargar`; cada remote tiene props distintas, por eso el valor es unknown.
const lazies = new WeakMap<object, unknown>();

/** `lazy` también guarda una carga fallida; `nuevo` lo reemplaza para poder reintentar. */
function obtenerLazy<P>(
  cargar: () => Promise<{ default: ComponentType<P> }>,
  { nuevo = false } = {},
): LazyExoticComponent<ComponentType<P>> {
  let componente = lazies.get(cargar) as LazyExoticComponent<ComponentType<P>> | undefined;
  if (!componente || nuevo) {
    componente = lazy(cargar);
    lazies.set(cargar, componente);
  }
  return componente;
}

interface Props<P> {
  /** Import dinámico del módulo remoto, por ejemplo `() => import("catalogo/Catalogo")`. */
  cargar: () => Promise<{ default: ComponentType<P> }>;
  /** Props para el componente remoto, tipadas por el contrato (por ejemplo `PropsCarrito`). */
  props?: P;
  /** Nombre visible del microfrontend para el mensaje de error. */
  nombre: string;
  /** "compacta" para piezas chicas como el contador del encabezado. */
  variante?: "pagina" | "compacta";
}

// Carga un microfrontend aislando sus fallas: si el remote está caído o lanza un error al
// renderizar, solo se reemplaza su parte de la página y el resto del host sigue funcionando.
// Es genérico: TypeScript exige que `props` coincida con lo que el remote declara que recibe.
export function RemoteSeguro<P extends object>({
  cargar,
  props,
  nombre,
  variante = "pagina",
}: Props<P>) {
  const [intento, setIntento] = useState(0);
  const Remoto = obtenerLazy(cargar);

  const reintentar = () => {
    obtenerLazy(cargar, { nuevo: true });
    setIntento((n) => n + 1);
  };

  const compacta = variante === "compacta";

  return (
    // La key reinicia el ErrorBoundary en cada intento para que vuelva a renderizar el remote.
    <LimiteDeError
      key={intento}
      alFallar={
        compacta ? (
          // Texto simple: hereda el color del encabezado, así mantiene el contraste.
          <Box component="span" role="alert" sx={{ fontSize: "0.875rem", textTransform: "none" }}>
            {nombre} no disponible
          </Box>
        ) : (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={reintentar}>
                Reintentar
              </Button>
            }
          >
            No pudimos cargar {nombre}. El resto de la tienda sigue funcionando.
          </Alert>
        )
      }
    >
      <Suspense
        fallback={
          <Stack sx={{ alignItems: "center", py: compacta ? 0 : 4 }}>
            <CircularProgress size={compacta ? 20 : 40} aria-label={`Cargando ${nombre}`} />
          </Stack>
        }
      >
        {/* La regla supone que `Remoto` se crea en cada render, pero sale de la caché `lazies`:
            es el mismo componente mientras no se reintente. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Remoto {...(props as P)} />
      </Suspense>
    </LimiteDeError>
  );
}

interface PropsLimite {
  alFallar: ReactNode;
  children: ReactNode;
}

// React solo atrapa errores de render con un componente de clase (no hay hook equivalente).
class LimiteDeError extends Component<PropsLimite, { fallo: boolean }> {
  override state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // En producción esto iría a un servicio de monitoreo (Sentry o similar).
    console.error("Falló un microfrontend", error, info.componentStack);
  }

  override render() {
    return this.state.fallo ? this.props.alFallar : this.props.children;
  }
}
