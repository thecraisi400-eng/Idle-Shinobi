# Reglas Definitivas de Juego — Ring de Campeones

**Versión:** 1.0.0  
**Fecha de corte:** Agosto 2026  
**Documento base:** `ring-de-campeones-plan-completo.md` y `ring-de-campeones-guia-implementacion-10-pasos.md`  
**Idioma oficial:** Español  

---

## 1. Decisiones Definitivas ante Contradicciones

Este apartado resuelve de manera formal e inapelable cualquier ambigüedad o contradicción detectada en el plan de diseño original. Toda lógica del juego debe subordinarse a estas resoluciones.

| Tema / Área | Opciones en conflicto del plan | Decisión Implementable y Obligatoria |
|---|---|---|
| **Portada** | Logo con luchador vs. el luchador no aparece | La portada muestra únicamente el logo oficial, nivel del guardado y botones de acción (`Continuar`, `Nueva partida`, `Ajustes`). El héroe se renderiza a partir del panel principal. |
| **Energía / Resistencia** | Mostrar energía vs. sistema sin energía vs. recargas | **No existe sistema de energía ni límite de combates**. El jugador puede luchar de forma ilimitada. El tercer recurso en la cabecera superior es **Materiales**. |
| **Robo de vida (Lifesteal)** | Se menciona como secundaria vs. no existe en el juego | **No hay robo de vida**. Las estadísticas secundarias son exclusivamente: Suerte, Esquiva, Precisión, Resistencia Crítica y Anulación Crítica. |
| **Quinta Clase (Leyenda)** | 5 clases jugables vs. el jugador elige entre 4 | Cuatro clases son seleccionables por el jugador: **Pesado, Técnico, Ágil y Equilibrado**. La clase **Leyenda** es exclusiva para jefes de campaña y rivales especiales de CPU. |
| **Remate / Finalizador** | Barra de remate vs. sin barra vs. remate automático | **Existe remate automático** sin barra de carga independiente: se activa automáticamente cuando el rival cae al 20% o menos de su vida máxima, una sola vez por luchador por combate, aplicando un multiplicador de daño de **×1.5**. |
| **Cofres / Gacha** | Cofres premium aleatorios vs. “no habrá cofres” | **Cero cofres y cero gacha aleatorio oculto**. Las Gemas compran directamente piezas visibles en la tienda Premium. Los materiales se consiguen en combates, eventos y tienda. |
| **Obtención de Equipo** | Solo por tienda vs. habilidades que aumentan drop de equipo | El equipo base solo se adquiere por tienda. La habilidad pasiva de "drop" aumenta en un porcentaje la obtención de **Materiales y Oro**, no la aparición de equipo. |
| **Rachas y Días** | Rachas de combate infinitas vs. no hay rachas vs. calendario | No hay rachas de combate ni penalizaciones por perder. El calendario de login tiene **7 días fijos**; tras el séptimo día vuelve al día 1 sin exigir racha ininterrumpida. |
| **PVP / Multijugador** | Ligas globales online vs. torneos locales | El juego es **100% offline y local**. El PVP consiste en torneos eliminatorios de 32 participantes con **rivales fantasma generados de forma determinista**, bolsas de premios por sala y apuestas entre rondas. No hay multijugador en tiempo real ni ranking online. |
| **Versiones y Gráficos** | Versión lite vs. completa | Se distribuye una **única aplicación PWA** con selector de calidad gráfica en Ajustes: *Baja, Media y Alta* (controla sombras, partículas y efectos de golpe). |
| **Navegación / Scroll** | Desplazamiento vertical en listas largas vs. todo visible | **Cero scroll en el documento (`100dvh`)**. Toda pantalla, inventario y modal se organiza en vistas paginadas (4 a 6 elementos fijos por página) con controles táctiles grandes. |

---

## 2. Clases de Luchadores y Sistema de Ventajas

Existen 5 clases en el juego. Cada clase posee multiplicadores fijos de estadísticas y una relación de ventaja triangular estilo "piedra, papel o tijera".

### 2.1. Tabla de Clases y Modificadores Base

