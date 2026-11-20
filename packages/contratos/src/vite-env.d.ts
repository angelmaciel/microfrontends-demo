// Variables de entorno que leen los microfrontends al compilar (Vite las reemplaza en el build).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
