// vite.config.ts (en la raíz del proyecto)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    // Este bloque se activa solo en dev si existe REPL_ID (no nos importa en prod)
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  // IMPORTANTE: Le decimos a Vite que la “raíz” (root) del front está en /client
  root: path.resolve(__dirname, "client"),

  build: {
    // Cambiamos únicamente la carpeta de salida para que Vite genere en dist/client
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true,
  },
});
