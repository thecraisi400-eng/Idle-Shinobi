# 🥊 PLAN DEL JUEGO — LUCHA LIBRE (combate automático)

> **Generado:** 2/9/2026, 16:00:25
> **Progreso:** 442/450 preguntas respondidas (100%)
> **Adaptativo:** 8 preguntas quedaron ocultas porque no aplican según tus respuestas.

| Bloque | Respondidas | Pendientes |
|---|---|---|
| 🥊 Fundamentos y Combate | 90/90 | 0 |
| 💰 Economía e Interfaz | 86/86 | 0 |
| 🦾 Héroe, Equipo y Habilidades | 87/87 | 0 |
| 🏟️ Eventos y PVP | 90/90 | 0 |
| 🛒 Tienda, Datos y Extras | 89/89 | 0 |

---
# 🥊 BLOQUE: FUNDAMENTOS Y COMBATE
_Identidad del juego, motor de lucha, estadísticas, progresión, luchadores y enemigos._

## 🥊 Grupo 01 — Núcleo del Juego  (15/15)
_La identidad y el bucle central: qué tipo de juego es, su ritmo y sus reglas madre._

**01.01 · ¿Cuál será el corazón de tu juego?**
_Define cuánta atención exigirá: mientras más automático, más tipo idle (progreso pasivo)._
- ✅ **Autobatalla + eventos vivos** — Bucle idle alimentado por eventos diarios y torneos PVP que rompen la rutina.

**01.02 · ¿Cuánto durará una lucha automática estándar?**
_El ritmo base del juego. Duraciones cortas dan sensación de avance rápido; largas dan peso dramático._
- ✅ **Variable + acelerable** — Como el anterior, pero con botones 1x/2x/3x e incluso salto instantáneo.

**01.03 · ¿Qué recibe el jugador por cada victoria?**
_La recompensa base define la motivación. Esto es el esqueleto; los números finos van en Economía._
- ✅ **Oro + XP** — El clásico: dinero para comprar y experiencia para subir de nivel.

**01.04 · ¿Qué pasa cuando el jugador pierde una lucha?**
_Define qué tan castigador es el juego. En idle conviene castigar poco para no frustrar._
- ✅ **No avanzas de rival** — Quedas trabado con ese rival hasta poder vencerlo (muro de poder).

**01.05 · ¿El juego progresa con la app cerrada (offline)?**
_Los idle viven del offline: el jugador vuelve y cobra lo que su luchador ganó sin él._
- ✅ **No hay progreso offline** — Solo ganas con la app abierta. Lo más simple.

**01.06 · ¿Habría racha de victorias y qué efecto tendrá?**
_Las rachas premian jugar seguido y agregar emoción a lo automático._
- ✅ **No habrá rachas** — Cada lucha es independiente. Simple y plano.

**01.07 · ¿Habrán límites para luchar (energía)?**
_La energía limita sesiones maratón y crea hábito diario; sin ella se puede jugar sin parar._
- ✅ **Sin ningún límite** — Luchas infinitas siempre. Lo más idle y generoso.

**01.08 · ¿Cuál será el nivel máximo del héroe?**
_Define el largo del juego y si necesitará sistemas de renacer para no morir en el tope._
- ✅ **Sin nivel máximo** — El nivel sube para siempre, con costes cada vez mayores.

**01.09 · ¿Qué estética visual tendrá el juego?**
_El estilo gráfico marca la personalidad: clásico, moderno, retro o de cómic._
- ✅ **Ring clásico** — Lona blanca, cuerdas rojas, focos cálidos: estética WWE clásica.

**01.10 · ¿Cuánta narrativa y personalidad tendrán los rivales?**
_La historia no es obligatoria, pero da alma: hace que quieras vencer a alguien en particular._
- ✅ **Sin historia** — Solo números y luchas. Lo más funcional.

**01.11 · ¿En qué idiomas estará el juego?**
_Aunque hoy lo harás en español, conviene decidir si el texto estará preparado para traducir._
- ✅ **Solo español** — Todo el texto del juego en español, sin más opciones.

**01.12 · ¿Cómo se comporta la orientación de pantalla?**
_Tu juego es vertical; hay que decidir qué pasa si el móvil gira a horizontal._
- ✅ **Vertical inteligente** — El juego detecta el dispositivo y optimiza su layout solo.

**01.13 · ¿A qué tipo de jugador apunta el juego?**
_Esto calibra todos los números: un casual necesita avances rápidos; un hardcore, profundidad._
- ✅ **Hardcore optimizador** — Muchas cifras, builds y sistemas entrelazados para min-max.

**01.14 · ¿Cómo será el tutorial de la primera partida?**
_Con 450 opciones configurables, el tutorial decide si el jugador entiende o se pierde._
- ✅ **Guía forzada de 8 pasos** — Los primeros minutos te llevan de la mano pantalla por pantalla.

**01.15 · ¿Qué nombre llevará el juego?**
_El nombre es la marca. Estas son propuestas acordes a la lucha libre automática._
- ✅ **Oro y Gloria** — Evoca las dos recompensas del juego: riqueza y cinturones.

## ⚔️ Grupo 02 — Motor de Combate  (15/15)
_Cómo se simula cada lucha automática: fórmulas, turnos, críticos, estados e IA._

**02.01 · ¿Cómo se resuelve cada lucha internamente?**
_Es el motor invisible que decide golpes y ganador. Afecta todo lo demás del combate._
- ✅ **Ticks en tiempo real** — Cada 0.5s los luchadores intercambian golpes según velocidad y stats.

**02.02 · ¿Qué velocidad de simulación ofrecerá la vista de lucha?**
_Ver cada lucha completa cansa tras 100 victorias; poder acelerar mantiene el ritmo._
- ✅ **1x y 2x** — Botón para duplicar la velocidad de la animación.

**02.03 · ¿Cómo se calcula el daño de cada golpe?**
_La fórmula madre del combate: define si las estadísticas de defensa valen la pena._
- ✅ **Con crítico y tipos** — Varianza + golpes críticos + tipos de golpe (potencia/técnica/agilidad).

**02.04 · ¿Existirán golpes críticos?**
_El crítico es la chispa del combate automático: momentos de sorpresa que cambian peleas._
- ✅ **5% de probabilidad, daño x1.5** — Poco frecuente pero sabroso. Equilibrado.

**02.05 · ¿Habrán estados alterados en combate?**
_Aturdir, sangrar, quemar: capas de estrategia que enriquecen la lucha automática._
- ✅ **8 estados completos** — Los 4 anteriores + Curación por turno, Escudo, Debilitado y Vendido (recibe +crítico).

**02.06 · ¿El jugador puede hacer algo durante la lucha?**
_Tu juego es automático, pero se puede dar intervención opcional sin romper esa filosofía._
- ✅ **Nada: puro espectador** — Ves la lucha como un espectáculo; cero botones. 100% idle.

**02.07 · ¿Qué inteligencia usarán los rivales (IA)?**
_Cómo decide la CPU a quién golpear y cuándo usar su especial. Afecta la sensación de reto._
- ✅ **Personalidades únicas** — Cada luchador tiene rasgos (agresivo, oportunista, defensivo) que cambian su estilo.

**02.08 · ¿Puede haber empates y cómo se resuelven?**
_Con dos barras de vida idénticas al acabarse el tiempo, hay que definir un desempate._
- ✅ **Decisión de jueces** — Los jueces puntúan agresividad y técnica; el sistema premia al mejor luchador.

**02.09 · ¿Cómo será la barra de vida en combate?**
_Una sola barra o segmentos: cambia cómo se lee la lucha de un vistazo._
- ✅ **Barra única clásica** — Una barra roja que baja de 100% a 0%. Clara y simple.

**02.10 · ¿Habrán mecánicas de fatiga o resistencia en la lucha?**
_Simula el cansancio real: quien golpea sin parar se agota._
- ✅ **Fatiga por actividad** — Golpear y usar especiales genera cansancio que baja tu velocidad de golpe.

**02.11 · ¿Cómo puede terminar una lucha?**
_Condiciones de victoria: no todo tiene por qué ser bajar la barra a cero._
- ✅ **Condiciones múltiples** — Según el modo: KO, límite, caídas, descalificación por objeto ilegal en eventos.

**02.12 · ¿Se guardarán repeticiones (replays) de las luchas?**
_Revivir un KO épico o analizar una derrota: valor extra para el jugador._
- ✅ **Sin repeticiones** — La lucha pasa y ya. Ahorro de memoria.

**02.13 · ¿Qué registro (log) de combate se mostrará?**
_El log explica POR QUÉ perdiste: transparencia que ayuda a mejorar tu build._
- ✅ **Log detallado** — Lista por rondas con daño, críticos y estados aplicados, plegable.

**02.14 · ¿Cómo se muestran los números de daño durante la lucha?**
_El feedback numérico hace visible el poder de tu build en cada golpe._
- ✅ **Totalmente configurables** — Activables, con tamaño ajustable y modo resumen (solo totales por ronda).

**02.15 · ¿El combate tendrá comentario o narrador textual?**
_Un narrador da vida de transmisión deportiva a las luchas automáticas._
- ✅ **Sin narrador** — Solo acción visual y números.

## 💪 Grupo 03 — Estadísticas del Luchador  (15/15)
_Las estadísticas base: cuáles son, cómo se llaman, cómo escalan y se combinan._

**03.01 · ¿Cuántas estadísticas base tendrá un luchador?**
_Menos estadísticas = más fácil de entender; más = más profundidad de build._
- ✅ **10 estadísticas** — Todo lo anterior + Aguante y Carisma (economía). Nivel estratega.

**03.02 · ¿Qué nombres tendrán las estadísticas?**
_El sabor: nombres de RPG genérico o identidad 100% lucha libre._
- ✅ **Identidad de lucha** — Potencia, Aguante, Técnica, Agilidad, Carisma: suena a luchador real.

**03.03 · ¿Qué efecto tendrá la velocidad/agilidad?**
_La estadística más tricky: decide si ser rápido es tan valioso como ser fuerte._
- ✅ **Las tres cosas** — Orden, esquiva y carga: estadística premium muy codiciada.

**03.04 · ¿Cómo se determina la probabilidad de crítico?**
_Fija para todos o dependiente de build: define si el crítico es estrategia o suerte._
- ✅ **Fija para todos** — Todos critican igual (10%): ni equipo ni stats lo cambian.

**03.05 · ¿En qué rango empiezan las estadísticas en nivel 1?**
_La escala numérica: números chicos son legibles; números gigantes dan sensación de poder._
- ✅ **10–25 puntos** — Escala contenida con margen para diferencias entre stats.

**03.06 · ¿Cómo se calcula la vida total del luchador?**
_Vida fija por nivel, stat directa o mezcla con la clase._
- ✅ **Stat de vida directa** — Subes la vida con oro como cualquier stat.

**03.07 · ¿Habrán estadísticas derivadas (ocultas)?**
_Valores calculados a partir de las base, como esquiva o precisión._
- ✅ **Ninguna** — Lo que ves es lo que hay. Transparencia total.

**03.08 · ¿Se verán todas las estadísticas del rival?**
_Información es poder: saber qué esperar cambia decisiones como equipo o pasivas._
- ✅ **Todo visible** — Nivel, stats y clase del rival siempre a la vista.

**03.09 · ¿Las estadísticas suben solas o las asignas tú?**
_El corazón de la pestaña HÉROE: control del jugador sobre su build._
- ✅ **Puntos libres** — Cada nivel da puntos que tú asignas donde quieras.

**03.10 · ¿Se podrá reasignar (resetear) los puntos asignados?**
_Cambiar de build sin empezar de cero: calidad de vida esencial._
- ✅ **No se puede** — Lo que asignaste es para siempre. Decide bien.

**03.11 · ¿Habrán techos (soft caps) en las estadísticas?**
_Evita que subir UNA sola estadística al infinito rompa el juego._
- ✅ **Tope por nivel** — Cada stat tiene tope que sube con tu nivel de héroe.

**03.12 · Si existe Carisma, ¿qué afectaría?**
_Una stat económica: el carisma del luchador como star power que atrae público y dinero._
- ✅ **Solo eventos** — Mejora tus puntos en eventos: el público vota al carismático.

**03.13 · ¿Subir de nivel dará bonus adicionales?**
_Premios de hito que hacen del subir de nivel un momento celebrado._
- ✅ **Solo las mejoras normales** — Nada extra: el nivel es solo progreso numérico.

**03.14 · ¿Se mostrará un índice de Poder total?**
_Un solo número que resume toda tu fuerza para compararte con rivales y jugadores._
- ✅ **Poder + comparación** — Tu poder junto al del rival con flecha de probabilidad de victoria.

**03.15 · ¿Las estadísticas tendrán tope máximo absoluto?**
_Decide si existe un cielo o el crecimiento es eterno (más idle)._
- ✅ **Sin tope + notación** — Crecen para siempre y los números usan notación 12.4K / 3.2M para leerse.

## 📈 Grupo 04 — Curva de Experiencia  (15/15)
_Cómo sube de nivel el héroe: fórmulas de XP, bonus y anti-grind._

**04.01 · ¿Qué fórmula usará la XP requerida por nivel?**
_Define el ritmo de subida: lineal sube constante, exponencial frena a largo plazo._
- ✅ **Cuadrática: 50 × nivel²** — Curva clásica RPG: nivel 10 cuesta 5.000, nivel 30 cuesta 45.000.

