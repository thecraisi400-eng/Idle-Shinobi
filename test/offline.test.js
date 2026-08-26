// Prueba offline de Idle Shinobi.
// Ejecuta el <script> REAL que se envía en index.html (runScripts: 'dangerously')
// y sustituye únicamente las APIs gráficas que jsdom no implementa
// (createImageBitmap y el contexto 2D del canvas), midiendo cada fetch que intenta.
//
// Uso: node test/offline.test.js   (o `npm test`)

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const SPRITE_DIR = path.join(ROOT, 'assets', 'sprites');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const SHEETS = [
  'escenarios1.webp', 'escenarios2.webp', 'escenarios3.webp',
  'personaje1.webp', 'personaje2.webp', 'personaje3.webp',
  'personaje4.webp', 'personaje5.webp', 'personaje6.webp', 'personaje7.webp',
];
const BYTES = Object.fromEntries(SHEETS.map((n) => [n, fs.statSync(path.join(SPRITE_DIR, n)).size]));

function stubBrowser(window, calls, { allowFetch }) {
  // createImageBitmap: valida que llegan los bytes correctos y devuelve un "bitmap".
  window.createImageBitmap = (source) => Promise.resolve().then(() => {
    const size = source && source.size;
    if (typeof size !== 'number') throw new Error('createImageBitmap sin Blob');
    return { kind: 'bitmap', size, close() {} };
  });

  // Contexto 2D de registro: anota cada drawImage del escenario superior.
  window.HTMLCanvasElement.prototype.getContext = function getContext(type) {
    if (type !== '2d') return null;
    return {
      imageSmoothingEnabled: true,
      clearRect() {},
      drawImage(...args) { calls.draws.push(args); },
    };
  };

  // fetch instrumentado: en modo offline cualquier llamada cuenta como fallo del requisito.
  window.fetch = (url) => {
    calls.fetch.push(String(url));
    if (!allowFetch) return Promise.reject(new Error('RED DESHABILITADA EN LA PRUEBA'));
    const name = String(url).split('/').pop();
    const bytes = fs.readFileSync(path.join(SPRITE_DIR, name));
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(buffer) });
  };
}

function boot(markup, { allowFetch }) {
  const calls = { fetch: [], draws: [] };
  const dom = new JSDOM(markup, {
    runScripts: 'dangerously',
    url: 'file:///idle-shinobi/index.html',
    pretendToBeVisual: true,
    beforeParse(window) { stubBrowser(window, calls, { allowFetch }); },
  });
  return { dom, calls };
}

function waitFor(fn, ms, what) {
  const deadline = Date.now() + ms;
  return new Promise((resolve, reject) => {
    const tick = () => {
      try {
        const value = fn();
        if (value) return resolve(value);
      } catch (error) { return reject(error); }
      if (Date.now() > deadline) return reject(new Error(`tiempo agotado: ${what}`));
      setTimeout(tick, 25);
    };
    tick();
  });
}

