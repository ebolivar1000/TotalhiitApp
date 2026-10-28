# Estado actual — TOTALHIIT App

> Memoria persistente del proyecto. Actualizar al cerrar cada tarea.

## Objetivo
App independiente TOTALHIIT (entrenamiento + nutrición + bienestar para mujeres +40)
con **dos distribuciones del mismo código**: APK Android (Capacitor) y PWA iOS/web.
El sitio web (MiPrimeraApp) queda intacto y no se le copian mecanismos de auth/pagos.

## Tecnologías
React 19 + TypeScript 7 (fallback 5.9) + Vite 8 + Tailwind CSS 4.3 +
react-router 8 + Dexie 4 (IndexedDB local-first) + pdf-lib + zod/react-hook-form +
vitest + vite-plugin-pwa. Capacitor 8 recién en la fase Android.

## Fase actual
- **FASE 0 ✅** (auditoría y planificación) — completa con todos los entregables §14.
- **FASE 1 ✅** (fundación) — completa.
- **FASE 2 ✅** (onboarding y perfil) — completa: capa de datos Dexie con pruebas,
  onboarding 5 pasos, /perfil y /perfil/editar, ajustes con exportar/borrar.
- **FASE 3 ✅** (calculadoras de salud) — completa: BMR/TDEE/agua/proteína con
  pruebas (56/56) y pantalla `/salud` con medidor de IMC.
- **FASE 4 ✅** (entrenamientos) — completa: catálogo real (15 sesiones del canal,
  10 categorías), filtros con regla dura de equipo, reproductor nocookie con
  offline/error, favoritos + historial (DB v2). 68/68 pruebas.
- **FASE 5 ✅** (nutrición y recetas) — completa: catálogo propio (12 recetas,
  6 categorías), motor determinista con regla dura de alérgenos (prueba
  obligatoria), escalado de porciones, favoritas y preparadas (DB v3).
  85/85 pruebas.
- **FASE 6 ✅** (PDF de recetas) — completa: PDF A4 con logo, tabla nutricional,
  marca de agua TOTALHIIT en todas las páginas; pdf-lib en chunk separado
  (import dinámico). 93/93 pruebas.
- **FASE 7 ✅** (progreso y sueño) — completa: registro diario con upsert (DB
  v4), métricas puras (racha, promedios, tendencia de peso, resúmenes
  semanales), sugerencias del motor sin IA, página `/progreso` con gráficos
  propios y calendario. 118/118 pruebas.
- **FASE 8 ✅** (ciclo menstrual, privacidad estricta) — completa: puerta de
  consentimiento, payload íntimo SIEMPRE cifrado (AES-GCM, clave solo en el
  dispositivo, DB v5), calendario + historial + estimación con incertidumbre
  visible, exportación cifrada y borrado definitivo. 133/133 pruebas.
- **FASE 9 ✅** (menús semanales) — completa: planificador determinista sin IA
  (7 días × 4 comidas con filtros del motor), upsert por semana (DB v6 store
  `planes`), lista de compras consolidada y PDF del plan con marca de agua;
  página `/plan` con regeneración, reemplazo por slot y compras. 147/147
  pruebas.
- **FASE 10 ✅** (identidad, sync y premium) — completa: comparativa documentada
  Cloudflare Workers+D1(+R2) vs Supabase (`docs/comparacion-backend.md`),
  evaluación de amenazas de datos íntimos (`docs/threat-model-sync.md`) con
  criptografía Zero-Knowledge con PIN (`src/lib/seguridad/pin-crypto.ts`,
  PBKDF2 100k + AES-GCM-256), entitlements con regla inviolable de gratuidad
  para ciclo básico, calculadoras y exportación (`src/lib/premium/entitlements.ts`),
  validación de permisos en backend, auth local-first (`src/lib/auth/auth.ts`),
  motor de sincronización LWW (`src/lib/sync/sync-engine.ts`) y UI en `/ajustes`.
  177/177 pruebas.
- **FASE 11 ✅** (distribución) — completa: Capacitor 8 (`com.totalhiit.app`)
  con plataforma `android/` configurada, scripts `cap:copy`/`cap:sync`, script
  `generar-keystore.ps1`, GitHub Actions CI workflow reproducible (`build-apk.yml`),
  PWA en Cloudflare Pages (`_redirects`, `_headers`), guía de instalación fuera
  de Google Play (`guia-instalacion-apk.md`), bloque para la web (`enlace-descarga-web.md`),
  monitor de conexión desacoplado (`MonitorConexion`) y banner `AvisoConexion`.
  180/180 pruebas.
- **FASE 12 (evolución post-MVP): próxima** — IA opcional, panel admin, nuevas
  métricas, accesibilidad e internacionalización.

## Plan de fases
Definitivo en `docs/roadmap.md` (FASES 0–12 con criterios de aceptación, matriz de
dependencias y riesgos). El propietario aportó el plan completo el 2026-10-28.

## Hecho hasta ahora (2026-10-28, sesión 3)
- Proyecto creado en `C:\Users\Everth\ProyectosIA\TotalhiitApp` con git (main).
- Configuración completa (Vite 8 + TS estricto + Tailwind 4 + PWA plugin) y
  `npm install` ejecutado.
- Esqueleto navegable: rutas placeholder + navegación inferior con safe-areas.
- Primera fórmula con pruebas: IMC (`src/lib/salud/imc.ts`).
- Recursos de marca copiados del sitio (logo, Edo, paleta).
- Documentación de continuidad completa (§12): `docs/architecture.md`,
  `docs/roadmap.md` (definitivo FASES 0–12), `docs/data-model.md`,
  `docs/security-privacy.md`, `docs/testing.md`, `docs/deployment.md`,
  `docs/progreso.md`, `ai/next-steps.md`.