| Clase | Tipo | Bonificación Permanente | Penalización Permanente | Ventaja Directa (+12% Daño) | Desventaja Directa (-10% Daño) |
|---|---|---|---|---|---|
| **Pesado** | Jugable | +18% Vida Máxima, +8% Defensa | −10% Velocidad de Carga | Vence a **Ágil** | Sufre ante **Técnico** |
| **Técnico** | Jugable | +10% Precisión, +5% Prob. Crítico | −5% Vida Máxima | Vence a **Pesado** | Sufre ante **Ágil** |
| **Ágil** | Jugable | +18% Velocidad de Carga, +3% Esquiva | −8% Defensa | Vence a **Técnico** | Sufre ante **Pesado** |
| **Equilibrado** | Jugable | +4% Vida, +4% Ataque, +4% Defensa, +4% Velocidad | Ninguna | Neutral (1.00× contra todos) | Neutral (1.00× contra todos) |
| **Leyenda** | Solo CPU | Stats especiales definidos por plantilla | Ninguna | Ventaja fija +12% sobre el jugador | No tiene debilidad de clase |

### 2.2. Triángulo de Ventajas
$$\text{Pesado} \xrightarrow{\text{vence (+12\%)}} \text{Ágil} \xrightarrow{\text{vence (+12\%)}} \text{Técnico} \xrightarrow{\text{vence (+12\%)}} \text{Pesado}$$

- La clase seleccionada al crear el personaje es permanente para esa partida.
- El modificador de ventaja/desventaja se aplica exclusivamente al calcular el daño del golpe en combate; **nunca altera de forma permanente los atributos guardados en el perfil**.

---

## 3. Héroe, Progresión y Economía

### 3.1. Nivel y Experiencia
- **Nivel Máximo:** 200.
- Cada combate ganado otorga Experiencia (EXP) y Oro.
- Al acumular la EXP requerida para el nivel actual, el héroe sube de nivel:
  - Se resta la EXP consumida.
  - Se otorga +1 Punto de Estadística.
  - Se otorga +1 Punto de Habilidad.
  - Se entrega una bonificación de Oro por nivel alcanzado.
- Al alcanzar el Nivel 200, la barra de EXP se congela al 100% y no se ganan más niveles, pero el jugador continúa ganando Oro, Materiales y progresando en equipo y modos.

### 3.2. Estadísticas Principales y Secundarias
- **Primarias:**
  - **Vida (HP):** Puntos de salud en combate.
  - **Ataque (ATK):** Base del cálculo de daño de los golpes.
  - **Defensa (DEF):** Reduce el daño recibido por impacto.
  - **Velocidad (SPD):** Determina la rapidez con que se llena la barra de acción de 0 a 100.
- **Secundarias:**
  - **Probabilidad Crítica (CRIT%):** Posibilidad de asestar un golpe crítico (base 5%, daño ×2.0).
  - **Esquiva (DODGE%):** Posibilidad de evadir completamente un ataque (límite máximo 35%).
  - **Precisión (ACC%):** Contrarresta la esquiva rival (límite mínimo de impacto 5%).
  - **Resistencia Crítica (CRIT_RES):** Reduce el daño recibido de golpes críticos.
  - **Anulación Crítica (CRIT_NULL%):** Posibilidad de convertir un crítico rival en golpe normal.
  - **Suerte (LUCK):** Aumenta ligeramente el rendimiento de recompensas de materiales.

### 3.3. Monedas y Recursos
1. **Oro:** Moneda base para comprar equipo en tienda, comprar puntos de estadísticas, mejorar piezas y recambiar estadísticas secundarias.
2. **Gemas:** Moneda premium obtenida en logros, torneos PVP y eventos especiales. Se utiliza para comprar equipo legendario en la tienda Premium y resetear el árbol de habilidades.
3. **Materiales:** Fragmentos acumulables (`Hierro`, `Cuero`, `Titanio`, `Esencia Mística`) utilizados para mejorar equipo de +0 a +15 y fabricar consumibles.

---

## 4. Equipamiento e Inventario

