# Roadmap — App TOTALHIIT

> Fases según master prompt (FASE 0–12). Cada fase tiene criterios de aceptación
> verificables. Regla: **app funcional antes que pantallas incompletas**; fases se
> pueden trozar en hitos menores.
> Complejidad relativa: S < M < L < XL.

## Matriz de dependencias entre fases

| Fase | Depende de | Nota |
|---|---|---|
| 1 Fundación | — | ✅ hecha |
| 2 Perfil/onboarding | 1 | base de datos local + consentimientos |
| 3 Calculadoras | 2 | usan datos del perfil |
| 4 Entrenamientos | 2 (histórico de sesiones) | catálogo puede avanzar en paralelo con 3 |
| 5 Nutrición/recetas | 2, 3 | motor usa perfil+objetivos y límites energéticos |
| 6 PDF recetas | 5 | |
| 7 Progreso y sueño | 4 (sesiones), 2 (peso inicial) | dashboard (A) se completa aquí |
| 8 Menstrual | 2 (consentimientos) | independiente de 4–7 salvo dashboard |
| 9 Menús semanales | 5, 6 | lista de compras + PDF de plan |
| 10 Backend/premium | todas las funcionales | decisión de backend + seguridad previa |
| 11 Distribución | 2–9 | APK + PWA en producción |
| 12 Evolución | 10, 11 | IA opcional, admin, i18n |

## Estado y criterios de aceptación

### FASE 0 — Auditoría y planificación ✅ (2026-10-28)
- [x] Entorno verificado; recursos del sitio inventariados (modo lectura)
- [x] Arquitectura, estructura de carpetas y modelo de datos diseñados
- [x] Matriz de dependencias, complejidad, riesgos y roadmap con criterios

### FASE 1 — Fundación ✅ (2026-10-28) — complejidad M
- [x] Proyecto independiente creado (repo propio, git, sin tocar el sitio)
- [x] React 19 + TS 7 + Vite 8 + Tailwind 4.3 + PWA configurados y compilando
- [x] Navegación base (6 rutas + barra inferior mobile-first con safe-areas)
- [x] Design system inicial (tokens de marca, fuente Edo, componentes base)
- [x] Pruebas configuradas y en verde (8/8 IMC)
- [x] Documentación de continuidad §12 completa

### FASE 2 — Onboarding y perfil — complejidad L  ← **próxima**
Criterios de aceptación:
1. Onboarding en pasos skippables guarda un `UserProfile` válido (zod) en Dexie.
2. Los 7 objetivos configurables cambian sin perder historial (`UserGoal` con vigencia).
3. Preferencias nutricionales (alergias, exclusiones, tiempo, presupuesto, región) editables.
4. Consentimientos registrados (módulo, versión, fecha) y revocables desde Ajustes.
5. Edición y **borrado** de datos desde Ajustes (borrado = eliminar stores del usuario).
6. Solo mayores de 18 (validación de edad con minimización de datos).

### FASE 3 — Calculadoras — complejidad M
1. [x] IMC (ya probado) + TMB Mifflin-St Jeor + TDEE + orientación de macros, con
   variables fisiológicas pedidas por separado del género.
2. [x] Estimaciones ajustables por objetivo; sin déficits extremos automáticos.
3. [x] Pruebas matemáticas unitarias (casos límite) en verde.
4. [ ] Registro opcional de evolución (peso) conectado a Progreso → se implementa
   junto con el dashboard de Progreso (FASE 7); la FASE 3 deja la fórmula lista.
5. [x] Advertencias de incertidumbre visibles en cada resultado.

