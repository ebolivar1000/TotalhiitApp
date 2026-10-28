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

## Próximo paso concreto
FASE 10 — identidad, sync y premium (criterios exactos en `docs/roadmap.md`):
1. Comparación documentada Cloudflare Workers+D1(+R2) vs Supabase: límites del
   plan gratis verificados en la web oficial, auth, base relacional,
   almacenamiento, protección de videos, sync y costos. Decisión con el
   propietario (el sitio usa Workers; ya hay cuenta Cloudflare).
2. Autenticación segura + roles (usuario/admin separados); validación de
   permisos SIEMPRE en el servidor; nada de auth reutilizada del sitio sin
   revisión de seguridad (D7).
3. Entitlements premium verificados por el backend (nunca solo botones
   ocultos); el módulo menstrual básico y la exportación de datos quedan
   SIEMPRE gratis.
4. Evaluación de amenazas para datos íntimos sincronizados ANTES del
   lanzamiento (¿el ciclo sube al servidor? solo con cifrado extremo a extremo
   o cifrado de cliente con PIN; evaluar derivación de la clave con PIN — D19).
5. Estrategia de sync local-first → servidor (resolución de conflictos simple,
   export/import como red de seguridad).
6. Sin pasarela de pagos hasta decisión del propietario (solo preparación de
   entitlements).

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
