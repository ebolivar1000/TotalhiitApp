# Próximos pasos — TOTALHIIT App

> Archivo de continuidad (master prompt §12). Se actualiza al final de cada sesión.

## Última actualización: 2026-10-28

## Estado
- FASE 0 (auditoría y planificación): ✅ completa.
- FASE 1 (fundación): ✅ completa — build, pruebas y PWA en verde.
- FASE 2 (onboarding y perfil): ✅ completa — 33/33 pruebas, onboarding saltado,
  perfil editable, ajustes con exportar/borrar, guard de rutas.
- FASE 3 (calculadoras de salud): ✅ completa — BMR/TDEE/agua/proteína/IMC con
  pruebas (56/56) y pantalla `/salud` premium (medidor de IMC animado).
- FASE 4 (entrenamientos): ✅ completa — catálogo real del canal, filtros con
  regla dura de equipo, reproductor nocookie offline/error, favoritos e
  historial (DB v2). 68/68 pruebas.
- FASE 5 (nutrición y recetas): ✅ completa — 12 recetas propias, motor con
  regla dura de alérgenos (prueba obligatoria), escalado de porciones,
  favoritas + preparadas (DB v3). 85/85 pruebas.
- FASE 6 (PDF de recetas): ✅ completa — PDF A4 con logo, tabla nutricional y
  marca de agua TOTALHIIT en todas las páginas; pdf-lib en chunk separado
  (import dinámico, main volvió a ~570 kB). 93/93 pruebas.
- FASE 7 (progreso y sueño): ✅ completa — registro diario con upsert (DB v4),
  métricas puras con pruebas, sugerencias deterministas sin IA, página
  `/progreso` con gráficos SVG propios y calendario. 118/118 pruebas.
- FASE 8 (ciclo menstrual): ✅ completa — consentimiento estricto, cifrado
  AES-GCM de los campos íntimos (DB v5), calendario, estimación con
  incertidumbre, exportación cifrada y borrado. 133/133 pruebas.
- FASE 9 (menús semanales): ✅ completa — planificador determinista sin IA,
  upsert por semana (DB v6), lista de compras consolidada, PDF del plan con
  marca de agua, página `/plan` con reemplazo por slot. 147/147 pruebas.
- FASE 10 (identidad, sync y premium): ✅ completa — comparativa Cloudflare vs
  Supabase, modelo de amenazas con cifrado Zero-Knowledge con PIN (PBKDF2 100k
  + AES-GCM), roles y entitlements con reglas inviolables de gratuidad y
  validación en servidor, motor de sincronización LWW. 177/177 pruebas.

## Próximo paso concreto
FASE 11 — Distribución (criterios exactos en `docs/roadmap.md`):
1. APK firmado con Capacitor (keystore del propietario), versionado semántico,
   build reproducible, probado en Android.
2. PWA desplegada en Cloudflare Pages con HTTPS verificado e instalable en iPhone.
3. Estrategia de actualizaciones (PWA autoUpdate vía service worker; APK versionado).
4. Preparar instrucciones de instalación y enlace de descarga desde la web
   (sin tocar el sitio hasta autorización explícita).
5. Pruebas finales offline y de accesibilidad.

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- Instalar dependencias de Capacitor (`@capacitor/cli`, `@capacitor/core`, `@capacitor/android`)
  con autorización del propietario al iniciar la FASE 11.
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