**04.02 · ¿Cuánta XP dará cada lucha?**
_De dónde viene la XP y qué la hace variar._
- ✅ **XP según nivel del rival** — Rivales más fuertes dan más XP: escala contigo.

**04.03 · ¿La XP de rivales se iguala a tu nivel?**
_Anti-grind: evita farmear rivales bajos para siempre._
- ✅ **XP escala contigo** — Los rivales antiguos suben de nivel con tu héroe y pagan igual.

**04.04 · ¿La racha de victorias dará bonus de XP?**
_Sin duplicar con el bonus de oro de la racha, evita inflación._
- ✅ **No afecta la XP** — La racha es solo de oro: la XP queda estable.

**04.05 · ¿El contenido estará bloqueado por nivel?**
_Puertas por nivel, por poder total o sin puertas._
- ✅ **Mixto** — Nivel para lo básico, poder para eventos y logros para lo élite.

**04.06 · ¿Cuánta información de la curva se muestra al jugador?**
_Transparencia de planificación: saber cuánto falta para el próximo nivel._
- ✅ **Barra + números** — Barra con cifras: 1.240/2.000 XP.

**04.07 · ¿Subir de nivel mejora automáticamente las stats?**
_Junto a G03: define cuánto del poder viene gratis y cuánto lo eliges tú._
- ✅ **Híbrido + punto libre** — Subida automática pequeña + 1 punto libre por nivel.

**04.08 · ¿Habrán eventos de doble XP?**
_Aceleradores que crean momentos de juego intensos._
- ✅ **Nunca** — La XP es sagrada y constante.

**04.09 · ¿Perder una lucha afecta la XP?**
_Castigo de pérdida enfocado solo a la XP, separado del oro._
- ✅ **Nunca quita XP** — Lo ganado está ganado. Lo más casual-amigable.

**04.10 · ¿Cómo se ganarán los puntos del árbol de habilidades?**
_La moneda interna de HABILIDAD: frecuencia de obtención._
- ✅ **Cada nivel** — 1 punto por nivel: a nivel 100 tienes 100 puntos.

**04.11 · ¿Se podrá comprar progreso de nivel con oro o gemas?**
_El eterno dilema: pagar para saltar grind._
- ✅ **No, jamás** — El nivel se gana luchando: puro mérito.

**04.12 · ¿Habrán boosters de XP en la tienda?**
_Pociones o items que aceleran la curva temporalmente._
- ✅ **No existen** — La tienda no vende nada de XP.

**04.13 · ¿Cómo se celebra subir de nivel?**
_El momento de dopamina del juego: cuánta fiesta merece._
- ✅ **Solo texto** — Un LEVEL UP discreto en pantalla.

**04.14 · ¿En qué nivel empieza el contenido avanzado?**
_Cuando eventos élite, PVP premium y tienda especial abren sus puertas._
- ✅ **Escalonado** — Eventos a 10, PVP a 20, tienda premium a 35, ligas a 50.

**04.15 · ¿La XP ganada se mostrará en cada victoria?**
_Feedback inmediato del progreso en la pantalla de resultados._
- ✅ **XP desglosada** — +24 XP con la barra del nivel moviéndose en vivo.

## 🤼 Grupo 05 — Tipos de Luchadores  (15/15)
_Clases, estilos con ventajas, apariencia, divisiones, jefes y campeones._

**05.01 · ¿Cuántas clases de luchador podrá elegir el jugador?**
_Tu héroe necesita un estilo: cada clase con fortalezas propias._
- ✅ **6 + subclases** — Al nivel 50 cada clase se bifurca en 2 subclases: 12 finales.

**05.02 · ¿Las clases tendrán ventajas entre sí?**
_El triángulo táctico: elegir clase también es apostar contra ciertos rivales._
- ✅ **Círculo completo** — Con 5+ clases cada una supera a dos y pierde contra dos.

**05.03 · ¿Los rivales usarán las mismas clases del jugador?**
_Define la variedad enemiga y si el triángulo aplica contra ti._
- ✅ **Sistema completo** — Plantel por zona + variantes + jefes con clase propia única.

**05.04 · ¿Se podrá cambiar de clase a mitad del juego?**
_Rejugabilidad sin perder progreso._
- ✅ **Nunca** — Tu clase es para siempre: la identidad del héroe.

**05.05 · ¿Se verá la clase del rival antes de luchar?**
_Información previa que permite preparar equipo y pasivas._
- ✅ **Icono + stats clave** — Su clase más sus 2 stats más altas.

**05.06 · ¿Habrán luchadores legendarios?**
_Variantes ultra raras con brillo propio: objetos de colección vivos._
- ✅ **No existen** — Todos los luchadores son de la misma calidad.

**05.07 · ¿Habrán luchas por equipos (tag team)?**
_El 2v2 clásico de la lucha libre como capa extra._
- ✅ **No habrá equipos** — Todo es 1 contra 1. Enfoque total.

**05.08 · ¿Cómo se generarán los nombres de los rivales?**
_Que cada rival se sienta único y con identidad._
- ✅ **Generador procedural** — Nombre + ciudad + apodo generados: millones de combinaciones.

**05.09 · ¿Cómo se verán los luchadores en pantalla?**
_El nivel visual de los personajes define el encanto del juego._
- ✅ **Sprites simples** — Luchador de cuerpo completo en pose de combate, 1 sprite por clase.

**05.10 · ¿Cuánta personalización visual tendrá TU héroe?**
_Que tu luchador se sienta tuyo desde el día 1._
- ✅ **Fijo** — Todos ven el mismo héroe genérico de su clase.

**05.11 · ¿Habrán rivalidades personales con rivales?**
_Enemigos recurrentes que le dan alma a tu carrera._
- ✅ **Rival con historia** — Un némesis que evoluciona contigo, con diálogos y revanchas.

**05.12 · ¿Cómo se organizará el avance por divisiones?**
_El mapa de carrera: de novato a leyenda._
- ✅ **6 + temporada** — Divisiones que renuevan su plantel cada temporada.

**05.13 · ¿Cada cuánto aparecerá un JEFE?**
_Los jefes rompen el ritmo y prueban tu build real._
- ✅ **Cada 10 luchas** — Ritmo arcade: jefe frecuente, siempre alerta.

**05.14 · ¿Qué recompensa dará vencer al Campeón de la división?**
_El premio máximo de cada división debe sentirse épico._
- ✅ **Solo oro grande** — Un pago contundente y ascenso automático.

**05.15 · ¿Habrán luchadores invitados rotativos?**
_Rivales especiales temporales que crean FOMO sano._
- ✅ **No habrá** — El plantel de rivales es siempre el mismo.

## 👹 Grupo 06 — Enemigos y Dificultad  (15/15)
_La curva de los rivales, muros, élites, jefes con mecánicas y anti-atasco._

**06.01 · ¿Cómo escalan las estadísticas de los rivales?**
_La curva enemiga: si crece más rápido que tú, muro; si menos, se vuelve trivial._
- ✅ **Exponencial 1.10^n** — Acompanha curvas de héroe exponenciales.

**06.02 · ¿Qué forma tendrá la curva de dificultad global?**
_El perfil emocional: subir sin darse cuenta o muros que exigen grind._
- ✅ **Dientes de sierra** — Sube, jefe duro, al pasar baja un poco y vuelve a subir: respiros.

**06.03 · ¿Habrán muros de dificultad intencionales?**
_Los muros obligan a usar TODOS los sistemas (equipo, pasivas, mejoras)._
- ✅ **Muros medibles** — Aviso más precisión: poder recomendado 4.500 · el tuyo 3.800.

**06.04 · ¿Cómo se elige al siguiente rival?**
_Control del jugador sobre a quién enfrentar._
- ✅ **Elige 1 de 3 tarjetas** — Se ofrecen 3 rivales con distinto riesgo/botín: tú decides.

**06.05 · ¿Se podrán repetir rivales ya vencidos para farmear?**
_El grind controlado: base de recursos sin romper el avance._
- ✅ **No se puede** — Cada rival se enfrenta una sola vez: el avance es lineal.

**06.06 · ¿Habrán rivales ÉLITE?**
_Versiones mejoradas y raras: emoción de aparición + botín superior._
- ✅ **5% de aparición** — Con aura y stats +30%: pagá x2 botín.

**06.07 · ¿El juego ayudará si te atascas perdiendo mucho?**
_Anti-frustración: detectar atasco y responder con ayuda escalonada._
- ✅ **Sin ayuda** — Te atascas hasta que mejores por cuenta propia.

**06.08 · ¿Habrán modos de dificultad globales?**
_Elegir reto a cambio de premios: riesgo recompensa macro._
- ✅ **Dificultad fija** — Un solo equilibrio para todos.

**06.09 · ¿Los jefes tendrán mecánicas especiales?**
_Más que stats grandes: jefes que exigen entender el juego._
- ✅ **Solo stats altas** — El jefe es un rival con números grandes. Simple.

**06.10 · ¿Se podrá inspeccionar la ficha completa de un enemigo?**
_Transparencia para planificar: ver exactamente contra quién pelearás._
- ✅ **Nivel + poder** — Su índice de poder comparado con el tuyo.

**06.11 · ¿Habrán modos infinitos (endless)?**
_Contenido sin fin tras terminar la estructura principal._
- ✅ **Torre infinita** — Pisos cada vez más difíciles con récord de piso máximo.

**06.12 · ¿Qué información del rival se muestra en el selector?**
_El dato visible antes de confirmar la lucha._
- ✅ **Nivel + poder** — Nivel más su índice de poder con semáforo verde/amarillo/rojo.

**06.13 · ¿Los rivales tendrán variabilidad aleatoria?**
_Que dos rivales del mismo tipo no sean clones perfectos._
- ✅ **Rasgos + rareza de rasgos** — Rasgos comunes, raros y épicos que pueden combinarse en un rival.

**06.14 · ¿Habrá luchas contra grupos o escuadrones?**
_Oleadas y tríos como variedad de formato._
- ✅ **No habrá** — Siempre luchas 1 contra 1, sin formatos de grupo.

**06.15 · ¿El plantel de rivales se renovará por temporadas?**
_Mantener el juego vivo en el largo plazo._
- ✅ **Comunidad + balance** — Rotación + ajuste de stats según estadísticas globales de victorias.

---
# 💰 BLOQUE: ECONOMÍA E INTERFAZ
_Oro, gemas, monedas especiales, panel principal, arena de lucha y barra de carga._

## 💰 Grupo 07 — Economía: Oro  (14/14)
_El dinero base: cuánto se gana, por qué y en qué se gasta._

**07.01 · ¿Cuánto oro pagará una victoria estándar?**
_La escala salarial del juego: calibra todos los precios de tienda y mejoras._
- ✅ **Según nivel del rival** — Base × nivel: escala contigo automáticamente.

**07.02 · ¿Cuánto oro tendrá el jugador en su primera hora?**
_El arranque: si el inicio es pobre, el juego se siente lento y tacaño._
- ✅ **~500 de oro** — Para 2-3 compras pequeñas: paciencia inicial.

**07.03 · ¿Los precios crecerán con tu progreso (inflación)?**
_Si los precios escalan igual que el oro, la sensación de riqueza es falsa._
- ✅ **Precios fijos** — Lo que costaba 500 cuesta 500 por siempre: el oro se devalúa, te sientes rico.

**07.04 · ¿Se gana algo de oro al perder?**
_El consuelo de derrota: suaviza la frustración del muro._
- ✅ **25% del pago** — Un pago de consolación por haber luchado.

**07.05 · ¿La primera victoria contra cada rival pagará extra?**
_Bonus de descubrimiento: premia avanzar en vez de farmear lo mismo._
- ✅ **No hay extra** — Todas las victorias pagan igual.

**07.06 · ¿La racha de victorias multiplicará el oro?**
_Conexión directa con la racha definida en el Grupo 1._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**07.07 · ¿Habrán botines de oro aleatorios extra?**
_Chispas de fortuna: pagos extra inesperados._
- ✅ **No existen** — El pago es siempre el esperado.

**07.08 · ¿Habrán cofres o sobres con oro?**
_Paquetes de recompensa que se abren: dopamina de apertura._
- ✅ **No habrá cofres** — El oro solo viene de luchas.

**07.09 · ¿Existirán pérdidas o costes de oro obligatorios?**
_Sumideros forzosos que quitan oro (mantienen la economía activa)._
- ✅ **Ninguno** — Nadie te quita oro jamás.

**07.10 · ¿Se podrán convertir monedas entre sí?**
_Cambiar oro por gemas o viceversa, y con qué castigo._
- ✅ **Sin conversión** — Cada moneda se gana en su canal.

**07.11 · ¿Cuál será el gasto principal de oro?**
_Para qué servirá realmente el oro acumulado._
- ✅ **Todo el sistema** — Equipo, stats, entradas, mejoras de objetos, respec y mercado.

**07.12 · ¿Cómo escalarán los precios de la tienda?**
_La curva de precios de objetos a lo largo del juego._
- ✅ **Exponencial suave** — Precios que crecen 25% por tier: grind progresivo.

**07.13 · ¿Habrán días o eventos de bonus de oro?**
_Aceleraciones puntuales que mueven el hábito del jugador._
- ✅ **Nunca** — El oro es estable siempre.

**07.14 · ¿Los logros entregarán oro?**
_Premios de hito por incentivar conductas del juego._
- ✅ **Oro pequeño** — Cada logro paga una cantidad fija modesta.

