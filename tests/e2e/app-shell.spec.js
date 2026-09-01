import { expect, test } from '@playwright/test';

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
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.width < 47.5 || rect.height < 47.5) {
        results.push(`${btn.dataset.testid || btn.textContent.trim()} → ${Math.round(rect.width)}×${Math.round(rect.height)}`);
      }
    }
    return results;
  });
  expect(tooSmall, `Controles menores de 48×48: ${tooSmall.join(', ')}`).toEqual([]);
}

async function expectControlsInsideViewport(page) {
  const clipped = await page.evaluate(() => {
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    return Array.from(document.querySelectorAll('main button:not([disabled]), main [role="progressbar"]'))
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > viewport.width + 1 || rect.top < -1 || rect.bottom > viewport.height + 1))
      .map(({ element, rect }) => `${element.dataset.testid || element.textContent.trim().slice(0, 24)} → ${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}×${Math.round(rect.height)}`);
  });
  expect(clipped, `Controles cortados: ${clipped.join(', ')}`).toEqual([]);
}

async function completeOnboarding(page, classId = 'balanced') {
  await page.getByTestId('btn-new-game').click();
  await expect(page.getByTestId('screen-class-select')).toBeVisible();
  await page.getByTestId(`class-${classId}`).click();
  await page.getByTestId('btn-confirm-class').click();
  await expect(page.getByTestId('screen-tutorial')).toBeVisible();
  for (let step = 0; step < 3; step += 1) await page.getByTestId('tutorial-next').click();
  await page.getByTestId('tutorial-finish').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
}

test('la portada abre sin errores y sin scroll', async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto('/');
  await expect(page.getByTestId('screen-home')).toBeVisible();
  await expect(page.getByTestId('btn-continue')).toBeDisabled();
  expect(await hasDocumentScroll(page)).toEqual({ vertical: false, horizontal: false });
  await expectTapTargets(page);
  expect(problems).toEqual([]);
});

test('permite crear partida y elegir cualquiera de las cuatro clases', async ({ page }) => {
  for (const classId of ['heavy', 'technical', 'agile', 'balanced']) {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('btn-new-game').click();
    await page.getByTestId(`class-${classId}`).click();
    await page.getByTestId('btn-confirm-class').click();
    await expect(page.getByTestId('screen-tutorial')).toBeVisible();
    const savedClass = await page.evaluate(() => JSON.parse(localStorage.getItem('ringDeCampeones.save.current')).state.profile.classId);
    expect(savedClass).toBe(classId);
  }
});

test('recorre las seis pestañas completas sin scroll ni contenido cortado', async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto('/');
  await completeOnboarding(page);

  await expect(page.getByTestId('resource-bar')).toBeVisible();
  await expect(page.getByTestId('bottom-nav')).toBeVisible();

  for (const route of ['hero', 'equipment', 'skills', 'events', 'pvp', 'shop']) {
    await page.getByTestId(`nav-${route}`).click();
    await expect(page.getByTestId(`screen-${route}`)).toBeVisible();
    expect(await hasDocumentScroll(page)).toEqual({ vertical: false, horizontal: false });
    await expectTapTargets(page);
    await expectControlsInsideViewport(page);
  }
  expect(problems).toEqual([]);
});

test('usa texto grande en 320×568 y mantiene paginación y controles visibles', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await page.getByTestId('btn-settings').click();
  await page.getByTestId('font-scale-large').click();
  await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'large');
  await page.getByTestId('btn-back').click();

  for (const route of ['hero', 'equipment', 'skills', 'events', 'pvp', 'shop']) {
    await page.getByTestId(`nav-${route}`).click();
    await expectControlsInsideViewport(page);
    expect(await hasDocumentScroll(page)).toEqual({ vertical: false, horizontal: false });
  }
});

test('abre accesos secundarios y todos los modales principales', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);

  for (const route of ['missions', 'achievements', 'inbox']) {
    await page.getByTestId(`quick-${route}`).click();
    await expect(page.getByTestId(`screen-${route}`)).toBeVisible();
    await expectControlsInsideViewport(page);
    await page.getByRole('button', { name: 'Volver al panel' }).click();
  }

  await page.getByTestId('nav-skills').click();
  await page.getByTestId('reset-skills').click();
  await expect(page.getByTestId('modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('modal')).toHaveCount(0);

  await page.getByTestId('nav-pvp').click();
  await page.getByTestId('enter-room-bronze').click();
  await expect(page.getByTestId('modal')).toContainText('se pierde al quedar eliminado');
  await page.keyboard.press('Escape');
});

test('protege una lucha activa y completa el flujo visual de combate', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await page.getByTestId('btn-fight').click();
  await page.getByTestId('btn-start-combat').click();
  await expect(page.getByTestId('screen-combat')).toBeVisible();
  await expect(page.getByTestId('resource-bar')).toHaveCount(0);
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.getByTestId('modal')).toContainText('Abandonar combate');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('screen-combat')).toBeVisible();
  await page.getByTestId('btn-resolve-combat').click();
  await expect(page.getByTestId('screen-result')).toBeVisible();
  await page.getByTestId('btn-result-dashboard').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
});

test('se puede navegar por teclado y el modal atrapa y devuelve el foco', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('screen-class-select')).toBeVisible();

  await page.getByTestId('class-balanced').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('btn-confirm-class').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('screen-tutorial')).toBeVisible();
});

test('el modal de nueva partida atrapa el foco y se cierra con Escape', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('ringDeCampeones.save.current', JSON.stringify({ hero: { level: 7 } })));
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
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status(), `icono ${icon.src}`).toBe(200);
  expect((await request.get('/service-worker.js')).status()).toBe(200);
  expect(await page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
});

test('funciona sin conexión tras la primera visita', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('screen-home')).toBeVisible();
  await context.setOffline(false);
});