### 4.1. Huecos de Equipo (7 Slots)
1. **Cabeza** (Máscaras, Cascos)
2. **Torso** (Chalecos, Trajes)
3. **Brazos** (Coderas, Muñequeras)
4. **Piernas** (Mallas, Pantalones)
5. **Botas** (Botas de Lucha)
6. **Cinturón** (Cinturones de Poder)
7. **Amuleto** (Colgantes de la Victoria)

### 4.2. Rarezas y Jerarquía de Color
1. **Común** (Gris) — 1 estadística primaria.
2. **Poco Común** (Verde) — 1 primaria + 1 secundaria menor.
3. **Raro** (Azul) — 1 primaria + 1 secundaria mejorada.
4. **Épico** (Violeta) — 1 primaria + 2 secundarias.
5. **Legendario** (Dorado) — 1 primaria alta + 2 secundarias altas + Set.
6. **Divino** (Arcoíris) — Valores máximos + 3 secundarias + Set doble.

### 4.3. Sistema de Mejora (+0 a +15)
- Las piezas pueden mejorarse desde `+0` hasta `+15`.
- **Hitos especiales:** Al alcanzar `+5`, `+10` y `+15` se desbloquean multiplicadores extra de atributos.
- **Sin penalización de destrucción:** Si una mejora falla, el objeto **no se destruye ni baja de nivel**; únicamente se consumen los materiales y el oro invertidos.
- **Piedra de Protección (Ítem Consumible):** Garantiza un 100% de éxito en la mejora seleccionada.

### 4.4. Venta y Protección de Objetos (QoL)
- **Venta directa:** Devuelve exactamente el 25% del valor de catálogo en Oro.
- **Ventana de Deshacer (Undo):** Al vender una pieza, aparece un banner temporal de 5 segundos que permite deshacer la venta y recuperar la pieza exacta con un toque.
- **Bloqueo / Candado de Ítem:** Cada pieza dispone de un botón de candado; un ítem bloqueado no puede ser vendido ni destruido hasta ser desbloqueado manualmente.
- **Capacidad:** Inventario limitado a 50 piezas de equipo. Si el inventario está lleno (50/50), no se permite comprar piezas nuevas ni reclamar del buzón hasta liberar espacio.

---

## 5. Árbol de Habilidades Pasivas

El árbol se compone de **4 ramas especializadas** con un mínimo de 10 nodos por rama (40+ habilidades en total):

1. **Rama Ataque (Fuerza Bruta):** Aumenta Daño Base, Probabilidad Crítica, Daño Crítico y penetración de defensa.
2. **Rama Defensa (Muro de Acero):** Aumenta Vida Máxima, Reducción de Daño, Resistencia Crítica y Anulación Crítica.
3. **Rama Fortuna (Rey del Botín):** Aumenta Ganancia de Oro (+%), Multiplicador de Materiales (+%) y Suerte.
4. **Rama Gloria (Técnica y Espíritu):** Aumenta Velocidad de Carga (+%), Esquiva (+%), Precisión (+%) y Potencia del Remate (+%).

- Todas las habilidades son **pasivas**.
- Se compran secuencialmente con Puntos de Habilidad ganados al subir de nivel.
- **Reseteo de Habilidades:** Permite recuperar el 100% de los puntos de habilidad invertidos a cambio de una tarifa en Gemas con confirmación previa.

---

## 6. Motor de Combate (Reglas de Simulación)

### 6.1. Simulación Determinista por Ticks
- El motor corre a pasos discretos de **50 ms simulados**.
- La simulación completa se genera a partir del estado de ambos luchadores y una **semilla numérica pseudoaleatoria (RNG)**.
- El resultado es 100% determinista: el modo velocidad normal (x1) y acelerado (x2) producen idéntico daño, eventos y ganador.

### 6.2. Ciclo de Acción y Ataque
1. En cada tick, la barra de acción de cada luchador avanza según su Velocidad:
   $$\text{Avance} = (8 + \text{Velocidad} \times 0.32) \times \text{Modificadores}$$