**07.15 · ¿Con cuánto oro empieza una partida nueva?**
_El colchón inicial y si hay paquete de bienvenida._
- ✅ **100 de oro** — Para un consumible básico.

## 💎 Grupo 08 — Moneda Premium (Gemas)  (15/15)
_La moneda especial de pago/esfuerzo: cómo se gana, se gasta y se protege._

**08.01 · ¿Cómo se llamará la moneda premium?**
_Su nombre debe sentirse valioso y temático de lucha libre._
- ✅ **Gemas** — Clásico gamer: claro para todos.

**08.02 · ¿Cómo se obtendrá gratis esta moneda?**
_Debe ser DIFÍCIL de conseguir (tu requisito): definamos cuán difícil._
- ✅ **+ PVP top** — Solo acabando en puestos altos de torneo.

**08.03 · ¿Se podrá comprar con dinero real?**
_Tu juego puede ser 100% gratis o incluir compras._
- ✅ **Nunca** — Solo se consigue jugando: juego limpio.

**08.04 · ¿Cuál será el USO principal de las {g08q01}?**
_Definir su propósito central evita que se vuelvan un oro disfrazado._
- ✅ **Objetos exclusivos** — Comprar equipo premium único de la tienda.

**08.05 · ¿En qué cantidades se obtendrán las {g08q01}?**
_La escala de premios pequeños vs grandes._
- ✅ **1–5 por vez** — Escasez real: cada unidad duele.

**08.06 · ¿Qué precio en gemas tendrán los objetos premium?**
_La escala de precios vs las cantidades obtenibles._
- ✅ **Decenas (20–80)** — Asequible: se junta en días de juego.

**08.07 · ¿Habrán límites diarios de obtención?**
_Evita que el grind extremo rompa la escasez premium._
- ✅ **Sin límites** — El que juega 12h consigue mucho.

**08.08 · ¿Habrá regalo diario por entrar (login)?**
_El hábito diario premiado con moneda premium._
- ✅ **Racha creciente** — Día 1: 2 · Día 7: 20, al fallar se reinicia.

**08.09 · ¿Las {g08q01} servirán para entrar al PVP?**
_Entradas alternativas de torneo con moneda premium._
- ✅ **No participan** — El PVP solo se paga con oro, jamás con gemas.

**08.10 · ¿Qué proporción de la tienda será SOLO premium?**
_Cuánto contenido exclusivo de gemas existirá._
- ✅ **Premium por temporada** — Colección premium renovada por temporada coleccionable.

**08.11 · ¿Habrán devoluciones (cashback) al fallar mejoras?**
_Suavizar la pérdida en sistemas aleatorios pagados con gemas._
- ✅ **No hay cashback** — Lo gastado se pierde al fallar.

**08.12 · ¿Se podrán regalar o enviar gemas entre cuentas?**
_Solo relevante si habrá sensación social. También previene fraude._
- ✅ **No se pueden** — Cada quien gana las suyas: sin mercado negro.

**08.13 · ¿Cómo se protegerá al jugador de malgastarlas?**
_Confirmaciones y avisos para gastos importantes._
- ✅ **Sin protecciones** — Un toque y el gasto se ejecuta sin ningún aviso.

**08.14 · ¿Habrán logros de colección que paguen gemas?**
_Premios grandes de largo plazo por completar colecciones._
- ✅ **Colección de rivales** — Completar la ficha de cada zona paga gemas.

**08.15 · ¿Las gemas tendrán presentación especial en la UI?**
_Su imagen debe gritar valor: no es oro común._
- ✅ **Icono con brillo** — Animación sutil de destello.

## 🪙 Grupo 09 — Otras Monedas y Recursos  (12/12)
_Monedas especiales adicionales, materiales, fragmentos, tickets y su gestión._

**09.01 · ¿Cuántas monedas adicionales existirán además de oro y gemas?**
_Cada moneda extra necesita su función clara o se vuelve ruido._
- ✅ **Ninguna más** — Oro y gemas bastan: economía limpia.

**09.02 · ¿Cómo se llamará la moneda especial de prestigio?**
_La que NO se compra: se gana en eventos y logros duros._
- ⛔ **No deseo implementar esta pregunta**

**09.03 · ¿Cómo se obtendrá la {g09q02}?**
_Tu regla: difícil de conseguir. Definamos el canal exacto._
- ⛔ **No deseo implementar esta pregunta**

**09.04 · ¿Qué comprará la {g09q02}?**
_Su poder adquisitivo debe justificar el esfuerzo._
- ⛔ **No deseo implementar esta pregunta**

**09.05 · ¿Los eventos tendrán su propia moneda (tokens)?**
_Moneda exclusiva de eventos que luego se canjea._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**09.06 · ¿Habrán materiales de mejora para el equipo?**
_Recursos como fragmentos o minerales que exigen las mejoras de objetos._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**09.07 · ¿Cómo se obtienen los materiales de mejora?**
_Fuentes de materiales para que el grind tenga mapa._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**09.08 · ¿Habrán pociones y consumibles como recurso?**
_Objetos de un solo uso que alteran una lucha o economía._
- ✅ **Solo curativas** — Poción que arranca la lucha con +20% de vida.

**09.09 · ¿Habrán tickets de entrada como recurso?**
_Entradas para PVP o eventos especiales que se guardan y usan._
- ✅ **No habrá tickets** — Las entradas se pagan con moneda al momento.

**09.10 · ¿Cómo se mostrarán las monedas en pantalla?**
_HUD de riqueza: ver todo de un vistazo sin saturar._
- ✅ **Solo oro y gemas** — Las demás viven en su pantalla de origen.

**09.11 · ¿Las monedas de evento expiran?**
_Tokens que mueren al cerrar el evento o viven para siempre._
- ⛔ **No deseo implementar esta pregunta**

**09.12 · ¿Se podrán intercambiar monedas especiales entre sí?**
_Flexibilidad vs control estricto de cada moneda._
- ✅ **Sin intercambio** — Cada moneda es un mundo cerrado.

**09.13 · ¿Habrán generadores pasivos de recursos?**
_Minas o negocios que producen mientras no juegas (idle puro)._
- ✅ **No habrá** — Los recursos vienen solo de luchar.

**09.14 · ¿Habrán objetos para resetear estadísticas/builds?**
_El consumible del arrepentimiento estratégico._
- ✅ **No existen** — Los resets usan oro/gemas según lo ya decidido.

**09.15 · ¿Se podrá ver un desglose de TODOS los recursos?**
_La boveda: pantalla de inventario de monedas y materiales._
- ✅ **Lista simple** — Bóveda con cantidades de todo.

## 📊 Grupo 10 — Panel Principal (HUD)  (15/15)
_La pantalla de inicio: qué se ve, dónde y cómo se lee todo sin scroll._

**10.01 · ¿Qué mostrará la pantalla principal?**
_Es el centro de mando: de un vistazo debes saber cómo estás y qué hacer._
- ✅ **Mínimo: héroe + luchar** — Tu luchador, el botón de luchar y las monedas. Zen.

**10.02 · ¿Dónde se verán las estadísticas del héroe?**
_Tu requisito: el panel debe mostrar stats y nivel actual. Definamos el formato._
- ✅ **Mini-ficha compacta** — Nivel + las 4 stats base en una línea cada una.

**10.03 · ¿Qué irá en la barra superior?**
_El espacio más escaso de la pantalla: solo lo esencial._
- ✅ **Monedas + nivel** — Añade tu nivel de héroe a la cabecera.

**10.04 · ¿Cómo será la barra de menú inferior de 6 opciones?**
_Tu menú: HÉROE, EQUIPO, HABILIDAD, EVENTOS, LUCHA PVP y TIENDA._
- ✅ **Iconos + texto** — 6 botones con icono y nombre corto: imposible perderse.

**10.05 · ¿Dónde se mostrará el índice de Poder total?**
_El número que resume tu fuerza y se compara con rivales._
- ✅ **Junto al nivel** — Poder visible siempre en la cabecera del héroe.

**10.06 · ¿Habrá acceso rápido a la tienda desde el panel?**
_Atajos de compra sin navegar por el menú._
- ✅ **Sin atajos** — La tienda se abre solo desde el menú.

**10.07 · ¿Qué se verá del rival actual en el panel?**
_La anticipación de la próxima lucha en casa._
- ✅ **Tarjeta con poder** — Nombre, nivel, clase y poder con semáforo.

**10.08 · ¿El héroe tendrá animación en el panel principal?**
_Vida en la pantalla de descanso._
- ✅ **Respiración sutil** — Se mueve apenas: respira listo para luchar.

**10.09 · ¿Qué tema de colores tendrá la interfaz?**
_La identidad visual de TODAS las pantallas._
- ✅ **Oscuro clásico** — Negro/gris con acentos dorados: premium y sobrio.

**10.10 · ¿Cómo se notificarán las recompensas?**
_Cobrar premios debe ser claro y satisfactorio._
- ✅ **Toast compacto** — Burbujita inferior con icono y cantidad.

**10.11 · ¿Habrá un botón central de LUCHAR?**
_El corazón del juego en la pantalla principal._
- ✅ **Botón + auto** — Botón grande y un toggle de auto-encadenado junto a él.

**10.12 · ¿Se mostrará la agenda del día en el panel?**
_Eventos con horario fijo: el panel puede avisar qué viene._
- ✅ **Próximo evento** — Tarjeta con próximo evento y su cuenta regresiva.

**10.13 · ¿Las misiones diarias estarán visibles en el panel?**
_Recordatorio sutil de las tareas del día._
- ✅ **Contador simple** — 3/5 misiones de hoy con puntito.

**10.14 · ¿Cada pantalla tendrá su explicación de primera visita?**
_Tarjetas de ayuda contextual: nadie se pierde._
- ✅ **Sin ayudas** — Exploración libre, sin explicaciones guiadas.

**10.15 · ¿Habrá atajos de guardado desde el panel?**
_Tranquilidad: tu progreso está a salvo siempre._
- ✅ **Guardado paranoico** — Multi-capa: automático + botón + respaldo auto al cerrar.

## 🎪 Grupo 11 — Arena de Lucha (Visual)  (15/15)
_Dónde y cómo se ven las luchas: ring, luchadores, animaciones y resultados._

**11.01 · ¿Dónde se verán las luchas?**
_Tu requisito: pantalla dedicada que oculta el panel principal al entrar._
- ✅ **Escena + HUD inferior** — Arena arriba y tarjeta de datos compacta abajo.

**11.02 · ¿Cómo se representará el ring?**
_La geografía donde ocurre todo._
- ✅ **Ring + público** — Se ve la primera fila del público reaccionar.

**11.03 · ¿Cómo se verán los luchadores en la arena?**
_Representación de los combatientes durante la pelea._
- ✅ **Cuerpo + animaciones** — Golpe, daño, especial y KO animados por clase.

**11.04 · ¿Qué animación tendrá cada golpe?**
_El feedback de impacto: el alma del combate visual._
- ✅ **Sacudida + flash** — Además retrocede del golpe.

**11.05 · ¿La cámara tendrá movimiento?**
_Cine en el combate automático sin gastar espacio._
- ✅ **Cámara lenta** — El 10% de vida y el KO final van en slow motion.

**11.06 · ¿El público tendrá presencia?**
_La multitud: el ingrediente secreto de la lucha libre._
- ✅ **Siluetas** — Masas oscuras que se mueven.

**11.07 · ¿Los estados alterados se verán sobre el luchador?**
_Iconos claros de qué le pasa a cada uno._
- ✅ **No se muestran** — Los estados viven solo en el log.

**11.08 · ¿Cómo será la barra de vida en la arena?**
_Lectura instantánea del estado de la lucha._
- ✅ **Barras + retratos** — Con retratos incrustados estilo versus.

**11.09 · ¿La barra de carga del especial será visible en la arena?**
_Ver llenarse el momentum es la anticipación del combate._
- ✅ **Barra pequeña** — Barra fina justo debajo de la barra de vida.

**11.10 · ¿Qué marcador de tiempo/ronda se mostrará?**
_El reloj de la lucha: tensión y contexto._
- ✅ **Rondas + tiempo** — Ronda 2/3 con su tiempo propio.

**11.11 · ¿Cómo será la pantalla de VICTORIA?**
_El momento más repetido del juego: debe ser sabroso y rápido._
- ✅ **Banner + botín animado** — El oro y XP vuelan hacia tus contadores.

**11.12 · ¿Cómo será la pantalla de DERROTA?**
_Perder duele, pero bien presentado motiva a mejorar._
- ✅ **Instantánea** — Derrota y directo a reintentar.

**11.13 · ¿Qué transiciones habrá entre pantallas?**
_Fluidez entre panel → arena → resultado._
- ✅ **Fundido** — Suave fundido de 200 milisegundos entre pantallas.

**11.14 · ¿Habrá efectos de texto flotante en la arena?**
_Onomatopeyas y frases de combate._
- ✅ **Sin textos flotantes** — Solo los números de daño, sin palabras extra.

**11.15 · ¿Cada división tendrá su propio escenario?**
_Variedad visual que premia el avance._
- ✅ **Un solo escenario** — La arena es siempre la misma.

## 🔥 Grupo 12 — Barra de Carga (Momentum)  (15/15)
_Cómo se llena la barra, cuándo dispara el especial y qué hace._

**12.01 · ¿Qué concepto tendrá la barra de carga?**
_Tu requisito pediste barra de carga: definamos su identidad._
- ✅ **Medidor de momentum** — Se llena con la acción: es la fama del ring.

