# Decisiones técnicas — TOTALHIIT App

> Registro de decisiones con justificación breve. Las nuevas se agregan al final.

## D1 (2026-10-28) — Proyecto independiente con base de código única
Creación de `TotalhiitApp` separado del sitio (MiPrimeraApp), sin compartir
dependencias ni versiones. Un solo código React genera APK (Capacitor) y PWA (iOS/web).
Justificación: master prompt §3; evita duplicar lógica y mantenimiento.

## D2 — Versiones del stack (auditadas 28/10/2026 en el registro npm)
React 19.3.1 · TypeScript 7.0.2 · Vite 8.3.5 · @vitejs/plugin-react 6.1.2 ·
Tailwind 4.3.3 (+@tailwindcss/vite) · react-router 8.5.1 · Capacitor 8.5.3 (fase APK) ·
pdf-lib 1.17.1 · Dexie 4.4.7 · zod 4.6.7 · react-hook-form 7.91 + resolvers 6 ·
vitest 5.0.5 · vite-plugin-pwa 2.0.
Riesgo aceptado: TypeScript 7 es la nueva generación del compilador; si aparecen
incompatibilidades de tipos con librerías, se baja a TS 5.9 documentándolo.
Justificación: master prompt exige versiones estables actuales y compatibilidad verificada.

## D3 — Almacenamiento local-first con Dexie (IndexedDB)
El MVP no requiere backend; IndexedDB sirve datos estructurados offline en
Android WebView y Safari/iOS. Los repositorios quedan detrás de una interfaz
(`src/lib/datos/`) para migrar a Cloudflare Workers+D1 o Supabase sin reescribir UI.
Advertencia documentada: IndexedDB no cifra por sí solo; los datos del ciclo
menstrual recibirán capa de cifrado y consentimiento explícito en su fase.

## D4 — Estado de UI con React Context (sin librería de estado global)
Hasta que el estado global lo justifique, se evitan dependencias innecesarias.

## D5 — PWA con vite-plugin-pwa (manifest + precache + autoUpdate)
Si el plugin presentara conflicto de peers con Vite 8, se documenta y se migra a
service worker manual (patrón ya probado en InventarioSalón).

## D6 — PDF con pdf-lib
MIT, JS puro (funciona igual en WebView Android y Safari), permite A4, imágenes,
tablas y marca de agua diagonal en todas las páginas. Alternativas descartadas:
jsPDF (API menos cómoda para layout de tabla) y solución backend (dependencia de servidor en MVP).

## D7 — Recursos del sitio reutilizables bajo autorización del propietario
Logo (`logo_valen.jpeg`, respaldo `logo.png`), fuente Edo (uso comercial libre,
`public/fonts/README.txt`), paleta magenta, IDs de YouTube propios, textos del
bootcamp y material nutricional. NO se reutilizan auth/admin/pagos sin revisión de seguridad.

## D8 — Herramientas Android diferidas a la fase APK
JDK 21 + Android SDK no existen en esta PC; se instalan (con autorización) cuando
se llegue a la fase del APK. La PWA no depende de eso.

## D9 — Vulnerabilidades bajas de la cadena de build de vite-plugin-pwa
`npm audit` marca 4 vulnerabilidades LOW, todas en dependencias de BUILD
(`deepmerge` → `@rollup/plugin-node-resolve` → `workbox-build` → `vite-plugin-pwa`).
No afectan al código de la app en runtime (solo al proceso de generar el service
worker). `npm audit fix --force` degradaría vite-plugin-pwa a 0.2.1 (rompe la API):
se descarta. Se vigila la actualización de la cadena y se repite el audit en cada
fase (requisito de dependencias actualizadas del master prompt §8).

## D10 (2026-10-28) — Nombres de documentación según master prompt §12
Se adoptan exactamente: `docs/architecture.md`, `docs/roadmap.md`,
`docs/data-model.md`, `docs/security-privacy.md`, `docs/deployment.md`,
`docs/testing.md`, `ai/state.md`, `ai/decisions.md`, `ai/next-steps.md` (contenido
en español). Se retiraron los borradores `docs/arquitectura-app.md` y
`docs/plan-fases.md`. Cada sesión termina actualizando estos archivos.

