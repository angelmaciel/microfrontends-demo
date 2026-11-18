---
name: verificar
description: Corre todos los chequeos de calidad de la demo de microfrontends (lint, tipos, formato, pruebas, build, auditoría de dependencias) y resume el resultado. Usar antes de cada commit o cuando el usuario pida verificar.
---

# Verificar

Correr desde la raíz, en este orden, y detenerse en el primer fallo para arreglarlo:

1. `npm run verificar`: lint, tipos (raíz y cada workspace), formato y pruebas.
   Si solo falla el formato, `npm run format` y volver a correr.
2. `npm run build`: build de producción de cada app. Desde la fase 1, revisar que cada
   `dist/` tenga su `remoteEntry.js` (remotes) y anotar el tamaño de los bundles.
3. `npm audit --audit-level=moderate`: si hay hallazgos, proponer la versión parcheada (D-06).
4. E2E solo si el usuario tiene los servidores levantados (no levantarlos por cuenta propia):
   `npm run test:e2e` (desde la fase 4).

Al terminar, informar qué pasó y qué no se pudo correr. Nunca decir "todo verde" si se saltó un paso.