**12.02 · ¿Cómo se llena la barra?**
_La mecánica de carga: pasiva por tiempo o activa por acción._
- ✅ **Al golpear** — Cada golpe que das la sube: agresividad paga.

**12.03 · ¿Qué pasa al llenarse la barra?**
_El momento cumbre: quién decide cuándo._
- ✅ **Se activa sola** — 100% automático: coherente con tu juego.

**12.04 · ¿El especial será único por luchador?**
_Identidad del movimiento final._
- ✅ **Elegible + mejorable** — Elegible y evoluciona de nombre y poder con el uso.

**12.05 · ¿Qué potencia tendrá el especial?**
_Cuánto duele: define su momento dramático._
- ✅ **Golpe x1.5** — Fuerte pero no decisivo por sí solo.

**12.06 · ¿Los rivales también tendrán su barra?**
_Simetría del peligro: ellos también cargan._
- ✅ **Todos tienen** — Rivales con la misma mecánica: riesgo real.

**12.07 · ¿Se podrá robar o bajar el momentum del rival?**
_Guerra psicológica por la barra._
- ✅ **No interactúan** — Cada barra es un mundo totalmente separado.

**12.08 · ¿La barra tendrá niveles múltiples?**
_Cargar más allá de 100% para efectos mayores._
- ✅ **Un solo nivel** — Llenar la barra es usarla: simple y directo.

**12.09 · ¿El público influirá en la carga?**
_Conectar la barra con la fanaticada._
- ✅ **No influye** — La barra es pura mecánica.

**12.10 · ¿Los especiales tendrán sinergia con clases?**
_Ventajas de estilo aplicadas al momento cumbre._
- ✅ **Sin sinergia** — El especial funciona igual contra todos.

**12.11 · ¿Habrá cooldown tras usar el especial?**
_Ritmo post-clímax._
- ✅ **Arranca lenta** — Los primeros puntos tras usarla cargan al 50% de velocidad.

**12.12 · ¿El árbol de habilidades podrá mejorar la barra?**
_Inversión a largo plazo en tu mecánica estrella._
- ✅ **Rama completa** — Rama entera del árbol dedicada al momentum.

**12.13 · ¿Qué efecto visual acompañará el especial?**
_El espectáculo del finisher._
- ✅ **Flash simple** — Un destello y vuelta al combate.

**12.14 · ¿Se podrá elegir/configurar tu especial?**
_Tu sello personal en el ring._
- ✅ **Catálogo + evolución** — Desbloqueables que además evolucionan con 100 usos.

**12.15 · ¿El nombre del movimiento se mostrará al ejecutarlo?**
_El grito de guerra estilizado._
- ✅ **Texto pequeño** — Nombre discreto bajo el luchador.

---
# 🦾 BLOQUE: HÉROE, EQUIPO Y HABILIDADES
_Las 3 primeras pestañas del menú: mejora del héroe, equipamiento y árbol de pasivas._

## 🦾 Grupo 13 — HÉROE: Mejora de Stats  (15/15)
_La pestaña HÉROE: cómo se mejoran las estadísticas y su interfaz._

**13.01 · ¿Cómo será la interfaz de mejora de la pestaña HÉROE?**
_Tu visión: pantalla dedicada a subir estadísticas. Definamos su layout exacto._
- ✅ **Lista simple con botones +** — Cada stat en fila con su botón de subir: directo.

**13.02 · ¿Cuánto costará subir cada punto de estadística?**
_La curva de precios de la mejora manual._
- ✅ **Coste creciente por stat** — Cada punto extra de una stat cuesta más que el anterior.

**13.03 · ¿Cuánto subirá cada punto comprado?**
_El rendimiento de tu inversión._
- ✅ **+1 fijo** — Cada punto suma 1: simple.

**13.04 · ¿Habrá límite de stats por nivel de héroe?**
_Evita que el oro recién ganado rompa el balance._
- ✅ **Tope por nivel** — Cada stat llega hasta nivel×10 hasta subir de nivel.

**13.05 · ¿Se mostrará el efecto exacto antes de comprar?**
_Saber qué compra: transparencia total._
- ✅ **Efecto en DPS** — Además cómo cambia tu poder total.

**13.06 · ¿Habrá un recomendador de build?**
_Asistente que sugiere dónde invertir según tu situación._
- ✅ **No habrá** — Las decisiones de build son 100% tuyas.

**13.07 · ¿Se podrán guardar builds predefinidas?**
_Perfiles de stats para cambiar según ocasión._
- ✅ **No habrá builds** — Una sola distribución vigente.

**13.08 · ¿Se compararán tus stats con el próximo rival aquí?**
_Tu pantalla de preparación pre-lucha._
- ✅ **Con ventaja marcada** — Cada stat con flecha verde/roja según ventaja.

**13.09 · ¿Habrá historial de mejoras y gasto?**
_Contabilidad de tu inversión._
- ✅ **Sin historial** — Lo gastado en mejoras queda invisible.

**13.10 · ¿Habrá botón de mejorar-todo equilibrado?**
_Subida pareja automática para comodidad._
- ✅ **Botón simple** — Reparte tu oro equitativamente entre todas.

**13.11 · ¿Se podrá deshacer una mejora reciente?**
_Botón de arrepentimiento inmediato._
- ✅ **No se puede** — Lo comprado está comprado (usa respec).

**13.12 · ¿Habrá maestrías por estadística?**
_Hitos de dedicación: subir mucho una stat abre bonus._
- ✅ **No habrá** — Las stats no dan más que su valor.

**13.13 · ¿Habrá builds recomendadas por clase?**
_Guías integradas para no expertos._
- ✅ **No hay guías** — Cada quien investiga su propio camino.

**13.14 · ¿Las compras grandes pedirán confirmación?**
_Protección contra toques errados con ahorros enteros._
- ✅ **Sin confirmación** — Un toque compra la mejora al instante.

**13.15 · ¿La pestaña HÉROE mostrará también el aspecto?**
_Tu requisito: sin personalización de ropa aquí. ¿Mostramos al luchador?_
- ✅ **Ficha completa** — Retrato animado + clase + división + récord W/L + título + rachas.

## 🚀 Grupo 14 — HÉROE: Mejoras Extra  (15/15)
_Sistemas adicionales del héroe: rangos, ascensos, títulos, mentores y auras._

**14.01 · ¿Habrá rangos para el héroe (D a S)?**
_Una capa de prestigio paralela al nivel numérico._
- ✅ **5 rangos fijos** — D, C, B, A, S con requisitos de stats.

**14.02 · ¿Habrá ascensión/renacer del héroe?**
_El sistema prestige: reiniciar por poder permanente._
- ✅ **No habrá** — El progreso es solo hacia adelante.

**14.03 · ¿Habrá entrenamientos especiales?**
_Mini-bonos permanentes comprables una vez._
- ✅ **No habrá** — Las stats son la única mejora.

**14.04 · ¿Habrá títulos para el héroe?**
_Nombres de gloria con o sin efecto mecánico._
- ✅ **Sin títulos** — El héroe no lleva títulos.

**14.05 · ¿Habrá nivel de maestría de clase?**
_Dominar tu clase usando sus fortalezas._
- ✅ **No habrá** — La clase no progresa más allá de sus stats.

**14.06 · ¿Habrá mentores/trainers en el juego?**
_NPCs que potencian tu desarrollo._
- ✅ **No habrá** — Camino solitario: no hay personajes de apoyo.

**14.07 · ¿Habrá segundas oportunidades en combate?**
_Revivir o resistir el KO final._
- ✅ **No habrá** — KO es KO: no hay segundas oportunidades.

**14.08 · ¿Habrá sinergias entre estadísticas?**
_Combinaciones que valen más que la suma._
- ✅ **Sin sinergias** — Cada estadística trabaja de forma independiente.

**14.09 · ¿Habrá colección/bestiario de rivales vencidos?**
_El museo de tu carrera: fichas de a quiénes venciste._
- ✅ **No habrá** — Los rivales vencidos son pasado.

**14.10 · ¿El héroe tendrá rasgos de personalidad?**
_Carácter que otorga pequeños beneficios._
- ✅ **Mesa de rasgos** — Catálogo de 20 rasgos equipables con slots.

**14.11 · ¿Habrá modo leyenda/endgame del héroe?**
_Contenido para el héroe maduro._
- ✅ **No habrá** — El tope es el último campeón.

**14.12 · ¿Habrá bonus por tiempo jugado (veterano)?**
_Premiar la lealtad de largo plazo._
- ✅ **No habrá** — El tiempo no regala nada.

**14.13 · ¿La apariencia del héroe mostrará su poder?**
_Auras y detalles visuales de estatus._
- ✅ **Completamente escalable** — 5 capas visuales de estatus combinables.

**14.14 · ¿Habrá estadísticas de carrera del héroe?**
_El récord histórico: la vida del luchador en números._
- ✅ **Solo W/L** — Ganadas y perdidas globales.

**14.15 · ¿Se podrá tener más de un héroe?**
_Rotación de personajes o uno solo._
- ✅ **Un solo héroe** — Identidad única: es EL juego.

## 🎽 Grupo 15 — EQUIPO: Tipos y Rareza  (14/14)
_Los objetos: slots, rarezas, sets, substats y Drops exclusivos._

**15.01 · ¿Cuántos slots de equipamiento tendrá el héroe?**
_Cada slot es una pieza del luchador y una decisión de build._
- ✅ **8 slots** — Todo lo anterior + toalla (consumible recargable) y Manager (bonus %).

**15.02 · ¿Cuántos niveles de rareza tendrá el equipo?**
_La escala de emoción del botín._
- ✅ **6 + variantes** — Rarezas con variantes (+, ++) dentro de la misma.

**15.03 · ¿Qué colores identificarán cada rareza?**
_El código visual universal del loot._
- ✅ **Clásico** — Gris, verde, azul, morado, dorado: estándar gamer.

**15.04 · ¿Habrá sets de equipo con bonus?**
_Colecciones que premian vestir completo._
- ✅ **Sin sets** — Cada pieza vale por sí misma.

**15.05 · ¿Los objetos tendrán nivel propio?**
_Un objeto nuevo vs uno viejo mejorado._
- ✅ **Nivel + estrellas** — Doble eje de mejora: nivel y despertar.

**15.06 · ¿Habrá substats aleatorias en los objetos?**
_Stats secundarias que hacen cada pieza única._
- ✅ **Sin substats** — El objeto da exactamente lo que anuncia.

**15.07 · ¿Habrá objetos exclusivos de jefes?**
_Trofeos de caza mayor._
- ✅ **No habrá** — El botín de jefe es solo oro/gemas.

**15.08 · ¿Habrá objetos legendarios con pasiva propia?**
_Piezas únicas que hacen algo especial, no solo stats._
- ✅ **No habrá** — Todo el equipo es de stats puras.

**15.09 · ¿Cómo se generarán los nombres de los objetos?**
_Identidad del loot._
- ✅ **Genéricos** — Máscara de cuero, botas duras: funcional.

**15.10 · ¿Habrá requisitos para equipar objetos?**
_Puertas de acceso al equipamiento._
- ✅ **Mixto completo** — Nivel + división + clase según tier del objeto.

**15.11 · ¿Habrá economía de trade-offs en las piezas?**
_Objetos con ventaja Y desventaja: decisiones difíciles._
- ✅ **Con builds exóticas** — Combinaciones de contras que se vuelven builds alternativas válidas.

**15.12 · ¿El equipo se verá sobre tu luchador?**
_Vestir la máscara comprada y VERLA puesta._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**15.13 · ¿Habrá equipo exclusivo de eventos y PVP?**
_Premios que no se consiguen en campaña: estatus._
- ✅ **No habrá** — Todo el equipo viene de campaña/tienda.

**15.14 · ¿Habrá colección/dex de objetos?**
_El museo del equipamiento._
- ✅ **No habrá** — Sin registro de lo visto.

**15.15 · ¿Qué tan generoso será el drop de equipo?**
_La frecuencia con que caen piezas nuevas._
- ⛔ **No deseo implementar esta pregunta**

## 🧰 Grupo 16 — EQUIPO: Gestión  (14/14)
_Mejorar, vender, fusionar y organizar el inventario de equipamiento._

**16.01 · ¿Cómo se mejorarán los objetos equipados?**
_Tu requisito: mejorar el equipamiento. Definamos su coste._
- ✅ **Oro + material** — Oro más el material de mejora del tier.

**16.02 · ¿Hasta qué nivel se mejora un objeto?**
_El techo de mejora por pieza._
- ✅ **Sin tope** — Mejora infinita con costes crecientes.

**16.03 · ¿Qué objetos se podrán vender?**
_Reglas de venta del inventario._
- ✅ **Con confirmación** — Venta siempre pregunta primero.

**16.04 · ¿Qué porcentaje del valor pagará la venta?**
_El castigo del mercado de segunda mano._
- ✅ **25%** — Venta punitiva: pensar antes de comprar.

**16.05 · ¿Habrá venta rápida masiva?**
_Limpiar el inventario de chatarra en un toque._
- ✅ **Auto-venta configurable** — Regla permanente: lo gris se vende solo al caer.

**16.06 · ¿Se podrán fusionar duplicados?**
_El destino útil de las repeticiones._
- ✅ **No se fusionan** — Los duplicados son solo para vender.

