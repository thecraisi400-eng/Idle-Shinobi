# Arquitectura

## Principios

1. **Estado único:** `src/game/state.js` crea y valida el estado del jugador.
2. **Separación de responsabilidades:** los módulos de `game` no usan el DOM; `ui` no contiene fórmulas de juego.
3. **Datos declarativos:** clases, enemigos, objetos y misiones vivirán en `src/data`.
4. **Balance configurable:** los números ajustables vivirán en `src/config`.
5. **Persistencia defensiva:** cada guardado se valida, se respalda y se versiona.

## Flujo de una acción

`evento de interfaz → acción de dominio → validar/actualizar estado → guardar → renderizar`.

## Convenciones

- Archivos JavaScript: `kebab-case.js`.
- Identificadores de contenido: `camelCase` o `kebab-case`, pero de forma consistente por catálogo.
- Nunca se modifica el estado importado directamente: usar funciones de transición que devuelvan una copia válida.
- Las recompensas deben ser idempotentes: un mismo identificador de premio solo puede reclamarse una vez.