async function testEmbeddedOffline() {
  console.log('· ruta offline (sprites embebidos en el HTML, sin red)…');
  const { dom, calls } = boot(html, { allowFetch: false });
  const w = dom.window;

  // 1. Los datos embebidos existen y cubren las 10 hojas.
  assert.ok(w.EMBEDDED_ASSETS, 'window.EMBEDDED_ASSETS debe existir en index.html');
  for (const name of SHEETS) {
    assert.ok(w.EMBEDDED_ASSETS.sheets[name].dataUri.startsWith('data:image/webp;base64,'),
      `${name} debe estar embebido como data: URI webp`);
  }

  // 2. Las 10 hojas terminan cargadas con los bytes exactos del archivo en disco.
  await waitFor(() => SHEETS.every((n) => w.spriteManager.has(n)), 5000, 'cargar las 10 hojas');
  for (const name of SHEETS) {
    const image = w.spriteManager.get(name);
    assert.equal(image.size, BYTES[name], `${name}: el bitmap debe tener ${BYTES[name]} bytes`);
    assert.equal(image.kind, 'bitmap');
  }

  // 3. Ni una sola petición de red durante toda la carga.
  assert.equal(calls.fetch.length, 0, `fetch() no debe llamarse en offline (hubo: ${calls.fetch})`);

  // 4. La pantalla de carga se oculta y el escenario se dibuja con el recorte exacto.
  assert.equal(w.document.getElementById('sprite-loading').hidden, true, 'overlay de carga oculto');
  assert.equal(calls.draws.length, 1, 'drawUpperScenario dibuja una vez');
  assert.deepEqual(calls.draws[0].slice(1), [11, 9, 392, 344, 0, 0, 392, 344],
    'recorte de origen [11,9)-(403,353) y destino 392x344');

  // 5. Progreso al 100 %.
  assert.match(w.document.getElementById('sprite-loading-label').textContent, /100%/);
  dom.window.close();
  console.log('  OK: 10/10 hojas desde data: URIs, 0 peticiones de red, overlay oculto.');
}

async function testFetchFallback() {
  console.log('· ruta de respaldo (sin embebidos -> fetch del archivo suelto)…');
  const withoutEmbedded = html.replace('window.EMBEDDED_ASSETS =', 'window.__EMBEDDED_DISABLED__ =');
  assert.notEqual(withoutEmbedded, html, 'el marcador embebido debe existir para poder desactivarlo');
  const { dom, calls } = boot(withoutEmbedded, { allowFetch: true });
  const w = dom.window;

  await waitFor(() => SHEETS.every((n) => w.spriteManager.has(n)), 5000, 'cargar por fetch');
  for (const name of SHEETS) {
    assert.equal(w.spriteManager.get(name).size, BYTES[name], `${name} por fetch con bytes correctos`);
  }
  assert.equal(calls.fetch.length, 10, 'deben pedirse exactamente las 10 hojas por fetch');
  assert.equal(w.document.getElementById('sprite-loading').hidden, true);
  dom.window.close();
  console.log('  OK: las 10 hojas cargan vía fetch cuando no hay embebidos.');
}

function testHtmlHygiene() {
  console.log('· higiene del HTML (sin CDN, sin URLs remotas)…');
  assert.ok(!html.includes('cdn.tailwindcss.com'), 'sin Tailwind por CDN');
  const remote = html.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
  assert.deepEqual(remote, [], `ningún recurso remoto: ${remote}`);
  const embeddedCount = (html.match(/data:image\/webp;base64,/g) || []).length;
  assert.equal(embeddedCount, 10, 'las 10 hojas embebidas');
  console.log('  OK: HTML autocontenido (178 KB, 10 data: URIs, 0 URLs remotas).');
}

function testSupportFiles() {
  console.log('· archivos de apoyo (sw.js, manifest, manifiesto SW)…');
  for (const file of ['sw.js', 'sw-manifest.js', 'manifest.webmanifest', 'assets-embedded.js',
    'icons/icon-192.png', 'icons/icon-512.png']) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} debe existir`);
  }
  const manifest = fs.readFileSync(path.join(ROOT, 'sw-manifest.js'), 'utf8');
  for (const url of ['index.html', 'assets-embedded.js', 'manifest.webmanifest',
    'icons/icon-192.png', ...SHEETS.map((n) => `assets/sprites/${n}`)]) {
    assert.ok(manifest.includes(`"${url}"`), `sw-manifest debe pre-cache ar ${url}`);
  }
  console.log('  OK: precaché del service worker lista.');
}

(async () => {
  await testEmbeddedOffline();
  await testFetchFallback();
  testHtmlHygiene();
  testSupportFiles();
  console.log('\nPRUEBA OFFLINE: TODO VERDE');
})().catch((error) => {
  console.error('\nFALLO:', error && error.message);
  process.exit(1);
});