2. Al alcanzar 100 puntos, el luchador ejecuta un movimiento y su barra se descuenta en 100.
3. Si ambos luchadores alcanzan 100 en el mismo tick, actúa primero el de mayor velocidad (o el desempate por semilla RNG).

### 6.3. Resolución del Golpe
1. **Comprobación de Impacto:** $\text{Probabilidad} = \text{Precisión Atacante} - \text{Esquiva Defensor}$ (limitado entre 5% y 95%).
2. Si impacta, se calcula el Daño Base:
   $$\text{Daño Base} = \max(1, \text{ATK}_{\text{atacante}} \times \text{Poder Movimiento} - \text{DEF}_{\text{defensor}} \times 0.55)$$
3. Se aplica el factor de Ventaja/Desventaja de Clase (×1.12 o ×0.90 o ×1.00).
4. Comprobación de Golpe Crítico (si aplica, multiplicador ×2.0 menos mitigación por resistencia).
5. Variación de daño natural por semilla (entre 95% y 105%).
6. Resta de vida (HP) con límite inferior en cero.
7. **Remate:** Si el rival cae al $\le 20\%$ de vida y el atacante no ha usado su remate, su siguiente golpe es el Remate Especial (daño $\times 1.5$).

### 6.4. Final del Combate y Conteo
- Cuando la vida del rival llega a 0:
  - Se ejecuta la caída en la lona y el conteo del árbitro: **1... 2... 3... ¡KO!**
  - Existe una probabilidad base mínima (1%) de "Levantarse de la lona" con 1% de HP (máximo una vez por combate).
- **Límite de Tiempo:** A los 180 segundos simulados, si ninguno ha caído, gana el luchador con mayor porcentaje de vida restante.

---

## 7. Los Siete Eventos Diarios

El día operativo del juego comienza a las **06:00 (hora local del dispositivo)** y se divide en 7 bloques rotativos de 3 horas:

| Bloque Horario | Estado | Descripción |
|---|---|---|
| **06:00 – 09:00** | Evento 1 | Bloque Activo (Barajado diario) |
| **09:00 – 12:00** | Evento 2 | Bloque Activo (Barajado diario) |
| **12:00 – 15:00** | Evento 3 | Bloque Activo (Barajado diario) |
| **15:00 – 18:00** | Evento 4 | Bloque Activo (Barajado diario) |
| **18:00 – 21:00** | Evento 5 | Bloque Activo (Barajado diario) |
| **21:00 – 00:00** | Evento 6 | Bloque Activo (Barajado diario) |
| **00:00 – 03:00** | Evento 7 | Bloque Activo (Pertenece al día operativo anterior) |
| **03:00 – 06:00** | Descanso / Mantenimiento | Sin evento activo; cuenta regresiva al siguiente día |

### 7.1. Tipos de Eventos
1. **Torneo Relámpago:** Combates infinitos consecutivos contra rivales en ascenso hasta ser derrotado. Puntuación por victorias y tiempo.
2. **Derriba al Gigante:** 3 intentos de daño acumulado contra un Jefe Colosal con fases al 70%, 40% y 15% de HP.
3. **Maratón de Victorias:** Victorias suman +1, derrotas restan -1. Meta de 20 victorias netas.
4. **Supervivencia Extrema:** Oleadas continuas conservando la vida (cura 10% tras cada victoria).
5. **Golpe Maestro:** 10 intentos contra un saco de entrenamiento; solo puntúa el daño crítico más alto.
6. **Escalera al Cielo:** Tabla de 200 puestos de CPU. Vencer te sube puestos en la clasificación.
7. **Rey del Ring (Battle Royale):** 30 luchadores con entradas escalonadas; acumula eliminaciones y tiempo en el ring.

Los rivales de las tablas de clasificación son **Rivales Fantasma (CPU)** generados matemáticamente de forma limpia y transparente.

---

## 8. Torneos PVP de 32 Participantes

### 8.1. Salas de Combate

