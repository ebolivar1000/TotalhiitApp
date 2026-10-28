# Progreso — TOTALHIIT App

## 2026-10-28 (sesión 13) — Ajustes UX, Español Neutro, Ciclo Flexible, Catálogo Completo y Compilación Nativa APK
- **Compilación Nativa de Android APK:**
  compilación exitosa en local con Gradle 8.14.3, OpenJDK 21 y Android SDK 35/36 (`android/app/build/outputs/apk/debug/app-debug.apk`, ~5 MB).
  Desplegado en Cloudflare con acceso directo para descarga en celular vía `https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk` y botones de descarga directa en pantalla de Inicio y Ajustes.
- **Ciclo Menstrual flexible:**
  calendario interactivo posicionado arriba con selección de día y navegación de meses; soporte para registrar períodos completos con rango de fechas personalizable (inicio y fin) o registros por día; métricas y episodios adaptados.
- **Español neutro de Latinoamérica:**
  reemplazo integral del voseo argentino por español neutro (completa, revisa, tienes, eres, puedes, haz, ingresa, elige, disfruta, aquí) en formularios, esquemas Zod, componentes y todas las pantallas.
- **Catálogo de entrenamientos ordenado por semana:**
  las 12 clases del programa + 2 de estiramientos organizadas por semana (Semana 1, Semana 2, Semana 3, Semana 4, Estiramientos) con pestañas dedicadas; las clases con mancuernas no se ocultan, sino que se destacan con badge informativo.
- **Espaciado inferior y UX móvil:**
  aumento de padding inferior (`pb-48` / `pb-52`) y espaciadores finales en todas las pantallas para evitar solapamientos con la barra de navegación del navegador o el sistema.
- **Módulo de progreso flexible:**
  selector de fecha personalizable (`<input type="date">` y calendario interactivo) para registrar o editar cualquier día pasado o futuro; función `borrarEntradaDiaria` con prueba unitaria dedicada.
- **Botones de PDF:**
  etiquetas simplificadas a "Descargar en PDF" (conservando la marca de agua interna TOTALHIIT).
- **Verificación:** 183/183 pruebas unitarias en verde (`npm test`) y build TypeScript sin errores (`npm run build`).

## 2026-10-28 (sesión 12) — FASE 11 cerrada (distribución APK + PWA)
- **Capacitor 8 para Android APK:**
  instalación de `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` v8.6.0;
  inicialización de `com.totalhiit.app` (`capacitor.config.ts`);
  plataforma nativa `android/` configurada con permisos mínimos (`INTERNET`,
  `ACCESS_NETWORK_STATE`) y `allowBackup="true"`.
- **Firma y compilación reproducible:**
  `android/app/build.gradle` configurado con soporte para firma de release
  mediante variables de entorno/propiedades; script de generación de keystore
  `scripts/generar-keystore.ps1` (RSA 2048, 10.000 días de validez);
  `.keystore`, `.jks`, `.apk` excluidos del repo en `.gitignore`.
  Workflow automatizado CI en `.github/workflows/build-apk.yml` (compilación
  en la nube con Ubuntu y JDK 21 Temurin).
- **PWA en Cloudflare Pages:**
  `public/_redirects` (`/* /index.html 200`) para SPA; `public/_headers` con
  seguridad OWASP y política de autoUpdate (`/sw.js` y manifest sin caché,
  `/assets/*` inmutables por 1 año).
- **Materiales de distribución para la usuaria:**
  guía completa de instalación fuera de Google Play (`docs/guia-instalacion-apk.md`)
  con explicación transparente del aviso de Play Protect para mujeres +40;
  bloque HTML/Tailwind preparado para el sitio web (`docs/enlace-descarga-web.md`)
  sin tocar el repositorio del sitio existente.
- **Resiliencia offline y accesibilidad:**
  monitor desacoplado `MonitorConexion` (`src/lib/red/conexion.ts`), hook `useConexion`
  con `useSyncExternalStore` (React 19) y banner superior accesible `AvisoConexion`
  (`role="status"`, `aria-live="polite"`).
- **Verificación:** `tsc -b` ✅ · **vitest 180/180** ✅ (3 nuevas: monitoreo de red,
  notificación a suscriptores, desuscripción limpia) · `npm run cap:copy` ✅ ·
  build web y sincronización nativa en verde.