**16.07 · ¿Se podrán rerollear las substats?**
_Re-mostrar los dados de las stats secundarias._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**16.08 · ¿Se podrán desmontar objetos en materiales?**
_Reciclaje: chatarra convertida en recursos de mejora._
- ✅ **No se desmonta** — Vender o guardar: no hay tercera vía.

**16.09 · ¿El inventario tendrá límite?**
_Gestión del espacio: obliga a decidir._
- ✅ **100 espacios** — Tope fijo y suficientemente generoso.

**16.10 · ¿Cómo se ordenará y filtrará el inventario?**
_Encontrar LA pieza entre decenas rápido._
- ✅ **Ordenar por** — Botón ordenar: rareza, nivel o novedad.

**16.11 · ¿Habrá equipar-mejor automático?**
_El botón perezoso inteligente._
- ✅ **Por stat objetivo** — Optimiza la stat que elijas (toda a ATK).

**16.12 · ¿La comparación lado a lado al equipar?**
_Ver qué gana y qué pierde antes de cambiar._
- ✅ **Delta simple** — Muestra el +12 ATK / −8 DEF resultante.

**16.13 · ¿Se podrá marcar objetos como favoritos?**
_Protección y organización personal._
- ✅ **Sin marcas** — Todos los objetos iguales de tratables.

**16.14 · ¿Habrá registro de mejoras de objetos?**
_Historial de inversión por pieza._
- ✅ **Sin registro** — Mejorar no deja ningún rastro del gasto.

**16.15 · ¿Quitar equipo tendrá algún coste o condición?**
_La fricción de desvestir piezas._
- ✅ **Gratis siempre** — Quitar y poner libremente.

## 🌳 Grupo 17 — HABILIDAD: Árbol  (15/15)
_La estructura del árbol de habilidades pasivas y su economía._

**17.01 · ¿Qué estructura tendrá el árbol de pasivas?**
_Tu requisito: habilidades pasivas desbloqueables. Definamos su forma._
- ✅ **Multi-árbol** — Varios árboles por categoría con puente entre ellos.

**17.02 · ¿Cuántas ramas principales tendrá?**
_Organización temática del poder pasivo._
- ✅ **6 ramas** — + PVP (premios y entradas).

**17.03 · ¿Qué moneda gastará el árbol?**
_Puntos por nivel, la {g09q02}, o mixto._
- ✅ **Puntos de nivel** — 1 punto por nivel de héroe: puro progreso.

**17.04 · ¿Cómo se desbloquean los nodos?**
_Reglas de acceso dentro del árbol._
- ✅ **Mixto** — Padre + tier + algún hito especial en keystones.

**17.05 · ¿Se podrá respecar el árbol?**
_Recomprar los nodos y redistribuir._
- ✅ **No se puede** — Todos los nodos del árbol valen lo mismo.

**17.06 · ¿Cuántos tiers de profundidad tendrá cada rama?**
_La altura del árbol: qué tan lejos se llega._
- ✅ **Infinito** — Tiers infinitos con coste exponencial.

**17.07 · ¿Habrá nodos keystone (piedra angular)?**
_El nodo final de rama que define builds._
- ✅ **Con evolución** — La keystone evoluciona cumpliendo condiciones.

**17.08 · ¿Cuántos puntos totales existirán en el juego?**
_La inflación de puntos vs el coste del árbol._
- ✅ **Justo (~200)** — Casi todo el árbol con sacrificios.

**17.09 · ¿Cómo escalará el coste de los nodos?**
_La curva de precios dentro del árbol._
- ✅ **Por tier** — Tier 1: 1 punto · Tier 2: 2 · Tier 3: 3.

**17.10 · ¿Se mostrará el efecto acumulado por rama?**
_Resumen de lo que tu rama te está dando._
- ✅ **No se muestra** — Cada nodo es un grano suelto.

**17.11 · ¿Los nodos tendrán varios niveles (2/5)?**
_Nodos que se compran varias veces para profundizar._
- ✅ **Con overcharge** — Tras el nivel máximo, sobrecarga cara para min-maxers.

**17.12 · ¿Habrá sinergias entre ramas?**
_Premios por invertir en varias ramas a la vez._
- ✅ **Sin sinergias** — Cada rama es un túnel independiente.

**17.13 · ¿El árbol se desbloqueará por nivel?**
_Las puertas de acceso al árbol._
- ✅ **Por ramas** — Cada rama abre a niveles distintos.

**17.14 · ¿Habrá prestigio del árbol?**
_Reset del árbol con ganancia permanente: la capa profunda._
- ✅ **No habrá** — El árbol no se reinicia jamás.

**17.15 · ¿Se podrán ver los nodos bloqueados?**
_Planificar el futuro del árbol._
- ✅ **Con requisitos** — Bloqueados + qué se necesita para abrirlos.

## ✨ Grupo 18 — HABILIDAD: Pasivas  (14/14)
_La lista concreta de pasivas, sus valores bajos y sus topes anti-rotura._

**18.01 · ¿Cuántas pasivas totales tendrá el árbol?**
_Tu pedido: GRAN cantidad de pasivas. Definamos la cifra._
- ✅ **150+ con adiciones** — Catálogo gigante + 10 nuevas por temporada.

**18.02 · ¿Qué magnitud tendrán los valores de las pasivas?**
_Tu regla: valores BAJOS, sin exagerar. Definamos el tope por nodo._
- ✅ **Creciente por tier** — Tier 1: 1% · Tier 3: 3% máximo.

**18.03 · ¿Habrá tope global de bonus pasivo?**
_Anti-rotura: que el árbol completo no rompa el juego._
- ✅ **Sin tope global** — Todo lo acumulado aplica tal cual.

**18.04 · ¿Qué pasivas ofensivas incluir?**
_El catálogo de ataque: elige la familia base._
- ✅ **+ penetración** — Las 3 + especial + penetración (ignora DEF).

**18.05 · ¿Qué pasivas defensivas incluir?**
_El catálogo de supervivencia._
- ✅ **+ escudo inicial** — Las 3 + empezar con escudo del X%.

**18.06 · ¿Qué pasivas económicas incluir?**
_Las favoritas del jugador idle._
- ✅ **Las 2 base** — Los eventos no reciben pasivas propias.

**18.07 · ¿Qué pasivas de eventos incluir?**
_Dedicadas a los 7 eventos diarios._
- ✅ **Ninguna** — Los eventos no tienen pasivas propias.

**18.08 · ¿Qué pasivas de PVP incluir?**
_Dedicadas a la arena de torneos._
- ✅ **Ninguna** — El PVP es campo nivelado.

**18.09 · ¿Qué pasivas de utilidad incluir?**
_Comodidades que mejoran la experiencia._
- ✅ **Ninguna** — El árbol es solo de combate y economía.

**18.10 · ¿Habrá pasivas condicionales?**
_Solo activas bajo condiciones: skill expression._
- ✅ **No habrá** — Todas las pasivas son constantes.

**18.11 · ¿Habrá pasivas con contrapartida (trade-off)?**
_Ganar mucho en algo perdiendo algo: decisiones sabrosas._
- ✅ **No habrá** — Ninguna pasiva resta nada.

**18.12 · ¿Habrá nodos SOLO comprables con moneda especial?**
_La élite del árbol, blindada del farmeo de puntos._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**18.13 · ¿Las descripciones mostrarán tu valor actual?**
_Descripciones vivas con números reales._
- ✅ **Con tu valor** — Muestra: +2% (tu total actual: +14%).

**18.14 · ¿El efecto de las pasivas será visible en la ficha?**
_Ver tu poder crecer en números tras comprar nodos._
- ✅ **En stats derivadas** — Se reflejan en el panel de derivadas.

**18.15 · ¿Habrá un resumen global de todas tus pasivas?**
_La vista aérea de tu build pasiva._
- ✅ **No habrá resumen** — Cada rama se ve por separado y ya.

---
# 🏟️ BLOQUE: EVENTOS Y PVP
_Los 7 eventos diarios con horarios, premios por puesto y la arena PVP de 32 con pozo._

## ⏰ Grupo 19 — EVENTOS: Estructura  (15/15)
_Los 7 eventos diarios: horario fijo por hora del móvil, duración e inscripción._

**19.01 · ¿Confirmamos 7 eventos diarios de 3 horas cada uno?**
_Tu diseño: 7 × 3h = 21h de eventos al día. Confirmemos la regla madre._
- ✅ **Sí: 7 de 3h** — Cada uno dura exactamente 3 horas y uno nuevo arranca al cerrar.

**19.02 · ¿A qué hora arrancará la rueda de eventos?**
_Las 21h necesitan una franja: la hora restante es descanso. Se usa TU hora local._
- ✅ **00:00 a 21:00** — Primer evento a medianoche, último cierra a 21:00.

**19.03 · ¿El orden de los 7 eventos será aleatorio cada día?**
_Tu regla: nunca el mismo orden. Definamos el algoritmo._
- ✅ **Aleatorio puro** — Cada día los 7 salen en orden totalmente al azar.

**19.04 · ¿El horario será visible desde el panel principal?**
_Anticipación: planificar tu día de juego._
- ✅ **Próximo evento en panel** — Tarjeta del próximo con cuenta regresiva.

**19.05 · ¿Cómo será la inscripción a un evento?**
_Tu diseño: eventos activos donde TU luchas. Definamos la entrada._
- ✅ **Botón unirse gratis** — Te inscribes cuando quieras dentro de las 3h.

**19.06 · ¿Cuántos intentos tendrá cada evento?**
_Cuántas veces puedes probar dentro de las 3 horas._
- ✅ **5 intentos** — El equilibrio estándar del género.

**19.07 · ¿Contra cuántos competidores se compara tu puntaje?**
_Tu diseño: tabla con CPU. Tamaño de la tabla._
- ✅ **50 competidores** — Tabla grande, viva y muy competitiva.

**19.08 · ¿Cómo se generan los puntajes de los rivales CPU?**
_Que la tabla sea desafiante pero alcanzable._
- ✅ **Aleatorio en banda** — Puntajes aleatorios alrededor de lo alcanzable por tu poder.

**19.09 · ¿Qué pasa si hay empate en el puesto?**
_Desempate de tabla._
- ✅ **Muerte súbita** — Intento extra de desempate.

**19.10 · ¿Se verá tu posición en vivo durante el evento?**
_La tabla que se mueve mientras juegas._
- ✅ **Con brechas** — Tabla + cuánto te falta para el de arriba.

**19.11 · ¿La dificultad del evento se adapta a ti?**
_Escalar con tu progreso para que siempre compita._
- ✅ **Fija global** — Mismos rivales para todos: sangriento para novatos.

**19.12 · ¿Habrán mini-guías dentro de cada evento?**
_Tu requisito: guía de qué hacer. Definamos su forma._
- ✅ **Tarjeta visual** — Cómo funciona en 3 iconos y 2 líneas.

**19.13 · ¿Habrán hitos internos además del puesto final?**
_Premios intermedios dentro del evento._
- ✅ **Solo puesto final** — Todo el premio al cerrar.

**19.14 · ¿Se guardará historial de eventos pasados?**
_Tu historial de participaciones._
- ✅ **Último evento** — Solo el resultado anterior.

**19.15 · ¿Habrán eventos destacados de la semana?**
_El evento de la semana con premios mejorados._
- ✅ **x2 los domingos** — Un tipo de evento elegido paga doble ese día.

## 🏟️ Grupo 20 — EVENTOS: Los 7 Tipos  (15/15)
_El diseño específico de cada uno de los 7 eventos competitivos diarios._

**20.01 · Evento 1: ¿cómo será el Torneo Relámpago?**
_Tu idea base: lucha encadenada con vida persistente entre rondas._
- ✅ **Escalera + jefe final** — La escalera termina en un jefe: cierre épico.

**20.02 · Evento 2: ¿cómo será el Asalto al Coloso?**
_Tu idea: un gigante con vida enorme; el daño que logras = tu puntaje._
- ✅ **1 intento, 90 segundos** — Un solo asalto contrarreloj para hacer el máximo daño.

**20.03 · Evento 3: ¿cómo será la Supervivencia?**
_Aguantar oleadas lo máximo posible._
- ✅ **Oleadas infinitas** — Resiste oleadas cada vez más fuertes: cuenta tu oleada máxima.

**20.04 · Evento 4: ¿cómo será la Carrera de KOs?**
_Máximos nocauts en tiempo limitado._
- ✅ **KOs en 3 minutos** — Cuántos rivales tumbas en 180 segundos.

**20.05 · Evento 5: ¿cómo será el Duelo de Leyendas?**
_Racha de victorias contra rivales cada vez mayores._
- ✅ **Escalera de rivales** — Ganas y el próximo es más fuerte: hasta perder.

**20.06 · Evento 6: ¿cómo será el Rey de la Montaña?**
_Defender tu posición contra aspirantes._
- ✅ **Sube y defiende** — Primero escala puestos ganando y luego los defiendes.

**20.07 · Evento 7: ¿cómo será el Concurso de Estilo?**
_Tu idea: los críticos y especiales dan puntos de estilo._
- ✅ **Críticos = puntos** — Solo los críticos puntúan: la build de critico reina aquí.

**20.08 · ¿La vida persiste entre luchas dentro de un evento?**
_La regla de curación en eventos multi-lucha._
- ✅ **Cura 30%** — Parcial: la resistencia importa.