| Sala | Costo de Entrada | Moneda | Rango de Poder CPU | Bolsa Bruta (32 entr.) | Comisión Casa (20%) | Bolsa Neta Distribuible (80%) |
|---|---:|---|---|---:|---:|---:|
| **Bronce** | 500 | Oro | 80% – 120% del jugador | 16.000 Oro | 3.200 Oro | 12.800 Oro |
| **Plata** | 2.500 | Oro | 95% – 135% del jugador | 80.000 Oro | 16.000 Oro | 64.000 Oro |
| **Oro** | 25 | Gemas | 110% – 150% del jugador | 800 Gemas | 160 Gemas | 640 Gemas |

### 8.2. Reparto de la Bolsa al Top 7 (Suma = 100% de la Bolsa Neta)
- **1º Lugar (Campeón):** 50% (+ cualquier residuo por redondeo)
- **2º Lugar (Finalista):** 25%
- **3º Lugar (Semifinalista con mejor desempeño):** 10%
- **4º Lugar (Semifinalista):** 6%
- **5º Lugar (Mejor eliminado en cuartos):** 4%
- **6º Lugar (Segundo eliminado en cuartos):** 3%
- **7º Lugar (Tercer eliminado en cuartos):** 2%
- Puestos 8 al 32: 0% (Eliminados sin premio).

### 8.3. Apuestas entre Rondas
Antes de cada ronda propia, el jugador puede realizar una apuesta opcional en Oro sobre su propia victoria para duplicar el importe apostado si gana la ronda.

---

## 9. Interfaz, Accesibilidad y Experiencia Profesional (Game Feel)

### 9.1. Regla de Oro: Cero Scroll Vertical
- El contenedor `#app` tiene dimensiones fijas `width: min(100%, 540px)` y `height: 100dvh`.
- Todo menú, tienda, inventario o lista de logros utiliza **rejillas paginadas de tamaño fijo (4 a 6 elementos por página)**.
- Se prohíbe el desbordamiento vertical u horizontal en cualquier resolución móvil (desde 320×568 hasta 412×915).

### 9.2. Feedback Táctil y Háptico por Capas (*Juice*)
- **Toque de botón interactivo:** Micro-click háptico (5 ms).
- **Golpe regular:** Micro-vibración (10 ms) + destello visual tenue.
- **Golpe crítico:** Vibración doble (20 ms + 20 ms) + micro-sacudida de pantalla (3px) + número dorado ampliado.
- **Rematadora:** Pausa dramática (*hit-stop* de 80 ms) + banner flotante «¡REMATADORA!» + vibración sostenida.
- **KO / Victoria:** Campana clásica de lucha (*Ding-Ding-Ding*) + fanfarria + vibración de triunfo.

---

## 10. Alcance: Funcionalidades Incluidas vs. No Incluidas

### ✅ Incluidas en esta versión (Local / PWA)
- Portada, selector de 4 clases y tutorial interactivo de 2 minutos.
- Panel principal con retrato, estadísticas y tarjeta de combate.
- 6 pestañas principales con navegación inferior y badges de aviso.
- Campaña infinita contra rivales y jefes cada 5 victorias.
- Sistema completo de 7 huecos de equipo, 6 rarezas, mejoras +0 a +15 y 12 sets.
- Árbol de 40+ habilidades pasivas en 4 ramas.
- Motor de combate determinista 50ms con remates y conteo KO.
- 7 eventos diarios rotativos con horarios locales y rivales fantasma deterministas.
- Torneos PVP de 32 luchadores con apuestas y reparto de bolsa.
- Tienda diaria/semanal, 7 misiones diarias, 5 semanales, 100+ logros y buzón.
- Guardado local atómico con doble copia (`current` y `backup`), exportación e importación JSON.
- Soporte PWA instalable con funcionamiento 100% offline.

### ❌ No Incluidas (Fuera de Alcance para esta versión local)
- Servidor backend centralizado o base de datos en la nube.
- Autenticación con cuentas de usuario, redes sociales o contraseñas.
- PVP sincrónico en tiempo real contra jugadores humanos en red.
- Microtransacciones con dinero real o pasarelas de pago.
- Anuncios publicitarios en video o banners de terceros.