### FASE 4 — Entrenamientos — complejidad L ✅ (2026-10-28)
1. [x] Catálogo con 10 categorías (derivadas del contenido real del canal) + filtros por objetivo/nivel/duración/equipo.
2. [x] Reproductor (YouTube en modo nocookie) con estados de carga/error/offline y reintento.
3. [x] Completados, favoritos e historial de sesiones en Dexie (DB v2).
4. [x] Contenido con videos/textos propios del proyecto (canal del propietario); nada propietario de terceros.
1. Catálogo con las 10 categorías del §5.F; filtros por objetivo/nivel/duración/equipo.
2. Reproductor (YouTube propio + origen configurable) con estados de carga/error/offline.
3. Completados, favoritos e historial de sesiones en Dexie.
4. Contenido con videos/textos propios del proyecto; nada propietario de terceros.

### FASE 5 — Nutrición y recetas — complejidad XL ✅ (2026-10-28)
1. [x] Catálogo estructurado original (6 categorías) con los campos del §5.D:
   macros por porción, alérgenos, objetivos compatibles, sustituciones,
   conservación (ingredientes embebidos; la normalización FoodIngredient/RecipeIngredient
   queda diferida a la FASE 9, que la necesita para la lista de compras).
2. [x] Motor de reglas determinista: **nunca sugiere alérgenos declarados (prueba obligatoria en verde)**.
3. [x] Filtro por ingrediente ("¿qué tenés en casa?"), exclusión de alimentos,
   ajuste de porciones con recálculo de cantidades y macros.
4. [x] Favoritos (⭐, reutiliza favoritos genéricos) y "preparadas" (RecipePreparation, DB v3).
   [ ] Plan semanal básico + lista de compras → FASE 9 (pantalla dedicada).
5. [x] Fuentes documentadas: valores aproximados elaborados con tablas de
   dominio público (USDA FoodData Central), atribución visible en UI y código.
1. Catálogo estructurado original (6 categorías) con todos los campos del §5.D.
2. Motor de reglas determinista: nunca sugiere alérgenos declarados (prueba obligatoria).
3. Filtro por ingredientes, exclusión de alimentos, ajuste de porciones con recálculo.
4. Favoritos, preparadas, plan semanal básico y lista de compras consolidada.
5. Fuentes de datos nutricionales con licencia adecuada (atribución documentada).

### FASE 6 — PDF — complejidad M ✅ (2026-10-28)
1. [x] PDF A4 de receta individual con logo, tabla nutricional (por porción y
   totales), fecha, nota de valores aproximados y **marca de agua TOTALHIIT
   semitransparente en TODAS las páginas** (+ pie con numeración).
2. [x] Descarga con Blob/a[download] (funciona igual en Android WebView y
   Safari/iOS). *Prueba en dispositivos reales: diferida a FASE 11
   (distribución), que incluye el APK.*
3. [x] Servicio reutilizable (`estamparMarcaAgua` + helpers de layout) listo
   para el plan semanal de FASE 9.
4. [x] Pruebas automatizadas de generación (PDF válido, A4, multi-página,
   marca de agua por página, wrapText, nombre de archivo). Verificación visual
   manual pendiente de dispositivo (documentada en `docs/testing.md`), no
   bloquea el flujo.
1. PDF A4 de receta individual con logo, tabla nutricional, fecha, nota de valores
   aproximados y **marca de agua TOTALHIIT semitransparente en todas las páginas**.
2. Guardar/compartir OK en Android y Safari/iOS (probado en dispositivos reales).
3. PDF de plan semanal (FASE 9) reutiliza el mismo servicio.
4. Pruebas automatizadas de generación + verificación visual manual documentada.

### FASE 7 — Progreso y sueño — complejidad M ✅ (2026-10-28)
1. [x] Registros voluntarios: registro diario único por día (upsert) con peso,
   energía 1–5, ánimo 1–5, horas y calidad de sueño, vasos de agua y notas;
   entrenamientos y recetas ya se registraban (FASES 4–5). El peso puede
   actualizar el perfil (checkbox) para que las calculadoras queden al día.
2. [x] Gráficos de tendencia (línea SVG de peso 30 días, barras de sueño y
   energía de 7 días) + calendario de actividad del mes (entreno/registro/hoy)
   + resúmenes de las últimas 4 semanas.