**20.09 · ¿Los puntos serán por victoria o por margen?**
_Cómo se calcula tu puntaje._
- ✅ **Solo por victoria** — Cada victoria suma una cantidad fija de puntos.

**20.10 · ¿Los rivales de eventos serán especiales?**
_Identidad propia del plantel de eventos._
- ✅ **Invitados temáticos** — Cada evento con su liga temática (Leyendas del Pasado, etc.).

**20.11 · ¿Habrán bonus internos por ronda dentro del evento?**
_Multiplicadores que suben la apuesta._
- ✅ **Sin bonus** — Puntaje plano de principio a fin.

**20.12 · ¿Perder un intento dentro del evento castiga?**
_El precio del fallo._
- ✅ **Por tipo de evento** — Cada evento define su propia política de fallo.

**20.13 · ¿El tiempo del evento se mostrará siempre?**
_Conciencia del reloj dentro del evento._
- ✅ **Cronómetro visible** — Reloj siempre visible arriba.

**20.14 · ¿La pestaña de evento ocultará la pantalla principal?**
_Tu requisito: al entrar a evento se oculta el panel y se ve el proceso._
- ✅ **Con botón salir** — Pantalla propia y salida clara en todo momento.

**20.15 · ¿Se podrán usar consumibles en eventos?**
_Pociones y objetos en el contexto competitivo._
- ✅ **No se pueden** — Eventos limpios: pura build.

## 🎁 Grupo 21 — EVENTOS: Premios  (15/15)
_Recompensas por puesto, distribución del botín y bonos de participación._

**21.01 · ¿Cuántos puestos recibirán premio?**
_Tu idea: premiar los mejores. Definamos el corte._
- ✅ **Top 10** — Un puesto más de holgura.

**21.02 · ¿Cómo se distribuirá el valor entre los puestos?**
_La forma de la curva de premios._
- ✅ **Piramide clásica** — 1º 30% · 2º 20% · 3º 14% · resto decreciente.

**21.03 · ¿En qué moneda pagarán los eventos?**
_El sueldo del evento: oro, gemas o moneda especial._
- ✅ **Mixta completa** — Oro + XP + gemas top + moneda especial al campeón.

**21.04 · ¿Habrá premio único para el 1º?**
_El trofeo del campeón del evento._
- ✅ **No hay único** — Solo más cantidad de lo mismo.

**21.05 · ¿Habrá premio de participación mínima?**
_Que inscribirse nunca sea en vano._
- ✅ **Oro pequeño** — Un pago base por intentarlo.

**21.06 · ¿Habrán rachas de eventos ganados?**
_Dominancia: brillar en varios eventos seguidos._
- ✅ **No habrá** — Cada evento es independiente del anterior.

**21.07 · ¿Se premiará el récord personal?**
_Competir contra tu propia marca._
- ✅ **No se premia** — El récord es solo anécdota.

**21.08 · ¿Qué pasa si te inscribes y no te presentas?**
_El ausente: castigo o indiferencia._
- ✅ **Nada pasa** — Inscribirse no compromete nada.

**21.09 · ¿Los premios escalarán con tu nivel?**
_Que un evento gane a nivel 5 pague como a nivel 80._
- ✅ **Premios fijos** — Lo mismo para todos: injusto para avanzados.

**21.10 · ¿La tabla de premios se verá antes de inscribirse?**
_Transparencia de motivación._
- ✅ **Tabla completa** — Todos los puestos con sus premios.

**21.11 · ¿Cuándo se entregan los premios?**
_El momento del cobro._
- ✅ **Al cerrar el evento** — Las 3h terminan y se reparte a todos.

**21.12 · ¿Habrán resúmenes de resultado del evento?**
_El parte de la jornada._
- ✅ **Con tu puntaje** — Puesto + puntaje + premio.

**21.13 · ¿Habrán bonus por dominar los 7 del día?**
_El reto perfecto: brillar en TODO el día._
- ✅ **No habrá** — Cada evento independiente.

**21.14 · ¿Habrán premios acumulativos de la semana?**
_La liga interna semanal de eventos._
- ✅ **No habrá** — Cada evento vive solo, sin acumulados de semana.

**21.15 · ¿Los premios de eventos serán canjeables (tokens)?**
_Tu idea de tokens de evento: convertirlos en lo que quieras._
- ✅ **Premios directos** — Sin tokens: recibes el objeto directamente.

## 🎟️ Grupo 22 — PVP: Entrada y Pozo  (15/15)
_El sistema de pago, el pozo acumulado y el formato de 32 luchadores._

**22.01 · ¿Cómo será la entrada (buy-in) del torneo PVP?**
_Tu idea: pagas para entrar y el pozo se reparte. Definamos el pago._
- ✅ **Por liga** — La entrada escala con tu división: 100/500/2.500.

**22.02 · ¿Cómo se conformará el pozo de premios?**
_Qué pasa con el dinero de las entradas._
- ✅ **Con rake del 5%** — La casa retiene 5%: pozo 3.040 (sano para la economía).

**22.03 · ¿El torneo será siempre de 32?**
_El tamaño del cuadro._
- ✅ **Por liga** — Tamaño según tu liga PVP.

**22.04 · ¿Cómo se llenan los huecos del cuadro?**
_32 humanos no siempre estarán: los CPU rellenan._
- ✅ **Con nombres reales** — Los CPU usan nombres creíbles de luchadores.

**22.05 · ¿Cómo se llamará esta sección del menú?**
_Tu menú dice LUCHA PVP: el nombre interno de la sala._
- ✅ **El Coliseo** — Combate histórico y brutal.

**22.06 · ¿Cuántas salas simultáneas existirán?**
_Organización de las mesas de juego._
- ✅ **Por liga** — Salas separadas según tu liga PVP actual.

**22.07 · ¿Se podrá pagar la entrada con gemas?**
_Entrada alternativa premium._
- ✅ **Ambos mundos** — Salas de oro y salas de gemas en paralelo.

**22.08 · ¿Habrá reentrada tras quedar eliminado?**
_La segunda oportunidad del torneo._
- ✅ **Sin reentrada** — Eliminado es eliminado: a la próxima sala.

**22.09 · ¿Qué requisitos habrá para entrar al PVP?**
_Puertas de acceso a la sala._
- ✅ **Nivel mínimo 10** — Primero aprendes lo básico antes de competir.

**22.10 · ¿Cuántos torneos se podrán jugar al día?**
_El límite diario de participación PVP._
- ✅ **Ilimitados** — Juega todo lo que tu oro aguante.

**22.11 · ¿El PVP estará siempre abierto?**
_Disponibilidad horaria de las salas._
- ✅ **24/7** — Siempre hay sala disponible.

**22.12 · ¿La inscripción mostrará el desglose del pozo?**
_Transparencia antes de pagar._
- ✅ **Con reparto** — La tabla completa de premios por puesto.

**22.13 · ¿Qué pasa si la sala no llena?**
_El destino de una sala medio vacía._
- ✅ **Se cancela** — Se devuelve la entrada íntegra.

**22.14 · ¿Habrá modo práctica gratuito?**
_Calentar sin arriesgar oro._
- ✅ **No habrá** — El PVP siempre cuesta su entrada, sin prácticas.

**22.15 · ¿Cómo se evitará el abuso de salas?**
_Fair play del sistema de pago._
- ✅ **Sin controles** — Confianza total en el fair play de los jugadores.

## 🗂️ Grupo 23 — PVP: Cuadro y Premios  (15/15)
_La llave del torneo, cómo avanzas y cómo se reparte el premio._

**23.01 · ¿Qué formato de eliminación tendrá el cuadro?**
_La estructura de avance hacia la final._
- ✅ **Eliminación simple** — Pierdes y estás fuera: 5 rondas para ser campeón de 32.

**23.02 · ¿Cómo se vivirrá tu camino en el cuadro?**
_Tu requisito: tu personaje LUCHA visible. Definamos la experiencia._
- ✅ **Tus luchas una a una** — Ves cada lucha propia en la arena y avanzas con SIGUIENTE.

**23.03 · ¿Se podrán ver las luchas de otros?**
_Espectación del resto del torneo._
- ✅ **Resultado directo** — Ves el resultado de cada llave en el cuadro.

**23.04 · ¿Habrá premio por ronda ganada además del puesto?**
_Pagos intermedios durante el torneo._
- ✅ **Solo puesto final** — Todo el pago llega según tu posición final.

**23.05 · ¿Qué sentido tendrán las 5 rondas (32→16→8→4→2→1)?**
_Nombrar las fases del camino._
- ✅ **Con tradición** — La final es al mejor de 3 caídas: la clásica.

**23.06 · ¿Cómo repartir el pozo entre los premiados?**
_Tu ejemplo: 3.200 de pozo. La forma del reparto._
- ✅ **Top 7 con dominante** — 1º 40% · 2º 22% · 3º 14% · 4º 8% · 5º 6% · 6º 5% · 7º 5%.

**23.07 · ¿Los eliminados tempranos reciben algo?**
_El consuelo de salida rápida._
- ✅ **Nada** — Salir en ronda 1 = perder la entrada.

**23.08 · ¿Qué pasa si tu lucha del cuadro empata?**
_Desempate en duelo directo._
- ✅ **Se repite** — Lucha de desempate inmediata.

**23.09 · ¿Habrá bonus por campeonato invicto?**
_Ganar el título sin perder ni una ronda._
- ✅ **No hay bonus** — Ser campeón paga igual llegues como llegues.

**23.10 · ¿Habrá racha de títulos PVP?**
_Campeonatos acumulados._
- ✅ **No cuenta** — Cada torneo es una isla: los títulos no encadenan.

**23.11 · ¿El bracket mostrará tu camino proyectado?**
_Ver el bosque completo del torneo._
- ✅ **Tu mitad** — Ves tu mitad del cuadro con los cruces posibles.

**23.12 · ¿Habrá título cosmético por ganar el torneo?**
_Estatus visible de campeón._
- ✅ **Sin título** — El premio es solo material.

**23.13 · ¿Habrá clasificación semanal de puntos PVP?**
_El campeonato paralelo de consistencia._
- ✅ **No habrá** — Solo torneos individuales.

**23.14 · ¿Se podrán hacer duelos extra tras quedar eliminado?**
_Seguir jugando aunque estés fuera._
- ✅ **No se puede** — Eliminado te quedas mirando el resto del torneo.

**23.15 · ¿Se guardará historial de torneos?**
_El archivo de tu carrera PVP._
- ✅ **Sin historial** — Lo jugado queda en el pasado sin registro.

## 🥇 Grupo 24 — PVP: Ligas y Extras  (15/15)
_Sistemas competitivos de largo plazo: ligas, temporadas, rating y emotes._

**24.01 · ¿Habrá ligas PVP (bronce a leyenda)?**
_La escalera competitiva permanente._
- ✅ **5 ligas fijas** — Bronce, Plata, Oro, Diamante, Leyenda.

**24.02 · ¿Las ligas tendrán temporadas?**
_El reloj competitivo: reinicios periódicos._
- ✅ **Semanal** — Ritmo rápido de 7 días con reinicio cada semana.

**24.03 · ¿Qué premios dará el fin de temporada de liga?**
_El pago de la escalera._
- ✅ **Solo moneda** — Pago en la moneda de tu liga.

**24.04 · ¿Los rivales del bracket tendrán identidad?**
_Que el cuadro se sienta poblado de personajes._
- ✅ **Con estilo** — Nombre + clase + detalle visual.

**24.05 · ¿La dificultad de los CPU del PVP escalará?**
_Calibración del reto del cuadro._
- ✅ **Con sorpresas** — El 10% de rivales es un tiburón disfrazado.

**24.06 · ¿Habrá cabezas de serie (seeds)?**
_Siembras en el cuadro según mérito._
- ✅ **Sorteo puro** — El cuadro se sortea 100% al azar para todos.

**24.07 · ¿Habrá emotes/mensajes en el PVP?**
_Comunicación social limitada._
- ✅ **Sin comunicación** — Nadie habla: solo luchan.

**24.08 · ¿Se podrán hacer apuestas a otros luchadores?**
_Tu idea de predicción: apostar por ganadores._
- ✅ **Sin apuestas** — El PVP es solo competir, nada de apuestas.

**24.09 · ¿Habrá multiplicador de pozo en horas pico?**
_Promover concurrencia en franjas clave._
- ✅ **No habrá** — El pozo siempre vale lo mismo, sin multiplicadores.

**24.10 · ¿Habrán puntos PVP acumulables para tienda PVP?**
_Moneda de consistencia competitiva._
- ✅ **No habrá** — Los premios son directos.

**24.11 · ¿Habrá rating numérico (ELO) visible?**
_Tu número de fuerza competitiva._
- ✅ **Sin rating** — No habrá número de rating: con las ligas basta.

**24.12 · ¿Torneos especiales de fin de semana?**
_El gran evento PVP semanal._
- ✅ **Sábado XL** — Sábado: torneo de 64 con pozo gordo.

**24.13 · ¿Se mostrará tu racha PVP en el perfil?**
_Presencia competitiva._
- ✅ **Sin rachas visibles** — Tu perfil no muestra racha.

**24.14 · ¿El emparejamiento protegerá a los novatos?**
_Fair play de niveles en el cuadro._
- ✅ **Sin protección** — Puede tocar un campeón en ronda 1.

**24.15 · ¿Habrá recompensa diaria por participar en PVP?**
_El hábito competitivo premiado._
- ✅ **No habrá** — El PVP premia solo resultados.

