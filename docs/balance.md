# Fórmulas Matemáticas y Balance del Juego — Ring de Campeones

**Versión:** 1.0.0  
**Fecha:** Agosto 2026  
**Documento base:** Paso 1 — `ring-de-campeones-guia-implementacion-10-pasos.md`  

---

## 1. Progresión del Personaje y Experiencia

### 1.1. Experiencia requerida para subir de nivel (Nivel 1 a 200)
$$\text{EXP Requerida}(L) = \left\lfloor 100 \times L^{1.55} \right\rfloor$$

*Ejemplos de valores calculados:*
- **Nivel 1:** $\lfloor 100 \times 1^{1.55} \rfloor = 100\text{ EXP}$
- **Nivel 2:** $\lfloor 100 \times 2^{1.55} \rfloor = 292\text{ EXP}$
- **Nivel 5:** $\lfloor 100 \times 5^{1.55} \rfloor = 1.209\text{ EXP}$
- **Nivel 10:** $\lfloor 100 \times 10^{1.55} \rfloor = 3.548\text{ EXP}$
- **Nivel 50:** $\lfloor 100 \times 50^{1.55} \rfloor = 43.109\text{ EXP}$
- **Nivel 100:** $\lfloor 100 \times 100^{1.55} \rfloor = 126.191\text{ EXP}$
- **Nivel 200 (Máximo):** $\lfloor 100 \times 200^{1.55} \rfloor = 369.524\text{ EXP}$

### 1.2. Recompensa de Oro por Subir de Nivel
$$\text{Oro Nivel}(L) = \left\lfloor 50 \times L^{1.10} \right\rfloor$$

### 1.3. Costo de Compra de Puntos de Atributo con Oro
$$\text{Costo Stat}(C, L) = \left\lfloor 75 \times 1.18^{C} \times L^{0.35} \right\rfloor$$
*Donde $C$ es la cantidad de mejoras de esa estadística ya compradas, y $L$ es el nivel del héroe.*

---

## 2. Índice de Poder de Combate (Combat Power - CP)

El Poder de Combate refleja el valor numérico consolidado del personaje y de los rivales:

$$\text{Poder} = \left\lfloor (\text{HP} \times 0.22) + (\text{ATK} \times 4.0) + (\text{DEF} \times 3.2) + (\text{SPD} \times 2.5) + (\text{CRIT\%} \times 180) + (\text{DODGE\%} \times 120) \right\rfloor$$

---

## 3. Estadísticas Base y Escalado Inicial por Clase

### 3.1. Valores Base Universales (Nivel 1 sin clase)
- **Vida Base (HP):** 120
- **Ataque Base (ATK):** 18
- **Defensa Base (DEF):** 10
- **Velocidad Base (SPD):** 10
- **Probabilidad Crítica Base:** 0.05 (5%)
- **Multiplicador Crítico Base:** 2.00 (×2.0)
- **Precisión Base:** 0.95 (95%)
- **Esquiva Base:** 0.01 (1%)
- **Resistencia Crítica Base:** 0.00 (0%)
- **Anulación Crítica Base:** 0.00 (0%)
- **Suerte Base:** 0

### 3.2. Crecimiento de Atributos Base al Subir de Nivel (Por Nivel)
- **HP:** +12
- **ATK:** +2.2
- **DEF:** +1.4
- **SPD:** +0.6

---

## 4. Fórmulas del Motor de Combate

### 4.1. Velocidad de Carga de Acción (Barra 0 a 100)
Por cada tick de 50 ms simulados:
$$\text{Carga por Tick} = (8 + \text{SPD} \times 0.32) \times \text{Modificador de Carga}$$

### 4.2. Comprobación de Impacto vs Esquiva
$$\text{Probabilidad de Impacto} = \text{Precisión}_{\text{atacante}} - \text{Esquiva}_{\text{defensor}}$$
$$\text{Límites Obligatorios: } \min(0.95, \max(0.05, \text{Probabilidad de Impacto}))$$
*Garantiza que siempre haya al menos 5% de chance de impacto y la esquiva nunca supere 35% neto efectivo.*

