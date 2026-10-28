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
- **FASE 5 (nutrición y recetas): próxima** — ver criterios en `docs/roadmap.md`.

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

## Pendientes inmediatos
- FASE 5: nutrición y recetas (criterios en `docs/roadmap.md`; motor con prueba
  obligatoria "nunca sugiere alérgenos").
- Pendiente menor: code-splitting del bundle (~542 kB en build).
- Pendiente menor: registro de peso conectado a Progreso (FASE 7, nota en roadmap).

## Notas de entorno
- Git repo-local: Everth <ebolivar1000@gmail.com> (Cloudflare sigue siendo caribialabs@gmail.com).
- Commits iniciales: 117f261 (fundación + FASE 2).

## Restricciones vigentes
- No modificar el sitio sin autorización.
- Sin dependencias pagas ni de suscripción; MVP sin IA de pago.
- Datos íntimos (menstrual): consentimiento explícito + local + cifrado en su fase.
- Antes de instalar nuevas dependencias: pedir autorización.
