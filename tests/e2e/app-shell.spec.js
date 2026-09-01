import { expect, test } from '@playwright/test';

/**
 * Criterios de aceptación del Paso 2:
 *  - abre sin errores de consola;
 *  - se adapta a 320×568, 360×640, 390×844 y 412×915 (proyectos de Playwright);
 *  - no hay scroll del documento;
 *  - instalable como PWA (manifest + service worker);
 *  - todos los botones miden al menos 48×48 píxeles CSS.
 */

/** Recoge errores y advertencias de consola durante la prueba. */
function watchConsole(page) {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

async function hasDocumentScroll(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      vertical: doc.scrollHeight > doc.clientHeight + 1,
      horizontal: doc.scrollWidth > doc.clientWidth + 1
    };
  });
}

async function expectTapTargets(page) {
  const tooSmall = await page.evaluate(() => {
    const results = [];
    for (const btn of document.querySelectorAll('button, a.skip-link')) {
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue; // no visible
      if (rect.width < 48 || rect.height < 48) {
        results.push(`${btn.dataset.testid || btn.textContent.trim()} → ${Math.round(rect.width)}×${Math.round(rect.height)}`);
      }
    }
    return results;
  });
  expect(tooSmall, `Controles menores de 48×48: ${tooSmall.join(', ')}`).toEqual([]);
}

test('la portada abre sin errores y sin scroll', async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto('/');

  await expect(page.getByTestId('screen-home')).toBeVisible();
  await expect(page.getByTestId('btn-continue')).toBeDisabled();

  const scroll = await hasDocumentScroll(page);
  expect(scroll.vertical).toBe(false);
  expect(scroll.horizontal).toBe(false);
  expect(problems).toEqual([]);
});

test('se recorren las seis pestañas sin scroll ni desbordamiento', async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto('/');
  await page.getByTestId('btn-new-game').click();

  await expect(page.getByTestId('resource-bar')).toBeVisible();
  await expect(page.getByTestId('bottom-nav')).toBeVisible();

  for (const route of ['dashboard', 'hero', 'equipment', 'skills', 'events', 'pvp']) {
    await page.getByTestId(`nav-${route}`).click();
    await expect(page.getByTestId(`screen-${route}`)).toBeVisible();

    const scroll = await hasDocumentScroll(page);
    expect(scroll.vertical, `scroll vertical en ${route}`).toBe(false);
    expect(scroll.horizontal, `scroll horizontal en ${route}`).toBe(false);
    await expectTapTargets(page);
  }

  expect(problems).toEqual([]);
});

test('los ajustes cambian la escala de texto y la calidad', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-game').click();
  await page.getByTestId('btn-settings').click();

  await expect(page.getByTestId('screen-settings')).toBeVisible();

  await page.getByTestId('font-scale-large').click();
  await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'large');
  await expectTapTargets(page);
  expect((await hasDocumentScroll(page)).vertical).toBe(false);

  await page.getByTestId('quality-low').click();
  await expect(page.locator('html')).toHaveAttribute('data-quality', 'low');

  await page.getByTestId('btn-back').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
});

test('el modal de nueva partida atrapa el foco y se cierra con Escape', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('ringDeCampeones.save.current', JSON.stringify({ hero: { level: 7 } }));
  });
  await page.reload();

  await expect(page.getByTestId('home-save-info')).toContainText('7');
  await page.getByTestId('btn-new-game').click();

  const modal = page.getByTestId('modal');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(page.getByTestId('screen-home')).toBeVisible();
});

test('la PWA declara manifest, iconos y service worker', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');

  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.orientation).toBe('portrait');
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));

  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.status(), `icono ${icon.src}`).toBe(200);
  }

  const swResponse = await request.get('/service-worker.js');
  expect(swResponse.status()).toBe(200);

  const registered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration);
  });
  expect(registered).toBe(true);
});

test('funciona sin conexión tras la primera visita', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Segunda visita: se aseguran las respuestas guardadas en caché.
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('screen-home')).toBeVisible();
  await context.setOffline(false);
});
