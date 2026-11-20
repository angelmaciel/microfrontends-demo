// D-07: tipos de los módulos remotos declarados a mano. Así el typecheck y el CI del host no
// dependen de que los remotes estén levantados. Es el contrato de lo que cada remote expone:
// si un remote cambia sus props, este archivo es lo primero que se revisa.

declare module "catalogo/Catalogo" {
  import type { ComponentType } from "react";
  const Catalogo: ComponentType;
  export default Catalogo;
}

declare module "carrito/Carrito" {
  import type { ComponentType } from "react";
  const Carrito: ComponentType;
  export default Carrito;
}

declare module "carrito/MiniCarrito" {
  import type { ComponentType } from "react";
  const MiniCarrito: ComponentType;
  export default MiniCarrito;
}