- Docs actualizadas (`docs/roadmap.md`, `docs/deployment.md`, `ai/state.md`, `ai/next-steps.md`, D25–D27).

## 2026-10-28 (sesión 11) — FASE 10 cerrada (identidad, sync y premium)
- **Comparativa de Backend documentada** (`docs/comparacion-backend.md`):
  análisis exhaustivo Cloudflare Workers+D1(+R2) vs Supabase con límites de plan
  gratis verificados. Supabase suspende proyectos tras 7 días de inactividad,
  mientras que Cloudflare D1 ofrece 5 GB de BD sin suspensiones y R2 ofrece 10 GB
  con $0 por transferencia saliente (egress). Se adoptó Cloudflare aprovechando la
  cuenta existente (`caribialabs@gmail.com`).
- **Modelo de amenazas y privacidad de datos íntimos** (`docs/threat-model-sync.md`):
  análisis STRIDE/OWASP. Regla: el ciclo menstrual permanece solo local por defecto;
  si se sincroniza, se exige cifrado **Zero-Knowledge con PIN** en cliente
  (`src/lib/seguridad/pin-crypto.ts`, WebCrypto PBKDF2 100k + AES-GCM-256). El servidor
  recibe únicamente texto cifrado ininteligible.
- **Entitlements y validación en servidor** (`src/lib/premium/entitlements.ts`):
  roles `invitado`, `usuario`, `premium`, `admin`. Regla dura inviolable:
  el ciclo menstrual básico, las calculadoras y la exportación de datos son **SIEMPRE GRATIS**.
  La autorización se valida estrictamente en el backend (`validarPermisoServidor`);
  sin pasarelas de pago hasta decisión del propietario.
- **Autenticación y sesión local-first** (`src/lib/auth/auth.ts`):
  esquemas Zod de credenciales con complejidad obligatoria, sesión con persistencia
  local segura y modo invitado por defecto.
- **Motor de sincronización Local-First** (`src/lib/sync/sync-engine.ts`):
  resolución de conflictos Last-Write-Wins (LWW), cola offline con vaciado automático
  al sincronizar, soporte de lápidas (soft delete) y verificación de seguridad obligatoria
  que rechaza sincronizar datos íntimos en claro.
- **UI `/ajustes` actualizada:**
  sección "Cuenta y Membresía" (estado de invitado/usuario y aviso de gratuidad),
  sección "Sincronización y Respaldo" con selector de privacidad para el ciclo
  ("Solo en este dispositivo" vs "Cifrado Zero-Knowledge con PIN").
- **Verificación:** `tsc -b` ✅ · **vitest 177/177** ✅ (30 pruebas nuevas: 6 de PIN crypto,
  12 de entitlements y permisos de servidor, 6 de auth y sesión, 6 de sync engine) ·
  build de producción PWA ✅ (main 615 kB, pdf 426 kB lazy).
- Docs actualizadas (roadmap FASE 10 tildada, state, next-steps, D21–D24, backend y threat model).

## 2026-10-28 (sesión 10) — FASE 9 cerrada (menús semanales, compras y PDF del plan)
- **Modelo + DB v6:** `planSemanalSchema` (semana arranca en lunes, slots únicos
  por día/comida, porciones del plan) y store `planes` con índice
  `[userId+semanaInicio]`; `guardarPlanSemanal` hace upsert conservando
  id/createdAt; exportación pasa a **versión 6** y el borrado definitivo limpia
  los 10 stores.
- **Planificador determinista** (`src/lib/nutricion/planificador.ts`): 7 días ×
  desayuno/almuerzo/cena/snack con `filtrarRecetas` + `ordenarPorObjetivo`
  (alérgenos/exclusiones/presupuesto/objetivo del perfil, sin IA), rotación por
  día, `recetasParaComida` para el reemplazo manual y `reemplazarSlot`.
- **Lista de compras consolidada** (`compras.ts`): suma por nombre+unidad
  escalada a las porciones del plan, "a gusto" aparte y orden alfabético es-AR.
- **PDF del plan** (`pdf.ts` refactorizado): `crearMarco` compartido (cabecera
  con logo + wordmark) + `generarPdfPlan` (sección por día con las 4 comidas y
  lista de compras del día con cantidades) + `nombreArchivoPdfPlan`;
  `cargarLogoPdf` exportada y reutilizada por el detalle de receta. Marca de
  agua + pie en todas las páginas.
