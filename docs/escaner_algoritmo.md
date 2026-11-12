# Algoritmo de Calificación Nutricional — Escáner de Alimentos TOTALHIIT

Este documento describe la metodología, fórmulas matemáticas y umbrales utilizados por el **Escáner de Alimentos de TOTALHIIT** para evaluar alimentos y bebidas de supermercado en una escala transparente de **0 a 100 puntos**.

---

## 1. Filosofía del Algoritmo

1. **Pedagógico y Comprensible:** Traduce números técnicos (gramos de sodio, saturadas, etc.) a lenguaje cotidiano (cucharaditas de azúcar, gramos de sal, frases claras).
2. **Sin Alarmismo Injustificado:** Distingue entre aditivos inocuos (ej. ácido cítrico, pectina) y aditivos de consumo desaconsejado (ej. tartrazina, nitrito de sodio), basándose en la evidencia de la **EFSA** y la **FAO/OMS**.
3. **Ponderación Multi-criterio:** No solo juzga los macros; evalúa el nivel de ultraprocesamiento industrial (**clasificación NOVA**) y los aditivos químicos.
4. **Contexto Regional:** Incorpora los sellos negros de advertencia oficiales de la **Ley Nacional 27.642 de Argentina** (Etiquetado Frontal).

---

## 2. Estructura del Puntaje (0 a 100)

$$\text{Puntaje Total (0-100)} = \text{Calidad Nutricional (0-60)} + \text{Nivel de Procesamiento NOVA (0-25)} + \text{Seguridad de Aditivos (0-15)}$$

### A. Componente 1: Calidad Nutricional (Hasta 60 puntos)

Parte de una base de **40 puntos** y aplica deducciones por nutrientes críticos y bonificaciones por nutrientes protectores:

#### 1. Azúcares
- **En sólidos:**
  - Si $\le 2\text{ g/100g}$: $+6\text{ pts}$
  - Si $\le 5\text{ g/100g}$: $+2\text{ pts}$
  - Si $> 5\text{ g/100g}$: Deducción de hasta $-24\text{ pts}$ proporcional al exceso:
    $$\text{Deducción} = \min(24, (\text{azúcares} - 5) \times 1.1)$$
- **En líquidos / bebidas:**
  El azúcar líquido no aporta saciedad y eleva de golpe la glucosa en sangre:
  - Si $\le 0.5\text{ g/100ml}$: $+10\text{ pts}$ (agua, infusiones sin endulzar)
  - Si $> 2.5\text{ g/100ml}$: Deducción severa de hasta $-35\text{ pts}$:
    $$\text{Deducción} = \min(35, (\text{azúcares} - 2.5) \times 3.2)$$

#### 2. Grasas Saturadas (en sólidos)
- Si $\le 1.2\text{ g/100g}$: $+4\text{ pts}$
- Si $> 3.0\text{ g/100g}$: Deducción de hasta $-22\text{ pts}$:
  $$\text{Deducción} = \min(22, (\text{grasas sat.} - 3.0) \times 2.0)$$

#### 3. Sodio / Sal
- Si $\le 90\text{ mg/100g}$: $+4\text{ pts}$
- Si $> 300\text{ mg/100g}$: Deducción de hasta $-22\text{ pts}$:
  $$\text{Deducción} = \min(22, \frac{\text{sodio} - 300}{100} \times 2.8)$$

#### 4. Densidad Calórica Excesiva
- En sólidos $> 350\text{ kcal/100g}$ sin presencia de fibra: hasta $-14\text{ pts}$.
- En bebidas $> 25\text{ kcal/100ml}$ sin fibra: hasta $-12\text{ pts}$.

#### 5. Nutrientes Protectores (Bonificaciones)
- **Fibra alimentaria:**
  - $\ge 6\text{ g/100g}$: $+8\text{ pts}$
  - $\ge 3\text{ g/100g}$: $+5\text{ pts}$
  - $\ge 1.5\text{ g/100g}$: $+2\text{ pts}$
- **Proteínas:**
  - $\ge 12\text{ g/100g}$: $+8\text{ pts}$
  - $\ge 6\text{ g/100g}$: $+5\text{ pts}$
  - $\ge 3\text{ g/100g}$: $+2\text{ pts}$

> **Ajuste para aceites nobles:** En aceites vegetales puros (ej. Aceite de Oliva Virgen Extra, girasol alto oleico), el 100% de su composición es grasa pero de tipo mono/poliinsaturada cardiosaludable. No se les penaliza como chatarra y reciben una base fija de 48/60 pts en el bloque nutricional.

---

### B. Componente 2: Nivel de Procesamiento NOVA (Hasta 25 puntos)

La clasificación NOVA (creada por la Universidad de São Paulo y adoptada por la OMS/OPS) evalúa el grado de alteración industrial de los alimentos:

| Grupo NOVA | Definición | Puntos Otorgados |
| :--- | :--- | :---: |
| **NOVA 1** | **Alimentos sin procesar o mínimamente procesados** (frutas, verduras, carnes frescas, huevos, legumbres, avena, yogur natural sin azúcar). | **25 / 25 pts** |
| **NOVA 2** | **Ingredientes culinarios procesados** (aceite de oliva, manteca, miel, sal de mesa, harina simple). | **20 / 25 pts** |
| **NOVA 3** | **Alimentos procesados** (conservas artesanales en aceite/salmuera, quesos curados, panes simples). | **12 / 25 pts** |
| **NOVA 4** | **Alimentos ultraprocesados** (formulaciones industriales con colorantes, emulsionantes, potenciadores de sabor, snacks, gaseosas, cereales azucarados). | **0 / 25 pts** |

---

### C. Componente 3: Seguridad de Aditivos (Hasta 15 puntos)

Parte de una base de **15 puntos**. Cada aditivo detectado se evalúa en nuestro catálogo pedagógico:

- **Sin riesgo comprobado (Verde):** No resta puntos ($0\text{ pts}$). Ej: Ácido cítrico (E330), Vitamina C (E300), Pectina (E440), Goma xantana (E415), Stevia (E960), Lecitina (E322).
- **Precaución (Amarillo):** Resta $-3\text{ pts}$ cada uno. Ej: Aspartamo (E951), Acesulfamo K (E950), Benzoato de sodio (E211), Dióxido de azufre (E220), Caramelo IV (E150d), Glutamato monosódico (E621).
- **Evitar (Rojo):** Resta $-8\text{ pts}$ cada uno. Ej: Tartrazina (E102 / Amarillo 5), Amarillo Ocaso (E110 / Amarillo 6), Rojo Allura (E129 / Rojo 40), Nitrito de sodio (E250), Nitrato de sodio (E251).

$$\text{Puntos Aditivos} = \max(0, 15 - (\text{cant. Evitar} \times 8) - (\text{cant. Precaución} \times 3))$$

---

## 3. Escala Final de Calificación y Colores

| Rango de Puntos | Nivel | Color | Frase Resumen | Acción Recomendada |
| :---: | :---: | :---: | :--- | :--- |
| **75 – 100** | **Excelente** | 🟢 Verde Esmeralda | *Excelente opción para tu día a día* | Consumo habitual y libre. |
| **50 – 74** | **Bueno** | 🍏 Verde Lima / Amarillo | *Buena opción con moderación* | Apto para consumo regular. |
| **25 – 49** | **Mediocre** | 🟠 Naranja | *Consumo ocasional o con moderación* | Consumo esporádico. |
| **0 – 24** | **Malo** | 🔴 Rojo Coral | *Limitar o buscar alternativas más naturales* | Evitar o sustituir por opciones más naturales. |

---

## 4. Sellos de Advertencia Oficiales (Ley 27.642 Argentina)

El módulo calcula de forma autónoma los octógonos negros y rectángulos de precaución conforme al modelo de perfil de nutrientes de la OPS:

1. **EXCESO EN AZÚCARES:** Azúcares libres $\ge 10\%$ del total de energía (kcal).
   $$\frac{\text{azúcares (g)} \times 4}{\text{calorías (kcal)}} \ge 0.10$$
2. **EXCESO EN GRASAS TOTALES:** Grasas totales $\ge 30\%$ del total de energía.
   $$\frac{\text{grasas totales (g)} \times 9}{\text{calorías (kcal)}} \ge 0.30$$
3. **EXCESO EN GRASAS SATURADAS:** Grasas saturadas $\ge 10\%$ del total de energía.
   $$\frac{\text{grasas saturadas (g)} \times 9}{\text{calorías (kcal)}} \ge 0.10$$
4. **EXCESO EN SODIO:** Sodio $\ge 1\text{ mg por kcal}$, o $\ge 300\text{ mg por 100g/ml}$.
5. **EXCESO EN CALORÍAS:** Solo se aplica si el producto tiene al menos uno de los sellos anteriores de exceso de azúcares o grasas:
   - Sólidos: $\ge 275\text{ kcal por 100g}$.
   - Líquidos: $\ge 70\text{ kcal por 100ml}$.
6. **Leyendas Precautorias:**
   - `"CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS/AS"` si incluye edulcorantes calóricos o no calóricos.
   - `"CONTIENE CAFEÍNA: EVITAR EN NIÑOS/AS"` si incluye cafeína, taurina o extractos de café/guaraná.

---

## 5. Equivalencias Cotidianas en Lenguaje Simple

Para evitar la confusión con los gramos técnicos:
- **Cucharaditas de Azúcar:**
  $$\text{Cucharaditas} = \frac{\text{Azúcares (g)}}{4}$$
  *(1 cucharadita de té ≈ 4 gramos de azúcar común)*.
- **Sal Equivalente:**
  $$\text{Gramos de Sal} = \frac{\text{Sodio (mg)}}{1000} \times 2.5$$
  *(1 gramo de sodio = 2.5 gramos de sal común cloruro de sodio)*.