### 4.3. Cálculo de Daño por Golpe
1. **Daño Base:**
   $$\text{Daño Base} = \max\left(1, \text{ATK}_{\text{atacante}} \times \text{Poder Movimiento} - \text{DEF}_{\text{defensor}} \times 0.55\right)$$

2. **Modificador de Clase:**
   - Si tiene ventaja (+12%): $\times 1.12$
   - Si sufre desventaja (-10%): $\times 0.90$
   - Si es neutro: $\times 1.00$

3. **Modificador Crítico:**
   $$\text{Mult. Crítico Final} = \max\left(1.0, \text{Mult}_{\text{crítico}} - \text{Resistencia Crítica}_{\text{defensor}}\right)$$
   *(Si el defensor activa Anulación Crítica con éxito, el golpe pasa a ser daño normal $\times 1.0$).*

4. **Variación Pseudoaleatoria (RNG):**
   $$\text{Factor Variación} \in [0.95, 1.05]$$

5. **Daño Final:**
   $$\text{Daño} = \max\left(1, \left\lfloor \text{Daño Base} \times \text{Modificador Clase} \times \text{Modificador Crítico} \times \text{Factor Variación} \right\rfloor\right)$$

6. **Golpe de Remate (Finisher):**
   - Se dispara cuando $\text{HP}_{\text{rival}} \le 20\% \text{ HP Máximo}$.
   - Aplica un multiplicador adicional de $\times 1.50$ al daño final.

---

## 5. Escalado de la Campaña y Jefes

### 5.1. Estadísticas del Enemigo de Campaña
Para el Capítulo $C \ge 1$ y Lucha $F \in [1, 5]$:
- **Factor de Lucha ($F$):**
  - Lucha 1: $1.00$
  - Lucha 2: $1.05$
  - Lucha 3: $1.10$
  - Lucha 4: $1.15$
  - Lucha 5 (Jefe de Capítulo): $1.45$ (con clase Leyenda)

$$\text{HP Enemigo} = \left\lfloor 105 \times 1.11^{(C - 1)} \times \text{Factor de Lucha} \right\rfloor$$
$$\text{ATK Enemigo} = \left\lfloor 15 \times 1.095^{(C - 1)} \times \text{Factor de Lucha} \right\rfloor$$
$$\text{DEF Enemigo} = \left\lfloor 8 \times 1.085^{(C - 1)} \times \text{Factor de Lucha} \right\rfloor$$
$$\text{SPD Enemigo} = \left\lfloor 9 \times 1.04^{(C - 1)} \times \text{Factor de Lucha} \right\rfloor$$

### 5.2. Recompensas de Campaña por Victoria
$$\text{Oro Base} = \left\lfloor 55 \times C^{1.18} \times (\text{esJefe } ? 2.0 : 1.0) \right\rfloor$$
$$\text{EXP Base} = \left\lfloor 35 \times C^{1.16} \times (\text{esJefe } ? 2.2 : 1.0) \right\rfloor$$
$$\text{Materiales Otorgados} = \text{randomInt}(1, 3) \times \left(1 + \lfloor C / 5 \rfloor\right)$$

---

## 6. Equipamiento, Rarezas y Sistema de Mejora

### 6.1. Multiplicadores de Estadísticas por Rareza
| Rareza | Color | Multiplicador Primario | Secundarias |
|---|---|---:|:---:|
| **Común** | Gris | $1.00\times$ | 0 |
| **Poco Común** | Verde | $1.25\times$ | 1 |
| **Raro** | Azul | $1.55\times$ | 1 alta |
| **Épico** | Violeta | $1.95\times$ | 2 |
| **Legendario** | Dorado | $2.50\times$ | 2 altas + Set |
| **Divino** | Arcoíris | $3.30\times$ | 3 altas + Set Doble |