## D11 (2026-10-28) — Roadmap definitivo recibido del propietario
El plan FASES 0–12 quedó registrado en `docs/roadmap.md` con criterios de
aceptación, matriz de dependencias, complejidad relativa y riesgos. Nota: la FASE 1
(fundación) ya había sido ejecutada con aprobación explícita del propietario
(carpeta + `npm install` autorizados), por lo que el flujo sigue en FASE 2.

## D12 (2026-10-28) — Convenciones de la capa de datos (aprendidas con pruebas)
- IndexedDB **no admite booleans como clave de índice**: el campo `activo` de
  objetivos se persiste como `1/0` (zod `union(literal 1, literal 0)`); las
  consultas compuestas usan `[userId+activo]` = `[userId, 1]`.
- `perfiles` lleva índice `createdAt` porque `perfilPrincipal()` ordena por él.
- Un único esquema zod de formulario (`formulario-esquema.ts`) alimenta onboarding
  y edición con react-hook-form (mismas secciones `<SeccionDatos|Objetivo|Preferencias>`);
  el resolutor se castea a `Resolver<FormPerfil>` para evitar fricción de tipos
  input/output de zod v4.
- `active` del onboarding saltado: bandera `localStorage` (`totalhiit.onboarding.saltado`).

## D13 (2026-10-28) — Fórmulas de salud y su presentación
- Mifflin-St Jeor para BMR (la más precisa para población general); sin género
  se usa el punto medio de los términos (+5 / −161 → −78).
- TDEE con factores estándar de actividad (1,2/1,375/1,55/1,725/1,9).
- Agua: 35 ml/kg (rango general 30–40); proteína: base 1,2 g/kg para +40
  (sarcopenia), 1,6 g/kg en objetivos de carga muscular, 1,4 resistencia.
- Toda fórmula vive en `src/lib/salud/` con su referencia en el comentario del
  módulo (requisito del master prompt) y su suite Vitest.
- UI: cifras grandes con degradado de marca y medidor de IMC segmentado;
  siempre con avisos de orientación (nada de diagnóstico clínico).
- Las kcal "para bajar/subir" se presentan como deltas orientativos
  (−500 / +300) sin planes de dieta automáticos.

## D14 (2026-10-28) — Identidad git del proyecto
Repo-local: Everth <ebolivar1000@gmail.com> (elegida por el propietario; la
cuenta de Cloudflare sigue siendo caribialabs@gmail.com). Artefactos
`.tsbuildinfo.*` excluidos del repo.

## D15 (2026-10-28) — Entrenamientos: contenido real del canal y reglas del motor
- El catálogo usa los 15 videos reales del canal del propietario (12 clases del
  bootcamp + intro + 2 de movilidad; mismos IDs de YouTube que el sitio), en
  modo privado (youtube-nocookie) con estados carga/error/offline.
- Las 10 categorías (§5.F) se derivaron del contenido real (activación, fuerza,
  core, cardio, hiit, tonificación, tren_inferior, tren_superior, movilidad,
  equilibrio) en `src/lib/entrenamiento/sesiones.ts`.
- **Regla dura del motor:** una sesión cuyo equipo requerido no está en el perfil
  nunca aparece (análoga a la de alérgenos de FASE 5; probada).
- DB v2: `sesiones` (id, userId, workoutId, fecha) y `favoritos` genéricos
  (`tipo: 'sesion'|'receta'`) para reutilizarlos en recetas. Exportación y
  borrado total incluyen ambas tablas.
- La escala de nivel del catálogo: semanas 1–2 principiante, 3–4 intermedio.

## D16 (2026-10-28) — Nutrición: motor determinista y catálogo propio
- Motor 100% determinista (sin IA): reglas duras alérgenos (match exacto
  case-insensitive) y exclusiones (match por nombre de ingrediente);
  presupuesto como escalera (bajo → solo bajo; medio → bajo+medio;
  alto/undefined → todo); filtro por ingrediente disponible.
- Escalado de porciones: factor = N / porcionesBase; cantidades redondeadas a
  2 decimales; macros totales = por porción × N.
- Catálogo: 12 recetas originales en `src/lib/nutricion/recetas.ts` con macros
  APROXIMADOS elaborados con tablas de dominio público (USDA FoodData Central);
  atribución en código y UI. No es precisión clínica (aviso visible).
