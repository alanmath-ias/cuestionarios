/*{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["client/src/*"],
      "@shared/*": ["shared/*"],
      "@assets/*": ["attached_assets/*"]
    }
  }
}*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";  

// Bloque para simular __dirname en ESModules
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtener __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
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
      "@": path.resolve(__dirname, "client/src"), // Ruta absoluta al directorio del cliente
      "@shared": path.resolve(__dirname, "shared"), // Ruta al directorio compartido
      "@assets": path.resolve(__dirname, "attached_assets"),  // Reemplazo import.meta.dirname por __dirname      
    },
  },
  root: path.resolve(__dirname, "client"),  // Reemplazo import.meta.dirname por __dirname
  build: {
    outDir: path.resolve(__dirname, "dist/public"),  // Reemplazo import.meta.dirname por __dirname
    emptyOutDir: true,
  },
});