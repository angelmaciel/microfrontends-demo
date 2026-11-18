import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Puerto fijo: el host ubica a cada remote por su URL (fase 1, D-01).
export default defineConfig({
  plugins: [react()],
  server: { port: 5000, strictPort: true },
  preview: { port: 5000, strictPort: true },
});