---
# 🛒 BLOQUE: TIENDA, DATOS Y EXTRAS
_Catálogo de la tienda, guardado/carga, interfaz Android, audio y contenido a largo plazo._

## 🛒 Grupo 25 — TIENDA: Estructura  (15/15)
_Las secciones de la tienda, su rotación y políticas de compra._

**25.01 · ¿Qué secciones tendrá la tienda?**
_Tu visión: equipo, pociones y más. Organicemos las vitrinas._
- ✅ **3 secciones** — Equipo, Pociones, Ofertas: básico y claro.

**25.02 · ¿El inventario de la tienda rotará?**
_Escasez programada: lo que hoy está, mañana no._
- ✅ **Rotación por hora** — Vitrina relámpago que cambia cada hora.

**25.03 · ¿Habrán ofertas por tiempo limitado?**
_El arte del FOMO sano._
- ✅ **Oferta diaria** — 1 producto al 50% por 24h.

**25.04 · ¿Habrá paquetes para novatos?**
_El arranque acelerado bien dosificado._
- ✅ **No habrá** — Cada quien empieza de cero.

**25.05 · ¿Qué moneda usará cada sección?**
_El mapa del dinero en la tienda._
- ✅ **Oro y gemas** — Equipo con oro, premium con gemas.

**25.06 · ¿Habrán descuentos y promociones?**
_Aceleradores comerciales._
- ✅ **Sin descuentos** — Precio único de por vida.

**25.07 · ¿Cómo será la vista previa de los productos?**
_Saber exactamente qué compras._
- ✅ **Con comparación** — Comparado con tu equipo actual.

**25.08 · ¿Las compras pedirán confirmación?**
_Anti-torque-errado con el oro del ahorro._
- ✅ **Todo confirmado** — Cualquier compra, por pequeña que sea, pregunta antes.

**25.09 · ¿Habrán devoluciones?**
_La política de reembolso de la tienda._
- ✅ **Sin devoluciones** — Lo comprado está comprado, sin excepciones.

**25.10 · ¿Habrá vitrina de destacados en portada?**
_La entrada de la tienda que enamora._
- ✅ **Lista simple** — Sin portada: secciones directas.

**25.11 · ¿Habrán búsqueda y filtros en la tienda?**
_Encontrar lo tuyo entre decenas de productos._
- ✅ **Sin búsqueda** — Se explora manualmente por las secciones de la tienda.

**25.12 · ¿Los productos tendrán stock limitado?**
_Comprar ahora o esperar la rotación._
- ✅ **Stock por día** — Los rotativos con tope diario.

**25.13 · ¿La tienda tendrá nivel propio?**
_Tu tienda que crece contigo._
- ✅ **Tienda única** — La misma tienda para siempre.

**25.14 · ¿Habrá mercado negro desbloqueable?**
_La tienda secreta de cosas raras._
- ✅ **Desbloque por logro** — Se abre con un logro específico.

**25.15 · ¿Habrán paquetes (bundles) con descuento?**
_Comprar combo sale más barato._
- ✅ **Sin bundles** — Todos los productos se venden por separado.

## 🧪 Grupo 26 — TIENDA: Catálogo  (14/14)
_Qué se vende exactamente: equipo, pociones, cofres, boosts y exclusivos._

**26.01 · ¿Qué pociones se venderán?**
_Tu requisito: pociones en tienda. Definamos el catálogo._
- ✅ **+ Curación** — Las 3 + poción que arrancas con vida extra.

**26.02 · ¿Cómo funcionará el buff de poción?**
_La mecánica de activación de las pociones._
- ✅ **Siguiente lucha** — Se activa sola en la próxima lucha.

**26.03 · ¿El equipamiento se comprará directo?**
_Cómo se vende el equipo en tienda._
- ✅ **Listo para llevar** — Ves el objeto exacto y sus stats: sin dados.

**26.04 · ¿Qué tan bueno será el equipo de tienda?**
_Que la tienda no reemplace al botín de lucha._
- ✅ **Balanceado** — Tier alto en tienda pero con substats aleatorias: el drop sigue siendo mejor techo.

**26.05 · ¿Habrán cofres sorpresa comprables?**
_El gacha controlado de la tienda._
- ✅ **No habrá cofres** — Solo compra directa: sabes exactamente qué compras.

**26.06 · ¿Los cofres tendrán compasión (pity)?**
_Anti-racha: garantía tras X aperturas._
- 🔒 Oculta por tus respuestas anteriores (no aplica a tu configuración)

**26.07 · ¿Habrán cosméticos comprables?**
_Apariencia pura sin poder._
- ✅ **No habrá** — La tienda no vende apariencia.

**26.08 · ¿Habrán boosts temporales comprables?**
_Multiplicadores con reloj._
- ✅ **No habrá** — Sin multiplicadores comprables.

**26.09 · ¿Se venderán tickets de entrada?**
_Entradas PVP/evento como producto._
- ✅ **Ticket PVP** — Entrada de torneo comprable.

**26.10 · ¿Se venderán materiales de mejora?**
_El atajo del grind de materiales._
- ✅ **Con límite** — Tope de unidades por día.

**26.11 · ¿Qué comprará el oro acumulado a finales?**
_El sumidero de oro para ricos (endgame económico)._
- ✅ **Mejoras infinitas** — Las mejoras de stats siempre aceptan más oro.

**26.12 · ¿Los objetos de gemas darán poder o comodidad?**
_La línea ética del premium._
- ✅ **Solo comodidad** — Las gemas compran tiempo y confort, jamás poder.

**26.13 · ¿Habrá regalo diario gratis en la tienda?**
_El motivo de visita diaria a la tienda._
- ✅ **Sin regalo** — La tienda no regala nada.

**26.14 · ¿Se mostrará el valor relativo de los precios?**
_Educación económica del comprador._
- ✅ **Solo precio** — Cada producto con su precio y ya.

**26.15 · ¿Habrá vendedores con personalidad?**
_El alma comercial de la tienda._
- ✅ **Sin vendedores** — UI limpia sin personajes.

## 💾 Grupo 27 — Guardado y Datos  (15/15)
_Guardar, cargar, exportar el .md y proteger el progreso del plan y del juego._

**27.01 · ¿Cuándo se guardará el progreso?**
_Tu requisito: guardar el proceso. Definamos la frecuencia._
- ✅ **Paranoico** — Auto + botón + respaldo interno + exportación recordatoria semanal.

**27.02 · ¿Dónde se guardará el progreso?**
_Los destinos de la copia de seguridad._
- ✅ **+ Archivo descargable** — Copia exportable como archivo para respaldo.

**27.03 · ¿El formato de exportación será .md legible?**
_Tu requisito: descargar el .md con las respuestas actuales._
- ✅ **.md + datos** — El .md legible CON los datos incrustados para re-importar.

**27.04 · ¿Cómo será la pantalla de cargar?**
_Tu requisito: poder cargar respuestas y continuar luego._
- ✅ **Con confirmación** — Aviso antes de sobreescribir lo actual.

**27.05 · ¿Cuántos perfiles/guardados habrá?**
_Slots para distintos proyectos o personas._
- ✅ **1 perfil** — Un único espacio de progreso.

**27.06 · ¿Sobreescribir pedirá confirmación?**
_Protección del dedo torpe._
- ✅ **Confirmación simple** — Un cartel de confirmación con botones de Sí/No.

**27.07 · ¿Habrá respaldo automático previo a cargar?**
_La red de seguridad del cargado._
- ✅ **Historial 5** — Guarda los últimos 5 estados.

**27.08 · ¿Se podrá reiniciar todo el progreso?**
_El botón rojo, bien protegido._
- ✅ **Con doble confirmación** — Dos avisos consecutivos antes de borrar algo.

**27.09 · ¿El guardado será compatible entre versiones?**
_Que actualizar el juego no rompa tu progreso._
- ✅ **Con versión** — El guardado indica su versión y se adapta.

**27.10 · ¿Se verá la fecha del último guardado?**
_Control del estado de tu progreso._
- ✅ **Fecha y hora** — Cuándo fue el último guardado.

**27.11 · ¿Se guardará automáticamente antes de cerrar?**
_Protección al salir de la app._
- ✅ **Doble sistema** — Heartbeat + cierre + botón: triple red.

**27.12 · ¿Los perfiles tendrán nombre?**
_Identidad de cada guardado._
- ✅ **Sin nombre** — Se llaman Perfil 1, Perfil 2, Perfil 3, sin más.

**27.13 · ¿El JUEGO final también exportará su estado en .md?**
_Consistencia: el juego real hereda esta filosofía de respaldo._
- ✅ **Ambos** — .md para leer + JSON para restaurar.

**27.14 · ¿Habrá estadísticas del progreso del plan?**
_Meta-información: cómo vas con las 450 respuestas._
- ✅ **Con análisis** — Tu perfil de diseñador: conservador/balanceado/pro según tus elecciones.

**27.15 · ¿Se podrá continuar exactamente donde quedaste?**
_El retorno sin fricción._
- ⛔ **No deseo implementar esta pregunta**

## 📱 Grupo 28 — Interfaz Android  (15/15)
_El layout vertical sin scroll, tamaños táctiles y adaptación a cualquier móvil._

**28.01 · ¿Qué resolución será la base del diseño?**
_Tu regla de oro: TODO visible sin scroll. Definamos la base técnica._
- ✅ **Auto-escala + test** — Escalado + auditoría automática de que nada queda cortado.

**28.02 · ¿Cómo se controlarán los tamaños de texto?**
_Que nada se corte ni desborde jamás._
- ✅ **Auto-fit por contenido** — El texto se reduce automáticamente si la tarjeta se llena.

**28.03 · ¿Cómo se distribuirá la pantalla del juego?**
_El esqueleto vertical del HUD._
- ✅ **Header + cuerpo + menú** — Cabecera de monedas, cuerpo flexible y menú de 6 abajo.

**28.04 · ¿Cómo se verán las 6 opciones del menú inferior?**
_HÉROE, EQUIPO, HABILIDAD, EVENTOS, LUCHA PVP y TIENDA juntas._
- ✅ **6 iconos + texto pequeño** — Todos visibles con su nombre: imposible perderse.

**28.05 · ¿El diseño será usable con una sola mano?**
_Ergonomía del pulgar derecho._
- ✅ **Centrado** — Botones al centro: neutral.

**28.06 · ¿El tema oscuro será el único?**
_Tu diseño base es oscuro. ¿Alternativa?_
- ✅ **Solo oscuro** — Un tema perfecto: oscuro premium.

**28.07 · ¿Qué tamaño mínimo tendrán los botones?**
_Precisión táctil estándar Android._
- ✅ **48 px** — Recomendación oficial Android.

**28.08 · ¿Habrá vibración háptica en acciones?**
_El toque físico del feedback (si el dispositivo lo soporta)._
- ✅ **Sin vibración** — Ningún evento produce vibración en el dispositivo.

**28.09 · ¿Qué pasa al girar a horizontal?**
_La política de rotación del juego._
- ✅ **Bloqueado vertical** — Nada pasa: siempre vertical.

**28.10 · ¿Se respetarán las zonas seguras (notch)?**
_Los bordes del móvil moderno: cámara y barras._
- ✅ **Con safe-area** — Respeta notch y barras del sistema.

**28.11 · ¿Habrán animaciones de transición entre pestañas?**
_La fluidez del menú de 6._
- ✅ **Fundido** — 150ms de fundido elegante.

**28.12 · ¿Qué densidad de información tendrá la UI?**
_Minimal vs completo: tu llamada de diseñador._
- ✅ **Moderado** — Lo esencial bien colocado, sin saturar la vista.

**28.13 · ¿Cuál será el tamaño de texto mínimo legible?**
_Nada de letras hormiga invisibles._
- ✅ **12 px** — Lectura garantizada para todos los públicos.

**28.14 · ¿Habrá pantalla de carga inicial?**
_La primera impresión del juego._
- ✅ **Con arte** — Arte del héroe + tips rotativos.

**28.15 · ¿El juego será instalable (PWA) en Android?**
_Guardarlo como app desde el navegador._
- ✅ **Con offline** — Instalable y funciona 100% sin internet.

## 🔊 Grupo 29 — Sonido y Feedback  (15/15)
_Música, efectos, sacudidas de pantalla y celebraciones._

**29.01 · ¿Habrá música de fondo?**
_La banda sonora de la experiencia._
- ✅ **Sin música** — Silencio musical: solo se escuchan los efectos de combate.

**29.02 · ¿Qué efectos de sonido tendrá el combate?**
_El impacto audible de cada golpe._
- ⛔ **No deseo implementar esta pregunta**

**29.03 · ¿El volumen tendrá controles separados?**
_Ajustes de audio granulares._
- ⛔ **No deseo implementar esta pregunta**

**29.04 · ¿El sonido se silenciará en segundo plano?**
_Cortesía del juego al cambiar de app._
- ⛔ **No deseo implementar esta pregunta**

**29.05 · ¿Qué tan espectaculares serán los efectos visuales?**
_El presupuesto de pirotecnia._
- ✅ **Estándar** — Partículas en golpes fuertes.

**29.06 · ¿La pantalla se sacudirá en golpes fuertes?**
_El screen shake: dosificado._
- ✅ **En críticos** — Los críticos sacuden leve.

**29.07 · ¿Los críticos tendrán flash especial?**
_El momento WOW del número amarillo._
- ✅ **Flash blanco** — Un destello blanco sobre quien recibe el golpe crítico.