3. [x] Dashboard A personalizado con sugerencias del motor (deterministas,
   sin IA): entrenamiento vs semana pasada, hidratación vs meta (35 ml/kg),
   sueño <7 h, invitación a pesarse si pasaron 14 días y receta alineada al
   objetivo (alérgenos y presupuesto aplicados).
4. [x] Sin puntuaciones culpabilizantes ni afirmaciones médicas (tono positivo,
   racha con "descanso hoy no rompe la racha", avisos de que no es diagnóstico).

### FASE 8 — Seguimiento menstrual — complejidad L ✅ (2026-10-28)
1. [x] Consentimiento explícito ANTES de ver cualquier pantalla del módulo
   (puerta con explicación de cifrado/borrado; activar, "No, gracias",
   desactivar+borrar desde el propio módulo; también con borrado total).
2. [x] Calendario mensual (sangrado, manchado, ventana estimada, hoy),
   registro/edición/borrado por día (upsert cifrado), historial de ciclos,
   síntomas opcionales (lista + libres) y notas.
3. [x] Estimaciones con **incertidumbre visible**: ventana (rango) con centro
   estimado, duración mín/máx, ciclos irregulares marcados con motivo
   (fuera del rango típico 21–35 o variación alta) y mensajes honestos con
   datos insuficientes (0 o 1 ciclo). Aviso: no sirve para prevenir/planificar
   embarazos ni reemplaza consulta médica.
4. [x] **Cifrado local AES-GCM-256** (WebCrypto) de flujo/síntomas/notas ANTES
   de escribir en IndexedDB; en claro solo metadatos. Clave aleatoria generada
   en el dispositivo, guardada SOLO en localStorage, jamás exportada.
   Exportación (v5) incluye registros con cifrado intacto; borrado definitivo
   limpia el store (y la clave se borra con el borrado total vía localStorage).
5. [x] Pruebas de privacidad: la fila cruda y la exportación serializada NO
   contienen el contenido en claro (verificaciones de texto); el descifrado
   ocurre solo en memoria y los registros corruptos se omiten sin exponer
   nada; la app no tiene telemetría ni logs.

### FASE 9 — Menús semanales — complejidad M ✅ (2026-10-28)
1. [x] Planificador semanal desde el motor (usa catálogo + preferencias y
   objetivo del perfil; **sin IA**): 7 días × desayuno/almuerzo/cena/snack con
   `filtrarRecetas` + `ordenarPorObjetivo`; generación determinista y rotación;
   cada slot reemplazable desde el catálogo con los mismos filtros.
2. [x] Lista de compras consolidada por semana: suma de ingredientes de las
   recetas del plan escaladas a las porciones del plan (agrupadas por
   nombre+unidad, "a gusto" aparte) en `/plan` (toggle).
3. [x] Exportación PDF del plan (marca de agua + pie incluidos, reutiliza
   `estamparMarcaAgua` y el marco de `pdf.ts`): portada del plan, por día las
   4 comidas con tiempo de cocción y por día su lista de compras con las
   cantidades; nombre `totalhiit-plan-AAAA-MM-DD.pdf`.
4. [x] Modelo `PlanSemanal` (semana arranca en lunes, upsert por
   `[userId+semanaInicio]`, historial conservado) + DB v6 (`planes`);
   exportación v6 y borrado definitivo incluyen el store.
5. [x] Pruebas: plan determinista + cobertura de categorías por slot, filtro
   por alérgenos/exclusiones, reemplazo de slot, upsert por semana, consolidado
   de compras (sumas/escalado/a gusto/unidades distintas), exportación v6 y
   PDF del plan válido. 147/147.

### FASE 10 — Identidad, sync y premium — complejidad XL ✅ (2026-10-28)
1. [x] Comparación documentada Cloudflare Workers+D1(+R2) vs Supabase (`docs/comparacion-backend.md`):
   límites gratis oficiales, sin pausas por inactividad en D1 vs 7 días en Supabase, $0 egress en R2,
   decisión con el propietario (la cuenta de Cloudflare ya existe).
