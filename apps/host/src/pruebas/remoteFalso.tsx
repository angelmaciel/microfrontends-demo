// En Vitest no corre Module Federation, así que "catalogo/Catalogo" y compañía no existen.
// vitest.config.ts los apunta acá para que Vite pueda resolverlos; cada prueba los reemplaza con
// vi.mock. Si una prueba se olvida de hacerlo, este componente lo deja en evidencia.
export default function RemoteFalso() {
  return <p>Remote sin simular en la prueba</p>;
}