### 6.2. Escalado de Mejora de Equipo (+0 a +15)
Cada nivel de mejora incrementa el atributo primario de la pieza:
$$\text{Atributo}(\text{Nivel Mejora}) = \text{Atributo Base} \times \left(1 + 0.08 \times \text{Nivel Mejora} + \text{Bonus Hito}\right)$$

**Bonus por Hitos de Mejora:**
- $+5$: $+5\%$ extra
- $+10$: $+10\%$ extra adicional
- $+15$: $+20\%$ extra adicional

### 6.3. Probabilidad y Costo de Mejora
| Rango de Nivel | Tasa de Éxito Base | Costo Oro Base | Costo Materiales |
|---|---:|---:|---:|
| $+1 \rightarrow +3$ | $100\%$ | $100 \times \text{Tier}$ | 2 |
| $+4 \rightarrow +6$ | $85\%$ | $250 \times \text{Tier}$ | 4 |
| $+7 \rightarrow +9$ | $65\%$ | $600 \times \text{Tier}$ | 8 |
| $+10 \rightarrow +12$ | $45\%$ | $1.400 \times \text{Tier}$ | 14 |
| $+13 \rightarrow +15$ | $25\%$ | $3.200 \times \text{Tier}$ | 25 |

*(Al usar una Piedra de Protección la probabilidad pasa a ser exactamente 100%).*

---

## 7. Economía de Torneos PVP (32 Participantes)

### 7.1. Tabla de Parámetros de Salas
| Parámetro | Sala Bronce | Sala Plata | Sala Oro |
|---|---:|---:|---:|
| **Costo Entrada** | 500 Oro | 2.500 Oro | 25 Gemas |
| **Participantes Totales** | 32 | 32 | 32 |
| **Bolsa Bruta (Entrada × 32)** | 16.000 Oro | 80.000 Oro | 800 Gemas |
| **Retención Casa (20%)** | 3.200 Oro | 16.000 Oro | 160 Gemas |
| **Bolsa Neta Distribuible (80%)** | **12.800 Oro** | **64.000 Oro** | **640 Gemas** |

### 7.2. Distribución Exacta al Top 7
$$\text{Porcentajes: } [50\%, 25\%, 10\%, 6\%, 4\%, 3\%, 2\%] \implies \sum = 100\%$$

| Posición | Porcentaje | Premio Bronce (Oro) | Premio Plata (Oro) | Premio Oro (Gemas) |
|---|---:|---:|---:|---:|
| **1º (Campeón)** | $50\%$ | 6.400 | 32.000 | 320 |
| **2º (Finalista)** | $25\%$ | 3.200 | 16.000 | 160 |
| **3º (Semifinalista A)** | $10\%$ | 1.280 | 6.400 | 64 |
| **4º (Semifinalista B)** | $6\%$ | 768 | 3.840 | 38.4 $\to$ 38 |
| **5º (Cuartofinalista A)** | $4\%$ | 512 | 2.560 | 25.6 $\to$ 26 |
| **6º (Cuartofinalista B)** | $3\%$ | 384 | 1.920 | 19.2 $\to$ 19 |
| **7º (Cuartofinalista C)** | $2\%$ | 256 | 1.280 | 12.8 $\to$ 13 |
| **Total Pagado** | **$100\%$** | **12.800 Oro** | **64.000 Oro** | **640 Gemas** |

---

## 8. Límites Defensivos del Sistema (Guardrails)

Para evitar desbordamientos numéricos, bucles infinitos o comportamientos rotos:
- **Nivel Máximo de Personaje:** $200$.
- **Nivel Máximo de Equipo:** $+15$.
- **Capacidad Máxima de Inventario de Equipo:** $50$ slots.
- **Límite Máximo de Esquiva:** $0.35$ (35%).
- **Límite Mínimo de Precisión/Impacto:** $0.05$ (5%).
- **Duración Máxima de Combate Simulado:** $180$ segundos ($3.600$ ticks de 50 ms).
- **Límite de Descuento de Venta:** $25\%$ exacto del valor de compra del ítem.
