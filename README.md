# Ring de Campeones

Base técnica del juego web móvil **Ring de Campeones**. Está construida con HTML, CSS y módulos ES nativos, sin dependencias de ejecución.

## Desarrollo

Abre el proyecto con un servidor estático que soporte módulos ES. Por ejemplo:

```bash
python3 -m http.server 8000
```

Después visita `http://localhost:8000`.

## Comprobaciones

```bash
npm test
npm run check
```

## Estructura

- `src/config/`: parámetros de diseño y balance.
- `src/data/`: contenido declarativo del juego.
- `src/game/`: estado y reglas de dominio.
- `src/services/`: integración con navegador, almacenamiento y reloj.
- `src/ui/`: renderizado y navegación.
- `src/utils/`: utilidades sin estado.

La lógica de juego no debe manipular el DOM. La interfaz solo invoca acciones de dominio y muestra el estado resultante.
