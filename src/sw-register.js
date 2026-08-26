// Service worker opcional: solo se registra en un contexto seguro (http/https/localhost).
// Abriendo el archivo con doble clic (file://) los navegadores lo bloquean, y ahí tampoco
// hace falta: los sprites ya van dentro del HTML.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service worker registrado: el juego queda disponible offline.'))
        .catch(error => console.warn('SW no registrado:', error));
}