- **FASE 2 completa:** entidades zod + Dexie v1 + repositorio con pruebas
  (33/33), onboarding 5 pasos saltado, /perfil, /perfil/editar, ajustes con
  exportación JSON y borrado total, guard de rutas.
- **FASE 3 completa:** fórmulas con pruebas + pantalla /salud premium.
- **FASE 4 completa:** catálogo de sesiones (`src/lib/entrenamiento/sesiones.ts`,
  15 clases reales del canal + intro + 2 de movilidad), motor `filtros.ts`
  (regla dura de equipo + filtros por categoría/duración/nivel/objetivo),
  DB v2 (sesiones + favoritos genéricos), reproductor `ReproductorVideo`
  (nocookie, offline/error), páginas lista + detalle, favoritos ⭐ y registro
  de sesiones completadas.
- **FASE 5 completa:** catálogo `src/lib/nutricion/recetas.ts` (12 recetas
  originales, 6 categorías, macros por porción, alérgenos, sustituciones),
  motor `motor.ts` (regla dura de alérgenos + exclusiones por texto +
  presupuesto escalera + escalado de porciones con recálculo), DB v3
  (preparaciones), pantallas lista + detalle con macros, porciones selector,
  "La preparé", favoritas y aviso de fuentes (USDA FDC).
- **FASE 6 completa:** `src/lib/nutricion/pdf.ts` (A4, logo opcional, meta,
  ingredientes escalados, pasos, tabla nutricional, notas de fuentes) +
  `estamparMarcaAgua` (todas las páginas, reutilizable FASE 9) + `wrapText`
  + sanitización WinAnsi + descarga Blob. Botón "Descargar PDF" en el detalle;
  pdf-lib en chunk separado vía import dinámico (main volvió a ~570 kB).
- **FASE 7 completa:** registro diario con upsert (DB v4, índice `[userId+fecha]`,
  exportación versión 4), métricas puras en `src/lib/progreso/metricas.ts`
  (racha que no se rompe por descansar hoy, promedios en ventana, tendencia de
  peso, resúmenes semanales), sugerencias deterministas en `recomendaciones.ts`
  (máx. 3, sin culpa), gráficos propios (`componentes/graficos.tsx`) y página
  `/progreso` completa (racha, métricas, formulario diario con checkbox para
  actualizar el peso del perfil, calendario de actividad, 4 semanas).
- **FASE 9 completa:** `planificador.ts` (7 días × desayuno/almuerzo/cena/snack,
  sin IA, filtros del motor), `compras.ts` (consolidado por nombre+unidad con
  escalado), `pdf.ts` refactorizado con `crearMarco` + `generarPdfPlan`, DB v6
  (`planes` con upsert por semana, exportación v6), página `/plan` (generar,
  regenerar, reemplazar slots, compras, PDF) y enlace desde Inicio.
- **FASE 8 completa:** cifrado WebCrypto AES-GCM (`src/lib/ciclo/cifrado.ts`,
  clave aleatoria solo en localStorage), registro de ciclo cifrado
  (`guardarRegistroCiclo`/`registrosCicloLegibles`, DB v5 store `ciclo`),
  estimaciones con ventana e irregularidad (`estimaciones.ts`), página `/ciclo`
  con puerta de consentimiento, registro diario cifrado, calendario, historial
  y control de desactivación con borrado; exportación v5 cifrada (sin clave).

- **FASE 10 completa:** comparativa backend (`docs/comparacion-backend.md`),
  threat model (`docs/threat-model-sync.md`), cifrado Zero-Knowledge derivado
  de PIN (`pin-crypto.ts`), entitlements y permisos de servidor (`entitlements.ts`),
  auth y sesión (`auth.ts`), motor de sync LWW (`sync-engine.ts`) y UI en `/ajustes`.

- **FASE 11 completa:** Capacitor 8 (`com.totalhiit.app`) con Android nativo,
  scripts de build y keystore (`generar-keystore.ps1`), CI `.github/workflows/build-apk.yml`,
  Cloudflare Pages configs (`_redirects`, `_headers`), guías de instalación y bloque web,
  monitor offline (`MonitorConexion`) y banner `AvisoConexion`.

## Pendientes inmediatos
- FASE 12: evolución post-MVP (IA opcional con proxy backend, panel admin, nuevas
  métricas de entrenamiento, internacionalización es → en).
- Pendiente menor: code-splitting adicional del main (~616 kB) si hace falta.
- Probar guardar/compartir el PDF (receta y plan) en Android y iPhone reales.

## Notas de entorno
- Git repo-local: Everth <ebolivar1000@gmail.com> (Cloudflare sigue siendo caribialabs@gmail.com).
- Commits: 117f261 (fundación + FASE 2), 1de2c88 (FASE 3), 29e6db9 (FASE 4),
  5798414 (FASE 5), e4a38a9 (FASE 6), be36a23 (chore gitignore), a9de6cd
  (FASE 7), f7a980d (FASE 8).

## Restricciones vigentes
- No modificar el sitio sin autorización.
- Sin dependencias pagas ni de suscripción; MVP sin IA de pago.
- Datos íntimos (menstrual): consentimiento explícito + local + cifrado en su fase.
- Antes de instalar nuevas dependencias: pedir autorización.
