# Guía de Publicación y Metadatos para Amazon Developer Console
## App: TOTALHIIT (v1.0.14 - Build 15)

Esta carpeta contiene **todos los artefactos y metadatos oficiales listos para subir** a la consola de [Amazon Developer](https://developer.amazon.com/apps-and-games/console).

---

## 1. Archivos listos en esta carpeta (`amazon-developer/`)

| Archivo | Descripción | Requisito de Amazon |
|---|---|---|
| `app-release.apk` | APK compilado en modo Release, firmado con `totalhiit-release.keystore` (RSA 2048, SHA256, esquemas v2 y v3, targetSdkVersion 34, minSdk 24). | **Obligatorio** en la pestaña *APK Files*. |
| `icon-512.png` | Ícono oficial de la aplicación (512 × 512 px PNG). | **Obligatorio** en *Images & Multimedia*. |
| `icon-114.png` | Ícono pequeño de la aplicación (114 × 114 px PNG). | **Obligatorio** en *Images & Multimedia*. |
| `promo-banner-1024x500.png` | Banner promocional de alta definición (1024 × 500 px PNG). | **Recomendado / Requerido** para destacados en la tienda. |

---

## 2. Metadatos listos para Copiar y Pegar en Amazon Developer

### A. General Information (Información General)
- **App Title / Nombre de la App:** `TOTALHIIT`
- **App Subtitle / Subtítulo:** `Fitness, Nutrición Antiinflamatoria y Escáner de Alimentos +40`
- **Application ID / Identificador de paquete:** `com.totalhiit.app`
- **Default Language / Idioma predeterminado:** Spanish / Español
- **App Category / Categoría:** `Health & Fitness` (Salud y Forma Física)
- **Customer Support Email:** `soporte@totalhiit.com` (o `ebolivar1000@gmail.com`)
- **Customer Support Website:** `https://totalhiit-app.caribialabs.workers.dev/`
- **Privacy Policy URL / Política de Privacidad:** `https://totalhiit-app.caribialabs.workers.dev/`

---

### B. Descriptions (Descripciones)

#### Short Description (Descripción Corta - máx. 1200 caracteres)
```text
TOTALHIIT es la app de bienestar y actividad física creada especialmente para mujeres de más de 40 años. Disfruta de entrenamientos HIIT guiados y adaptados para proteger tus articulaciones, planes de nutrición antiinflamatoria con listas de compras inteligentes, calculadoras de salud (IMC, metabolismo, proteína y agua diaria), calendario privado de ciclo menstrual y un innovador escáner de etiquetas de supermercado que evalúa alimentos con semáforos nutricionales, octógonos oficiales y análisis de aditivos.
```

#### Long Description (Descripción Larga)
```text
Bienvenida a TOTALHIIT, la plataforma integral de entrenamiento, nutrición y salud diseñada específicamente para el cuerpo, metabolismo y ritmo de las mujeres mayores de 40 años.

Guiada por la Coach Valentina, TOTALHIIT combina la ciencia del ejercicio funcional con hábitos de nutrición antiinflamatoria para ayudarte a ganar vitalidad, regular tus hormonas y tonificar tu cuerpo cuidando tus articulaciones.

¿Qué incluye TOTALHIIT?

🔥 1. ENTRENAMIENTOS HIIT TOTAL+40
- Rutinas en video paso a paso sin impacto destructivo para tus rodillas y espalda.
- Clases organizadas por semanas, duración (15, 20 o 30 minutos) y equipamiento disponible en casa.
- Cronómetro de intervalos adaptado e instrucciones de técnica segura.

🥗 2. NUTRICIÓN INTELIGENTE Y ANTIINFLAMATORIA
- Recetas deliciosas y balanceadas formuladas para reducir inflamación y controlar la glucosa.
- Filtrado inteligente por intolerancias o alergias (sin gluten, sin lactosa, frutos secos, vegetariano, etc.).
- Planificador semanal de comidas con generación automática de lista de compras organizada por pasillos.
- Descarga e impresión de planes y recetas en formato PDF.

🔬 3. ESCÁNER DE ETIQUETAS DE SUPERMERCADO (Fase Beta)
- Apunta la cámara al código de barras de cualquier producto en el supermercado y obtén su nota de salud (0-100) en 3 segundos.
- Adaptado a la normativa oficial de tu país:
  * México: Sellos NOM-051 y leyendas precautorias.
  * Colombia: Sellos de advertencia Resolución 2492 / Ley 2120.
  * Chile: Sellos "Alto en" Ley 20.606.
  * Perú: Sellos "Alto en" Ley 30021.
  * Argentina: Octógonos negros Ley 27.642.
  * España: Equivalencias Nutri-Score (A-E).
- Semáforo de nutrientes críticos (azúcares, grasas saturadas, sodio, calorías) con equivalencias cotidianas.
- Análisis detallado de aditivos alimentarios y sugerencia de alternativas más saludables.

❤️ 4. SALUD Y COMPOSICIÓN CORPORAL
- Calculadoras precisas adaptadas a mujeres +40: Índice de Masa Corporal (IMC), Tasa Metabólica Basal (BMR), Gasto Calórico Total Diario (TDEE), ingesta óptima de proteína y requerimiento diario de hidratación.

🌸 5. CICLO MENSTRUAL Y BIENESTAR FEMENINO
- Calendario menstrual y perimenopáusico flexible con estimación de fases hormonales.
- Privacidad absoluta: tus datos de salud se almacenan de forma local en tu dispositivo con cifrado.

📈 6. PROGRESO Y HÁBITOS
- Registro de rachas de actividad, energía matutina, horas de sueño, vasos de agua y notas personales.

¡Comienza hoy tu transformación con TOTALHIIT y descubre tu mejor versión a partir de los 40!
```

---

### C. Product Feature Bullets (Viñetas de Funcionalidades - 3 a 5 viñetas)
```text
- Entrenamientos HIIT guiados en video adaptados para articulaciones de mujeres de más de 40 años.
- Recetas antiinflamatorias y planificador semanal de comidas con lista de compras automática.
- Escáner de productos de supermercado con nota de salud 0-100, octógonos oficiales y aditivos.
- Calculadoras de salud corporal: metabolismo basal, gasto calórico, proteína y meta de hidratación.
- Calendario de bienestar femenino y ciclo menstrual con almacenamiento local y privacidad total.
```

---

### D. Keywords (Palabras Clave de Búsqueda)
```text
fitness, hiit, nutricion, mujeres, recetas, salud, entrenamiento, escaner, alimentos, calorias, menopausia, bienestar, ejercicios en casa, peso
```

---

### E. Content Rating (Clasificación de Contenido)
En el cuestionario de clasificación de contenido de Amazon Appstore:
- **Violencia:** Ninguna
- **Lenguaje inapropiado:** Ninguno
- **Drogas, alcohol o tabaco:** Ninguno
- **Contenido sexual:** Ninguno
- **Compras integradas:** No (o habilitar según el modelo de suscripción configurado)
- **Comparte ubicación del usuario:** No
- **Resultado esperado:** Apta para todo público (General Audience / All Ages).

---

### F. Device Support & Compatibility (Compatibilidad de Dispositivos)
- **Tablets Amazon Fire:** Fire 7, Fire HD 8, Fire HD 10, Fire Max 11 (todas las generaciones con Fire OS 7, 8 y superiores).
- **Dispositivos Android sin Amazon:** Totalmente compatible (Android 7.0 Nougat API 24 hasta Android 15 API 35).
- **Target SDK:** 34 (Android 14, exigencia oficial de Amazon).
- **Compile SDK:** 36.
- **Hardware requerido:**
  - `android.hardware.camera` (opcional / `required="false"`)
  - `android.hardware.touchscreen` (opcional / `required="false"`)
  - `supports-screens`: Soporta pantallas pequeñas, normales, grandes y extra grandes.

---

### G. Firma y Seguridad de la Keystore
- **Archivo de Keystore:** `android/app/totalhiit-release.keystore`
- **Alias:** `totalhiit`
- **Contraseña:** `totalhiit2026`
- **Tipo:** PKCS12 (RSA 2048 bits, SHA384withRSA)
- **Validez:** 10.000 días (~27 años, hasta el año 2054)
- **Esquemas de firma activos:** APK Signature Scheme v2 y v3 (reconocidos por Amazon Appstore).

> **IMPORTANTE:** Guarda una copia de respaldo del archivo `totalhiit-release.keystore` y su contraseña en un lugar seguro (gestor de contraseñas o almacenamiento cifrado). Si se pierde, no se podrán actualizar versiones existentes en las tiendas.