- Ingredientes embebidos en la receta (no normalizados); la normalización
  FoodIngredient/RecipeIngredient del data-model queda diferida a FASE 9
  (lista de compras consolidada).
- DB v3: `preparaciones` (RecipePreparation) incluida en exportación/borrado.
- Snacks con 2 pasos son válidos (esquema min(2) pasos, no min(3)).

## D17 — FASE 6: PDF de recetas (2026-10-28)
- pdf-lib 1.17.1 (ya aprobado) genera PDF A4: logo opcional (`/images/logo.png`,
  PNG con fallback JPG, si falla se omite), meta, ingredientes escalados a las
  porciones (reutiliza `escalarReceta`), pasos, tabla nutricional (por porción
  y totales) y notas de fuentes (USDA FDC) + aviso no clínico.
- **Marca de agua TOTALHIIT semitransparente en TODAS las páginas**
  (`estamparMarcaAgua`, texto diagonal 45°, opacidad 0.08) + pie con numeración
  en cada página. Reutilizable tal cual para el plan semanal (FASE 9).
- Fuentes estándar Helvetica (WinAnsi): texto saneado antes de dibujar
  (curly quotes → rectas, en/em dash → '-', resto fuera de Latin-1 fuera).
  Los acentos/ñ/° sobreviven (probado).
- pdf-lib se carga con **import dinámico** desde el detalle de receta: queda en
  chunk separado (~424 kB / 177 gzip) y el main volvió a ~570 kB (sin el
  salto a 993 kB). Botón "Descargar PDF" con Blob + a[download]; el guardado/
  compartir en dispositivos reales (Android WebView / Safari) se prueba en
  FASE 11 (distribución APK / PWA).
- Pruebas: bytes válidos %PDF, A4 exacto, multi-página con contenido largo,
  marca de agua cuenta páginas, wrapText respeta ancho, nombre de archivo slug.

## D18 — FASE 7: progreso y sueño (2026-10-28)
- **Registro diario con upsert por día:** `guardarEntradaDiaria(userId, fecha,
  datos)` preserva id/createdAt, fusiona con la entrada previa y ELIMINA los
  campos enviados como `undefined` o `''` (permite limpiar un dato). Schema
  zod `entradaDiarioSchema` (todo opcional): pesoKg 25–400, energiaNivel/animo
  /calidadSueno 1–5, horasSueno 0–16, vasosAgua 0–24, notas ≤500.
- **DB v4:** store `entradasDiario` `'id, userId, fecha, [userId+fecha]'`;
  exportación pasa a versión 4 e incluye la nueva clave; borrado la limpia.
- **Racha sin culpa (criterio 4):** `rachaDiasActivos` cuenta días consecutivos
  con entreno O registro diario y SE MANTIENE si el último día activo fue ayer;
  solo vuelve a 0 si el último día activo es anterior a ayer. Copy "un día de
  descanso no rompe la racha". Sin puntuaciones.
- **Tendencia de peso sin juicio:** último registro vs el más antiguo dentro de
  30 días (≥2 registros); Δ a 1 decimal, sin adjetivos.
- **Sugerencias deterministas (sin IA):** orden fijo entrenamiento (vs semana
  pasada) → hidratación (vs meta 35 ml/kg → vasos 250 ml) → sueño (<7 h prom 7
  días) → peso (>14 días) → receta del motor (alérgenos+presupuesto+objetivo);
  máximo 3 (slice). Reutiliza `ordenarPorObjetivo` y `filtrarRecetas`.
- **El peso del registro puede actualizar el perfil** (checkbox activado) para
  que IMC/BMR/TDEE/agua sigan vigentes; no es automático silencioso.
- Gráficos: SVG polilínea + divs para barras (cero dependencias). FASE 7 no
  instaló dependencias nuevas.

## D19 — FASE 8: ciclo menstrual cifrado (2026-10-28)
- **El payload íntimo NUNCA se guarda en claro:** `datosCicloSchema` (flujo de
  `FLUJOS_CICLO`, síntomas, notas) se cifra con **WebCrypto AES-GCM-256** antes
  de `put`. La fila persistida (`cicloRegistroSchema`) solo tiene id, userId,
  fecha, `datosCifrados` ("iv.cifrado" en base64) y timestamps.
