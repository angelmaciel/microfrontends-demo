import type { Producto } from "@demo/contratos";

// Datos en memoria: alcanzan para la demo y evitan sumar una base de datos (D-08).
// Se reinician cada vez que arranca el servidor.

export const productos: readonly Producto[] = [
  {
    id: "termo-acero",
    nombre: "Termo de acero 1 L",
    precio: 185000,
    imagen: "https://picsum.photos/seed/termo/400/300",
    stock: 12,
  },
  {
    id: "guampa-palo-santo",
    nombre: "Guampa de palo santo",
    precio: 95000,
    imagen: "https://picsum.photos/seed/guampa/400/300",
    stock: 20,
  },
  {
    id: "bombilla-alpaca",
    nombre: "Bombilla de alpaca",
    precio: 60000,
    imagen: "https://picsum.photos/seed/bombilla/400/300",
    stock: 30,
  },
  {
    id: "yerba-1kg",
    nombre: "Yerba mate 1 kg",
    precio: 32000,
    imagen: "https://picsum.photos/seed/yerba/400/300",
    stock: 50,
  },
  {
    id: "hamaca",
    nombre: "Hamaca paraguaya",
    precio: 450000,
    imagen: "https://picsum.photos/seed/hamaca/400/300",
    stock: 4,
  },
  {
    id: "camisa-aopoi",
    nombre: "Camisa de ao po'i",
    precio: 280000,
    imagen: "https://picsum.photos/seed/aopoi/400/300",
    stock: 0,
  },
];

export interface UsuarioGuardado {
  id: string;
  email: string;
  nombre: string;
  /** `sal:hash` con scrypt. Nunca se guarda la contraseña en texto plano. */
  hashContrasena: string;
}

// Usuario de demo. Contraseña: demo1234 (publicada en el README para quien pruebe la demo).
export const usuarios: readonly UsuarioGuardado[] = [
  {
    id: "u-1",
    email: "demo@tienda.com",
    nombre: "Cliente Demo",
    hashContrasena:
      "opRX0rMNgwOr-ukltiVcOA:L1YxyjsRwpxAISwUHxrguwXlN7acScalyyqnum5cI-Vb-Dh9FTcHv3Gk5IqxvuzNQhitqilV-iIC7LtM7Ld1AA",
  },
];
