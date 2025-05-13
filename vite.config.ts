import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import themePlugin from '@replit/vite-plugin-shadcn-theme-json';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Solo importa cartographer si estás en Replit y en desarrollo
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      ...(mode !== 'production' && isReplit
        ? [await import('@replit/vite-plugin-cartographer').then(m => m.cartographer())]
        : []),
    ],
    root: path.resolve(__dirname, 'client'),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist/public'),
      emptyOutDir: true,
    },
    define: {
      'process.env': env, // permite usar process.env.VARIABLE en React
    },
  };
});