- **Clave:** aleatoria de 256 bits (`crypto.getRandomValues`), guardada SOLO en
  localStorage (`totalhiit.ciclo.clave`); IV nuevo por cifrado. Nunca se
  exporta. **Limitación honesta:** acceso completo al dispositivo (DB +
  localStorage) permite recuperar la clave; protege la DB sola (respaldos,
  copias, lecturas directas). FASE 10 evaluará derivación con PIN.
- **Descifrado solo en memoria:** `registrosCicloLegibles` descifra al vuelo;
  registros corruptos (otra clave/dato alterado) se omiten sin exponer nada.
  Sin `console.log` de contenido; la app no tiene telemetría.
- **Exportación v5:** incluye `ciclo` con el cifrado intacto (la clave NO sale);
  `borrarDatosPersonales` limpia el store (la clave local se borra aparte con
  localStorage del dispositivo en borrado total — ver Ajustes).
- **Puerta de consentimiento:** `/ciclo` consulta `tieneConsentimiento('menstrual')`
  ANTES de leer/descifrar nada; activar → otorgarConsentimiento + crear clave;
  desactivar (doble confirmación) → revocar + `borrarTodosRegistrosCiclo`.
- **Estimaciones con incertidumbre:** episodios de sangrado agrupan días con
  gap ≤ 2 días calendario (un día sin registro no corta); duraciones entre
  inicios; ventana del próximo inicio = [último + mínima − 3, último + máxima
  + 3]; irregular si duraciones fuera de 21–35 (fuera_de_rango) o desviación
  > 7 días con ≥3 ciclos (variacion_alta). Con <2 ciclos: mensaje honesto sin
  estimar. Aviso explícito: orientativo, no anticonceptivo, no diagnóstico.
- Node en pruebas no tiene localStorage: stub en `repositorio.test.ts` +
  resolución segura de almacenamiento en `cifrado.ts`.
- Accesos: ruta `/ciclo` + tarjetas en Inicio y Progreso. Cero dependencias
  nuevas (WebCrypto nativo).

## D20 — FASE 9: menús semanales y lista de compras (2026-10-28)
- **Planificación determinista, sin IA:** `planificador.ts` cubre 7 días ×
  desayuno/almuerzo/cena/snack usando `filtrarRecetas` + `ordenarPorObjetivo`
  (las reglas duras de alérgenos/exclusiones del motor se aplican igual que en
  la FASE 5); snack acepta categorías snack/bebida/postre. Rotación por
  índice de día (`dia % candidatas.length`): determinista y variada; con una
  sola candidata se repite honestamente; sin candidatas el slot se omite.
- **Modelo:** `planSemanalSchema` con `semanaInicio` = lunes ISO (reutiliza
  `lunesDeSemana` de FASE 7) y slots únicos por `[dia, comida]`
  (`reemplazarSlot` normaliza). DB v6 store `planes`
  (`'id, userId, semanaInicio, [userId+semanaInicio]'`); `guardarPlanSemanal`
  hace upsert conservando id/createdAt; un plan por semana (regenerar
  reemplaza; semanas anteriores quedan en el historial).
- **Lista de compras:** `consolidarCompras` suma por clave nombre+unidad
  (case-insensitive) con el factor de porciones del plan; los ingredientes sin
  cantidad ("a gusto") van aparte, sin sumar; unidades distintas del mismo
  alimento quedan en líneas separadas (sin conversión de unidades en MVP).
- **PDF del plan:** `pdf.ts` refactorizado con `crearMarco` (cabecera logo +
  wordmark reutilizable) y `generarPdfPlan`: una sección por día con las 4
  comidas (receta, tiempo) y la lista de compras del día con cantidades;
  misma marca de agua + pie en todas las páginas; `cargarLogoPdf` exportada
  y compartida con el detalle de receta.
- **UI `/plan`:** si no hay plan para la semana → CTA "Generar mi plan" (usa
  alérgenos/exclusiones/presupuesto/porciones del perfil y el objetivo activo);
  si hay → regenerar (reescribe slots), toggle compras, PDF, y un Selector por
  comida para reemplazar desde el catálogo filtrado + link "ver →" al detalle.
  Cero dependencias nuevas; pdf-lib sigue en chunk lazy (import dinámico).
