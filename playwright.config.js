import { defineConfig, devices } from '@playwright/test';

/**
 * Ring de Campeones — pruebas de interfaz (Paso 2).
 * Se comprueban los tamaños de pantalla exigidos por el criterio de aceptación.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list']] : [['list']],
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    locale: 'es-ES'
  },
  projects: [
    { name: '320x568', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 }, isMobile: false } },
    { name: '360x640', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 640 } } },
    { name: '390x844', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: '412x915', use: { ...devices['Desktop Chrome'], viewport: { width: 412, height: 915 } } }
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