**29.08 · ¿El oro ganado se contará animado?**
_El contador que sube: dopamina contable._
- ✅ **Contador rodante** — La cifra rueda hacia arriba.

**29.09 · ¿La iconografía será de emojis o arte propio?**
_El estilo de los íconos del juego._
- ✅ **Emojis del sistema** — Rápido y universal: 🥊💎🛒.

**29.10 · ¿La multitud reaccionará con audio?**
_El rugido del público vivo._
- ✅ **Silenciosa** — El público se ve pero nunca se escucha.

**29.11 · ¿El golpe final irá en cámara lenta?**
_El slow motion del finisher._
- ✅ **Sin slow-mo** — El KO ocurre a velocidad normal, sin pausas dramáticas.

**29.12 · ¿Habrán confetis y celebraciones de victoria?**
_La fiesta del triunfo._
- ✅ **Solo campeonatos** — Confeti reservado a títulos.

**29.13 · ¿La vibración acompañará los KOs?**
_El golpe físico en tu mano._
- ✅ **Sin vibración** — Solo audio y video: nada de movimiento físico en la mano.

**29.14 · ¿Habrá modo bajo rendimiento?**
_Cuidar batería y móviles modestos._
- ✅ **Modo simple** — Botón que apaga partículas y animaciones.

**29.15 · ¿Qué estilo de arte final tendrá el juego?**
_La decisión estética madre que une todo._
- ✅ **Dibujo clásico** — Estilo caricatura de luchador clásico.

## 🌟 Grupo 30 — Extras a Largo Plazo  (15/15)
_Logros, misiones diarias, prestigio global y el roadmap de la versión 1._

**30.01 · ¿Cuántos logros tendrá el juego?**
_Los hitos de la carrera de tu luchador._
- ✅ **150 con cadenas** — Cadenas de logros progresivos (gana 1/10/100/1000 luchas).

**30.02 · ¿Habrán misiones diarias?**
_Las tareas del día que ordenan la sesión._
- ✅ **5 diarias** — Con refresco de 1 misión gratis.

**30.03 · ¿Habrán misiones semanales?**
_Las metas de la semana._
- ✅ **3 semanales** — Más grandes que las diarias.

**30.04 · ¿Habrá prestigio global del juego?**
_El gran reinicio por poder eterno (más allá del ascenso de héroe)._
- ✅ **No habrá** — El progreso es lineal para siempre.

**30.05 · ¿Habrá tablón de anuncios in-game?**
_Noticias del juego dentro del propio juego._
- ✅ **Sin tablón** — No habrá noticias ni anuncios dentro del juego.

**30.06 · ¿Qué estadísticas globales se registrarán?**
_El big data de tu carrera._
- ✅ **Todo + visualizado** — Todo con gráficos y tendencias mensuales.

**30.07 · ¿Habrá selector de dificultad global?**
_Tu decisión del Grupo 6 sobre modos, confirmada a nivel global._
- ✅ **Dificultad única** — Un equilibrio para todos.

**30.08 · ¿Habrán eventos de temporada futuros?**
_El contenido que mantiene vivo el juego._
- ✅ **Temporada mensual** — Cada mes un tema nuevo de temporada para todos.

**30.09 · ¿Habrá panel secreto de depuración (debug)?**
_Para TI de desarrollador: probar números rápido._
- ✅ **Sin debug** — No existe ningún modo de trucos ni panel oculto.

**30.10 · ¿Se preparará el juego para más idiomas?**
_El plan de internacionalización del juego final._
- ✅ **Solo español** — Todo el juego en español, sin planes de traducir.

**30.11 · ¿Habrá modo espectador de revanchas?**
_Ver tus mejores momentos otra vez._
- ✅ **No habrá** — Las luchas pasadas no se pueden volver a ver.

**30.12 · ¿Habrá sección de ayuda/FAQ en el juego?**
_El manual dentro del juego._
- ✅ **Sin ayuda** — A investigar por cuenta propia.

**30.13 · ¿Habrá pantalla de créditos?**
_El sello personal del creador._
- ✅ **Sin créditos** — Ningún nombre ni firma: el juego no muestra autoría.

**30.14 · ¿Qué irá en la versión 1 del juego?**
_El alcance realista del primer lanzamiento._
- ✅ **Plan completo** — Las 450 respuestas implementadas desde el día 1.

**30.15 · ¿Cómo se priorizarán las funciones futuras?**
_La gobernanza del roadmap post-lanzamiento._
- ✅ **Por votación** — Encuesta interna en el juego.

---
## 🔧 Datos para volver a cargar este plan
Copia TODO el bloque de código de abajo (o el archivo .md completo) e impórtalo con 📥 para recuperar tus respuestas.

```json
{"app":"plan-lucha-libre","v":1,"total":442,"answers":{"g01q01":3,"g01q02":4,"g01q03":1,"g01q04":2,"g01q05":0,"g01q06":0,"g01q07":0,"g01q08":3,"g01q09":0,"g01q10":0,"g01q11":0,"g01q12":4,"g01q13":2,"g01q14":1,"g01q15":4,"g02q01":0,"g02q02":1,"g02q03":3,"g02q04":1,"g02q05":3,"g02q06":0,"g02q07":4,"g02q08":4,"g02q09":0,"g02q10":2,"g02q11":4,"g02q12":0,"g02q13":2,"g02q14":4,"g02q15":0,"g03q01":4,"g03q02":1,"g03q03":4,"g03q04":0,"g03q05":1,"g03q06":1,"g03q07":0,"g03q08":0,"g03q09":1,"g03q10":0,"g03q11":3,"g03q12":1,"g03q13":0,"g03q14":2,"g03q15":3,"g04q01":1,"g04q02":1,"g04q03":1,"g04q04":0,"g04q05":4,"g04q06":1,"g04q07":3,"g04q08":0,"g04q09":0,"g04q10":0,"g04q11":0,"g04q12":0,"g04q13":0,"g04q14":4,"g04q15":1,"g05q01":4,"g05q02":2,"g05q03":4,"g05q04":0,"g05q05":2,"g05q06":0,"g05q07":0,"g05q08":2,"g05q09":1,"g05q10":0,"g05q11":2,"g05q12":4,"g05q13":0,"g05q14":0,"g05q15":0,"g06q01":2,"g06q02":3,"g06q03":4,"g06q04":2,"g06q05":2,"g06q06":1,"g06q07":0,"g06q08":0,"g06q09":0,"g06q10":2,"g06q11":1,"g06q12":2,"g06q13":4,"g06q14":0,"g06q15":4,"g07q01":1,"g07q02":0,"g07q03":0,"g07q04":1,"g07q05":0,"g07q07":0,"g07q08":0,"g07q09":0,"g07q10":0,"g07q11":4,"g07q12":1,"g07q13":0,"g07q14":1,"g07q15":1,"g08q01":0,"g08q02":2,"g08q03":0,"g08q04":1,"g08q05":0,"g08q06":0,"g08q07":0,"g08q08":2,"g08q09":0,"g08q10":4,"g08q11":0,"g08q12":0,"g08q13":0,"g08q14":1,"g08q15":1,"g09q01":0,"g09q02":5,"g09q03":5,"g09q04":5,"g09q08":1,"g09q09":0,"g09q10":0,"g09q11":5,"g09q12":0,"g09q13":0,"g09q14":0,"g09q15":1,"g10q01":0,"g10q02":1,"g10q03":1,"g10q04":0,"g10q05":1,"g10q06":0,"g10q07":2,"g10q08":1,"g10q09":0,"g10q10":1,"g10q11":3,"g10q12":1,"g10q13":1,"g10q14":0,"g10q15":4,"g11q01":1,"g11q02":2,"g11q03":3,"g11q04":1,"g11q05":3,"g11q06":1,"g11q07":0,"g11q08":1,"g11q09":1,"g11q10":3,"g11q11":1,"g11q12":0,"g11q13":1,"g11q14":0,"g11q15":0,"g12q01":0,"g12q02":1,"g12q03":0,"g12q04":4,"g12q05":0,"g12q06":1,"g12q07":0,"g12q08":0,"g12q09":0,"g12q10":0,"g12q11":1,"g12q12":4,"g12q13":0,"g12q14":4,"g12q15":1,"g13q01":0,"g13q02":1,"g13q03":0,"g13q04":1,"g13q05":2,"g13q06":0,"g13q07":0,"g13q08":3,"g13q09":0,"g13q10":1,"g13q11":0,"g13q12":0,"g13q13":0,"g13q14":0,"g13q15":4,"g14q01":1,"g14q02":0,"g14q03":0,"g14q04":0,"g14q05":0,"g14q06":0,"g14q07":0,"g14q08":0,"g14q09":0,"g14q10":4,"g14q11":0,"g14q12":0,"g14q13":4,"g14q14":0,"g14q15":0,"g15q01":4,"g15q02":4,"g15q03":0,"g15q04":0,"g15q05":4,"g15q06":0,"g15q07":0,"g15q08":0,"g15q09":0,"g15q10":4,"g15q11":4,"g15q13":0,"g15q14":0,"g15q15":5,"g16q01":1,"g16q02":3,"g16q03":2,"g16q04":0,"g16q05":3,"g16q06":0,"g16q08":0,"g16q09":1,"g16q10":1,"g16q11":2,"g16q12":1,"g16q13":0,"g16q14":0,"g16q15":0,"g17q01":4,"g17q02":3,"g17q03":0,"g17q04":4,"g17q05":0,"g17q06":4,"g17q07":4,"g17q08":1,"g17q09":1,"g17q10":0,"g17q11":4,"g17q12":0,"g17q13":2,"g17q14":0,"g17q15":2,"g18q01":4,"g18q02":3,"g18q03":0,"g18q04":2,"g18q05":2,"g18q06":0,"g18q07":0,"g18q08":0,"g18q09":0,"g18q10":0,"g18q11":0,"g18q13":1,"g18q14":1,"g18q15":0,"g19q01":0,"g19q02":0,"g19q03":0,"g19q04":1,"g19q05":1,"g19q06":2,"g19q07":2,"g19q08":0,"g19q09":3,"g19q10":3,"g19q11":0,"g19q12":1,"g19q13":0,"g19q14":1,"g19q15":1,"g20q01":4,"g20q02":0,"g20q03":0,"g20q04":0,"g20q05":0,"g20q06":1,"g20q07":0,"g20q08":1,"g20q09":0,"g20q10":4,"g20q11":0,"g20q12":4,"g20q13":1,"g20q14":1,"g20q15":0,"g21q01":2,"g21q02":2,"g21q03":4,"g21q04":0,"g21q05":1,"g21q06":0,"g21q07":0,"g21q08":0,"g21q09":0,"g21q10":3,"g21q11":0,"g21q12":1,"g21q13":0,"g21q14":0,"g21q15":0,"g22q01":1,"g22q02":2,"g22q03":4,"g22q04":1,"g22q05":1,"g22q06":2,"g22q07":4,"g22q08":0,"g22q09":1,"g22q10":0,"g22q11":0,"g22q12":2,"g22q13":0,"g22q14":0,"g22q15":0,"g23q01":0,"g23q02":0,"g23q03":1,"g23q04":0,"g23q05":4,"g23q06":1,"g23q07":0,"g23q08":2,"g23q09":0,"g23q10":0,"g23q11":1,"g23q12":0,"g23q13":0,"g23q14":0,"g23q15":0,"g24q01":1,"g24q02":2,"g24q03":0,"g24q04":2,"g24q05":3,"g24q06":0,"g24q07":0,"g24q08":0,"g24q09":0,"g24q10":0,"g24q11":0,"g24q12":1,"g24q13":0,"g24q14":0,"g24q15":0,"g25q01":0,"g25q02":3,"g25q03":1,"g25q04":0,"g25q05":1,"g25q06":0,"g25q07":2,"g25q08":2,"g25q09":0,"g25q10":0,"g25q11":0,"g25q12":1,"g25q13":0,"g25q14":1,"g25q15":0,"g26q01":1,"g26q02":0,"g26q03":0,"g26q04":4,"g26q05":0,"g26q07":0,"g26q08":0,"g26q09":1,"g26q10":3,"g26q11":0,"g26q12":0,"g26q13":0,"g26q14":0,"g26q15":0,"g27q01":4,"g27q02":1,"g27q03":1,"g27q04":1,"g27q05":0,"g27q06":1,"g27q07":3,"g27q08":1,"g27q09":1,"g27q10":1,"g27q11":4,"g27q12":0,"g27q13":3,"g27q14":4,"g27q15":5,"g28q01":4,"g28q02":4,"g28q03":0,"g28q04":0,"g28q05":0,"g28q06":0,"g28q07":3,"g28q08":0,"g28q09":0,"g28q10":1,"g28q11":1,"g28q12":1,"g28q13":3,"g28q14":3,"g28q15":2,"g29q01":0,"g29q02":5,"g29q03":5,"g29q04":5,"g29q05":1,"g29q06":2,"g29q07":1,"g29q08":1,"g29q09":0,"g29q10":0,"g29q11":0,"g29q12":1,"g29q13":0,"g29q14":1,"g29q15":3,"g30q01":4,"g30q02":2,"g30q03":1,"g30q04":0,"g30q05":0,"g30q06":4,"g30q07":0,"g30q08":1,"g30q09":0,"g30q10":0,"g30q11":0,"g30q12":0,"g30q13":0,"g30q14":4,"g30q15":1}}
```