- **UI `/plan`:** CTA "Generar mi plan" si no hay plan de la semana; regenerar,
  toggle de compras, PDF (import dinámico) y Selector por comida para cambiar
  cualquier slot con link al detalle. Enlace "Plan semanal →" en la tarjeta de
  Nutrición de Inicio.
- **Verificación:** `tsc -b` ✅ · **vitest 147/147** ✅ (14 nuevas: determinismo,
  cobertura de categorías, alérgenos, reemplazo, upsert por semana, historial,
  compras, exportación v6, PDF del plan) · build ✅ (main 611 kB, pdf 426 kB
  lazy) · dev 5174 responde en `/plan`.
- Docs actualizadas (roadmap FASE 9 tildada, state, next-steps, D20).

## 2026-10-28 (sesión 9) — FASE 8 cerrada (ciclo menstrual, privacidad estricta)
- **Cifrado local** (`src/lib/ciclo/cifrado.ts`): WebCrypto AES-GCM-256 con
  clave aleatoria que vive solo en `localStorage`; IV nuevo por cifrado; helpers
  exportados (crear/importar/cifrar/descifrar/obtenerOCrear/borrarClave) con
  almacenamiento inyectable para pruebas.
- **Registro cifrado:** la fila en IndexedDB (DB v5, store `ciclo`) solo tiene
  metadatos + `datosCifrados`; flujo/síntomas/notas se cifran ANTES del `put`
  y se descifran solo en memoria al leer (los corruptos se omiten). Upsert por
  día preservando id/createdAt.
- **Privacidad verificada con pruebas:** ni la fila cruda ni la exportación
  serializada (v5) contienen el contenido en claro; la clave nunca sale del
  dispositivo; sin telemetría ni logs. 133/133 pruebas.
- **Estimaciones honestas** (`estimaciones.ts`): episodios (gap ≤2 días), ciclos
  por inicios, ventana del próximo inicio = [mín−3, máx+3] con centro estimado,
  irregularidad marcada con motivo (fuera de 21–35 o variación >7 días) y
  estados con 0/1 ciclo sin inventar predicciones.