2. [x] Autenticación segura + roles (`invitado`, `usuario`, `premium`, `admin`) en `src/lib/auth/auth.ts`;
   validación de permisos SIEMPRE en el servidor (`validarPermisoServidor` en `src/lib/premium/entitlements.ts`);
   cero código inseguro heredado del sitio (D7/D23).
3. [x] Entitlements premium con regla inviolable: el módulo menstrual básico, las calculadoras y la
   exportación/borrado de datos quedan SIEMPRE gratis para todos los usuarios.
4. [x] Evaluación de amenazas para datos íntimos sincronizados (`docs/threat-model-sync.md`) con
   criptografía Zero-Knowledge con PIN (`src/lib/seguridad/pin-crypto.ts`, PBKDF2 100k + AES-GCM-256);
   el ciclo menstrual permanece solo local por defecto.
5. [x] Motor de sincronización local-first (`src/lib/sync/sync-engine.ts`) con resolución Last-Write-Wins (LWW),
   lápidas para borrado y exportación JSON como red de seguridad permanente.
6. [x] Sin pasarela de pagos hasta decisión del propietario (preparación de entitlements lista).

### FASE 11 — Distribución — complejidad L ✅ (2026-10-28)
1. [x] APK configurado con Capacitor 8 (`com.totalhiit.app`), permissions mínimos, scripts de build
   reproducible en `android/app/build.gradle`, script de generación de keystore `scripts/generar-keystore.ps1`,
   y workflow automatizado CI en `.github/workflows/build-apk.yml`.
2. [x] PWA configurada para Cloudflare Pages con HTTPS verificado: `public/_redirects` y `public/_headers`
   con autoUpdate (`/sw.js` no-cache) y assets inmutables; instalable en iPhone/Safari.
3. [x] Estrategia de actualizaciones documentada en `docs/deployment.md`: PWA autoUpdate inmediato;
   APK sideload con misma firma de keystore y `versionCode` incremental.
4. [x] Instrucciones de instalación fuera de Google Play (`docs/guia-instalacion-apk.md` con explicación
   de Play Protect para mujeres +40) y bloque HTML/Tailwind preparado para el sitio web
   (`docs/enlace-descarga-web.md`, sin modificar la web existente).
5. [x] Resiliencia offline verificada: `MonitorConexion` desacoplado + hook `useConexion`
   (`useSyncExternalStore`), banner superior accesible `AvisoConexion` y 180 pruebas Vitest en verde.

### FASE 12 — Evolución — complejidad XL (post-MVP)  ← **próxima**
IA opcional (con validación y sin claves en cliente), panel admin, contenido
premium ampliado, nuevas métricas, accesibilidad e internacionalización (es → en).

## Riesgos principales (matriz FASE 0)

| Riesgo | Fase | Mitigación |
|---|---|---|
| Datos íntimos expuestos (IndexedDB sin cifrar) | 8 | Cifrado AES-GCM + consentimiento + borrado fácil |
| Safari/iOS desaloja almacenamiento de PWAs poco usadas | 8/11 | Exportación fácil + aviso; backup opcional futuro |
| Contenido de salud mal interpretado | 3/5/7/8 | Avisos obligatorios, sin diagnósticos, adulto 18+ |
| Motor sugiere alérgeno | 5 | Regla dura + pruebas automáticas obligatorias |
| TS 7 incompatible con alguna librería | 1+ | Fallback documentado a 5.9 (hoy no hizo falta) |
| Videos YouTube no listados no son "privados" | 4/10 | No prometer protección; premium vía entitlements de servidor |
| APK sideload asusta al usuario | 11 | Guía clara + firma estable para actualizaciones sin reinstalar |
| Servicios "gratis" con límites no comerciales | 10/11 | Verificar TOS antes de usar; alternativas documentadas |
