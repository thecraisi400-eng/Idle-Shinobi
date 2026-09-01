import { createApp } from './js/app.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = await createApp(document.querySelector('#app'));
    await app.start();
    if ('serviceWorker' in navigator && import.meta.env?.PROD) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
    }
  } catch (error) {
    console.error(error);
    document.querySelector('#app').textContent =
      'No se pudo iniciar el juego. Recarga la página o restaura tu respaldo.';
  }
});