- **UI `/ciclo`:** puerta de consentimiento (explica cifrado/borrado, con "No,
  gracias" y desactivación con doble confirmación + borrado total del módulo),
  registro de hoy (flujo chips, síntomas sugeridos + libres, notas), calendario
  del mes (sangrado/manchado/ventana punteada/hoy), historial de ciclos y
  avisos ("no sirve para prevenir ni planificar embarazos").
- Accesos: ruta `/ciclo` + tarjetas en Inicio y Progreso. Sin dependencias
  nuevas; build con pdf lazy; dev 5174 responde en `/ciclo`.
- Docs actualizadas (roadmap FASE 8 tildada, state, next-steps, D19).

## 2026-10-28 (sesión 8) — FASE 7 cerrada (progreso y sueño)
- **Modelo de registro diario** (`entradaDiarioSchema`): una entrada por usuario
  y día con upsert (`guardarEntradaDiaria` preserva id/createdAt, fusiona con lo
  previo y limpia los campos enviados como `undefined`/`''`). Campos voluntarios:
  peso (25–400), energía y ánimo 1–5, horas de sueño (0–16), calidad 1–5,
  vasos de agua (0–24) y notas (500).
- **DB v4:** store `entradasDiario` con índice `[userId+fecha]`; exportación
  (version 4) y borrado definitivo incluyen el nuevo store.
- **Métricas puras** (`src/lib/progreso/metricas.ts`, con fórmulas documentadas):
  racha de días activos (hoy o ayer; el descanso de hoy NO rompe la racha),
  promedio en ventana de N días, tendencia de peso (último vs más antiguo en 30
  días, ≥2 registros, Δ redondeado) y resúmenes semanales lunes–domingo.
- **Sugerencias del dashboard** (`recomendaciones.ts`): reglas deterministas y
  orden fijo (entrenamiento vs semana pasada → hidratación vs meta 35 ml/kg →
  sueño <7 h → peso si pasaron 14 días → receta del motor con alérgenos y
  presupuesto aplicados), máximo 3, sin culpabilización.
- **Gráficos propios** (`componentes/graficos.tsx`): línea SVG (polilínea +
  puntos + min/max) y barras por div; cero librerías nuevas.
- **Página `/progreso` completa:** racha en hero magenta, 4 métricas rápidas,
  formulario "Registro de hoy" (chips 1–5, checkbox para actualizar el peso del
  perfil usado por las calculadoras), gráficos, calendario de actividad del mes
  (entreno/registro/hoy), últimas 4 semanas y sugerencias. Copy sin juicios y
  aviso de datos solo locales.
- **Verificación:** `tsc -b` ✅ · **vitest 118/118** ✅ (25 nuevas: calendario,
  racha con huecos/duplicados, ventanas de promedio, tendencia y semanas,
  sugerencias con máximo 3, upsert/limpieza/rango/limite del registro diario,
  exportación v4 + borrado) · build ✅ (main 588 kB, pdf 424 kB lazy) ·
  dev server 5174 responde en `/progreso`.
- Docs actualizadas (roadmap FASE 7 tildada, state, next-steps, D18).

## 2026-10-28 (sesión 7) — FASE 6 cerrada (PDF de recetas)
- **Servicio `src/lib/nutricion/pdf.ts`** con pdf-lib: A4 exacto, logo opcional
  (`/images/logo.png` con fallback JPG y omisión en caso de error), título + meta
  (categoría, tiempo, fecha), descripción, ingredientes escalados a las porciones
  (reutiliza `escalarReceta`), pasos numerados con envoltura de línea
  (`wrapText`), sustituciones/conservación, tabla nutricional de dos filas (por
  porción y total N) dibujada con rects/bordes, y notas de fuentes (USDA FDC) +
  aviso no clínico + uso personal.
- **Marca de agua TOTALHIIT** (`estamparMarcaAgua`): texto diagonal 45° magenta
  con opacidad 0.08 estampado en **todas las páginas** + pie con numeración
  "n / total" en cada página. Exportada para reutilizar en el PDF del plan
  semanal (FASE 9).
- **Sanitización WinAnsi** (fuentes estándar): curly quotes → rectas, en/em dash
  → '-', y cualquier carácter fuera de Latin-1 eliminado; acentos/ñ/° intactos
  (probado).
- **Descarga en UI:** botón "⬇ Descargar PDF con marca de agua" en
  `/nutricion/:id` con estado "Generando PDF…". Guardado por Blob + a[download]
  (mismo mecanismo válido para Android WebView y Safari). La prueba en
  dispositivos reales queda para FASE 11 (anotada en roadmap y D17).
- **Code-splitting del PDF:** el import estático había llevado el main a 993 kB;
  con **import dinámico** pdf-lib queda en chunk propio `pdf-*.js`
  (424 kB / 177 kB gzip, cargado solo al descargar) y el main volvió a ~570 kB.
- **Verificación:** `tsc -b` ✅ · **vitest 93/93** ✅ (8 nuevas: PDF válido con
  acentos, A4 exacto, totales con 6 porciones, multi-página, sin logo con fecha
  fija, marca de agua en 3 páginas, wrapText ancho/saneo, nombre de archivo
  slug) · build ✅.
- Docs actualizadas (roadmap FASE 6 tildada, state, next-steps, D17).

## 2026-10-28 (sesión 6) — FASE 5 cerrada (nutrición y recetas)
- **Catálogo propio** (`src/lib/nutricion/recetas.ts`): 12 recetas originales
  para +40 en 6 categorías (desayuno/almuerzo/cena/snack/bebida/postre), con
  macros por porción, alérgenos declarados, objetivos compatibles,
  sustituciones, conservación y tiempos; ingredientes embebidos (normalización
  FoodIngredient diferida a FASE 9).
- **Motor determinista** (`motor.ts`): **regla dura de alérgenos con prueba
  obligatoria en verde** (ningún alérgeno cargado pasa, case-insensitive),
  exclusiones por nombre de ingrediente, presupuesto escalera, filtro "¿qué
  tenés en casa?" por ingrediente y orden por objetivo.
- **Escalado de porciones:** cantidades y macros totales recalculados (1–6).
- **DB v3:** `preparaciones` (RecipePreparation); exportación y borrado la incluyen.
- **Pantallas:** `/nutricion` (búsqueda por ingrediente, chips de categoría,
  ⭐ favoritas, badge "Preparada N×", aviso de protección del motor) y
  `/nutricion/:id` (macros por porción + totales, selector de porciones,
  ingredientes escalados, pasos, sustituciones/conservación, "La preparé",
  historial, fuentes USDA FDC).
- **Suite: 85/85 en verde** (+17 motor/catálogo, +1 preparaciones).
- **Verificación:** `tsc -b` ✅ · build ✅ (chunk 567 kB) · roadmap FASE 5 tildada.

## 2026-10-28 (sesión 5) — FASE 4 cerrada (entrenamientos)
- **Catálogo real:** 15 sesiones del canal del propietario (12 clases del
  bootcamp TOTAL+40 + intro + 2 de movilidad) en
  `src/lib/entrenamiento/sesiones.ts`, con 10 categorías derivadas del
  contenido, nivel, duración, equipo, objetivos compatibles y precauciones.
- **Motor de filtros** (`filtros.ts`) con **regla dura de equipo** (nunca sugiere
  equipo que falta en el perfil; `peso_corporal` siempre disponible) + filtros
  por categoría/duración/nivel/objetivo y orden "para tu objetivo".
- **DB v2:** stores `sesiones` (entrenamientos realizados) y `favoritos`
  genéricos (sesión|receta). Exportación JSON y borrado total incluyen ambas.
- **Reproductor** (`ReproductorVideo`): YouTube en modo nocookie con estados de
  carga, error (con "Ver en YouTube" + reintentar) y **offline** (detecta
  navigator.onLine).
- **Pantallas:** `/entrenamientos` (chips de categoría y duración, badge "Para
  tu objetivo", ⭐ favoritos, "Hecha N×", historial de últimas sesiones) y
  `/entrenamientos/:id` (reproductor, descripción, precauciones, equipo,
  "Completé esta clase" que registra la sesión, favoritos, historial por clase).
- **Suite: 68/68 en verde** (+10 de catálogo/filtros, +3 de repositorio).
- **Verificación:** `tsc -b` ✅ · build ✅ (chunk 542 kB) · roadmap actualizado
  (nota: registro de peso queda para FASE 7 junto al dashboard de Progreso).

## 2026-10-28 (sesión 4) — FASE 3 cerrada (calculadoras de salud)
- **Commit inicial creado** (117f261) con identidad repo-local git
  (Everth / ebolivar1000@gmail.com; Cloudflare sigue con caribialabs@gmail.com).
  Se excluyeron del repo los artefactos `.tsbuildinfo.*`.
- **Librería de fórmulas con pruebas** (cada una con su suite Vitest):
  - `bmr.ts` — Mifflin-St Jeor (10·kg + 6,25·cm − 5·edad + 5/−161; sin género → −78).
  - `tdee.ts` — BMR × factor de actividad estándar (1,2/1,375/1,55/1,725/1,9).
  - `hidratacion.ts` — 35 ml/kg con 1 decimal.
  - `proteina.ts` — base 1,2 g/kg (+40); 1,6 en objetivos de carga muscular; 1,4 resistencia.
  - `imc.ts` — se agregó `rangoPesoSaludable` (IMC 18,5–24,9 → kg).
- **Pantalla `/salud` (nueva, diseño premium):** tarjeta hero con degradado de
  marca para el IMC (número grande, chip de categoría con color por tramo,
  medidor segmentado animado con marcador, rango de peso saludable), cards
  BMR/TDEE con referencia de kcal para bajar/subir, cards agua y proteína
  ajustadas al objetivo activo, entradas peso/estatura precargadas desde el
  perfil (editables solo para el cálculo), avisos y limitaciones honestas.
- Navegación: entrada "Salud" en Inicio + ruta `/salud`.
- **Verificación:** `tsc -b` ✅ · **vitest 56/56** ✅ (23 nuevas) · build ✅
  (chunk 521 kB — code-splitting sigue pendiente menor).

## 2026-10-28 (sesión 3) — FASE 2 cerrada (onboarding y perfil)
- **Capa de datos con pruebas:** `src/lib/datos/entidades.ts` (schemas zod de
  perfil, objetivo, preferencias, consentimientos), `db.ts` (Dexie v1: perfiles,
  objetivos, preferencias, consentimientos), `repositorio.ts` (guardar/obtener
  perfil, objetivo activo con vigencia histórica, preferencias por usuario,
  otorgar/revocar consentimientos, exportar JSON, borrado total transaccional).
- **Suite total: 33/33 en verde** (fechas 9 + entidades + repositorio + IMC 8).
- Correcciones que las pruebas obligaron a hacer (valor de tenerlas primero):
  IndexedDB no admite booleans como clave de índice → `activo` se persiste 1/0;
  `perfilPrincipal` requería índice `createdAt`; auto-import accidental en `ids.ts`.
- **UI completa de FASE 2:** `formulario-esquema.ts` (zod compartido para
  onboarding/edición), primitivas de diseño (`componentes/ui.tsx`), secciones de
  formulario reutilizables (`componentes/formulario/Secciones.tsx`), hook `usePerfil`.
- **Onboarding 5 pasos** (bienvenida → datos → objetivo → preferencias →
  consentimientos y resumen) con react-hook-form + zod; saltado con bandera en
  localStorage; registra consentimientos `perfil` y `salud_general` v1.
- **`/perfil` (vista) y `/perfil/editar`:** reutilizan las mismas secciones;
  cambiar objetivo cierra el anterior con fecha (historial intacto).
- **Guard en App:** sin perfil → redirige a `/onboarding`; con perfil en
  onboarding → vuelve a inicio.
- **Ajustes reales:** exportar JSON (descarga), borrado definitivo con doble
  confirmación, resumen de privacidad y versión.
- **Verificación:** `tsc -b` ✅, vitest 33/33 ✅, build ✅ (aviso esperable de
  chunk 511 kB: zod+RHF+Dexie+router juntos; code-splitting queda para después),
  dev server 5174 responde.

## 2026-10-28 (sesión 2) — Plan definitivo + FASE 0 cerrada
- El propietario aportó el plan completo de fases (FASE 0–12) y las condiciones
  (§11 presupuesto $0, §12 continuidad, §13 entregables, §14 reglas de ejecución).
- FASE 0 cerrada con todos los entregables del informe de planificación:
  - Inventario de recursos reutilizables (tabla en `docs/architecture.md` §4).
  - Matriz de dependencias y complejidad relativa (`docs/roadmap.md`).
  - Mapa de navegación y pantallas por módulo (§3 de architecture.md).
  - Modelo de datos completo (`docs/data-model.md`: 16 entidades + esquema Dexie v1).
  - Seguridad/privacidad (`docs/security-privacy.md`: OWASP, reglas de datos
    íntimos, límites honestos del almacenamiento local).
  - Estrategia de pruebas (`docs/testing.md`) y despliegue (`docs/deployment.md`).
  - Riesgos con mitigaciones (tabla en `docs/roadmap.md`).
- Documentación reorganizada a los nombres §12 (D10 en `ai/decisions.md`);
  borradores anteriores retirados.
- `ai/next-steps.md` creado con los incrementos concretos de la FASE 2.

## 2026-10-28 — FASE 0 (auditoría y base)
- **Auditoría de entorno:** Node v26.7.0, npm 11.19.0. Sin Java ni Android SDK
  (se instalan en la fase APK con autorización). Versions de paquetes verificadas
  en el registro npm (ver `ai/decisions.md` D2).
- **Proyecto independiente creado** en `C:\Users\Everth\ProyectosIA\TotalhiitApp`
  (git init, rama main, `.gitignore` con exclusión de secretos y artefactos).
- **Stack instalado y verificado:** React 19 + TypeScript 7 (¡tsc -b sin problemas!) +
  Vite 8 + Tailwind 4.3 + react-router 8 + Dexie + pdf-lib + zod/react-hook-form +
  vitest + vite-plugin-pwa. Primer `tsc -b`, `vite build` y `vitest` en verde
  (8/8 pruebas IMC). PWA generada (manifest + sw.js, precache 14 archivos).
- **Design system inicial:** tokens de marca en `src/index.css` (paleta magenta
  del sitio, fuente Edo), navegación inferior móvil con safe-areas iOS,
  páginas placeholder por módulo (A–L).
- **Primera fórmula con pruebas:** `src/lib/salud/imc.ts` (C1) con clasificación
  orientativa OMS, validaciones de rango y suite de Vitest.
- **Recursos legales copiados del sitio:** logo, fuente Edo + licencia;
  íconos PWA 192/512 generados desde el logo.
- `docs/arquitectura-app.md` y `docs/plan-fases.md` (borrador a ajustar con el
  plan definitivo del propietario).
