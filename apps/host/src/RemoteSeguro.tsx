import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  lazy,
  useState,
} from "react";

type CargarRemote = () => Promise<{ default: ComponentType }>;

interface Props {
  /** Import dinámico del módulo remoto, por ejemplo `() => import("catalogo/Catalogo")`. */
  cargar: CargarRemote;
  /** Nombre visible del microfrontend para el mensaje de error. */
  nombre: string;
  /** "compacta" para piezas chicas como el contador del encabezado. */
  variante?: "pagina" | "compacta";
}

// Carga un microfrontend aislando sus fallas: si el remote está caído o lanza un error al
// renderizar, solo se reemplaza su parte de la página y el resto del host sigue funcionando.
export function RemoteSeguro({ cargar, nombre, variante = "pagina" }: Props) {
  // `lazy` guarda el resultado de la primera carga, incluso si falló. Para reintentar hay que
  // crear un lazy nuevo; se guarda en estado para que no se recree en cada render.
  const [Remoto, setRemoto] = useState(() => lazy(cargar));
  const [intento, setIntento] = useState(0);

  const reintentar = () => {
    setRemoto(() => lazy(cargar));
    setIntento((n) => n + 1);
  };

  const compacta = variante === "compacta";

  return (
    // La key reinicia el ErrorBoundary en cada intento para que vuelva a renderizar el remote.
    <LimiteDeError
      key={intento}
      alFallar={
        compacta ? (
          <Alert severity="warning" variant="outlined" sx={{ py: 0 }}>
            {nombre} no disponible
          </Alert>
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
        <Remoto />
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
