import { cp, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/** Archivos y carpetas de la raíz que deben copiarse tal cual a `dist/`. */
const STATIC_ENTRIES = ['manifest.webmanifest', 'service-worker.js', 'favicon.svg', 'assets'];

/** Copia los archivos estáticos de la PWA al terminar la compilación. */
function copyStaticAssets() {
  return {
    name: 'ring-copy-static-assets',
    apply: 'build',
    async closeBundle() {
      for (const entry of STATIC_ENTRIES) {
        const from = resolve(import.meta.dirname, entry);
        try {
          await access(from);
        } catch {
          continue;
        }
        await cp(from, resolve(import.meta.dirname, 'dist', entry), { recursive: true });
      }
    }
  };
}

/**
 * Ring de Campeones — configuración de Vite (Paso 2).
 * Proyecto sin framework: HTML + módulos ES nativos.
 */
export default defineConfig({
  root: '.',
  base: '/',
  publicDir: false,
  plugins: [copyStaticAssets()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // El navegador del usuario puede llegar por un dominio de vista previa.
    allowedHosts: true,
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 2048
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    restoreMocks: true
  }
});
