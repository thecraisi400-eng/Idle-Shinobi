# Arquitectura

## Principios

1. **Estado único:** `src/game/state-normalizer.js` crea y normaliza el estado persistido del jugador.
2. **Separación de responsabilidades:** los módulos de `game` no usan el DOM; `ui` no contiene fórmulas de juego.
3. **Datos declarativos:** clases, enemigos, objetos y misiones vivirán en `src/data`.
4. **Balance configurable:** los números ajustables vivirán en `src/config`.
5. **Persistencia defensiva:** cada guardado se valida, se respalda y se versiona; si falla, se intenta recuperar el respaldo.

## Flujo de una acción

`evento de interfaz → acción de dominio → validar/actualizar estado → guardar → renderizar`.

## Convenciones

- Archivos JavaScript: `kebab-case.js`.
- Identificadores de contenido: `camelCase` o `kebab-case`, pero de forma consistente por catálogo.
- Nunca se modifica el estado importado directamente: usar funciones de transición que devuelvan una copia válida.
- Las recompensas deben ser idempotentes: un mismo identificador de premio solo puede reclamarse una vez.

## Persistencia

- La partida persistida contiene `meta`, progreso y ajustes; el estado visual temporal no se guarda.
- Los datos se normalizan y validan antes de cargar, guardar, exportar o importar.
- `src/services/storage` aísla `localStorage` de la lógica de dominio y permite usar memoria en las pruebas.
- Las partidas exportadas incluyen formato, fecha y versión de esquema.
