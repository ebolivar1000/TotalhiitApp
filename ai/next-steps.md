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

## Próximo paso concreto
FASE 7 en incrementos con pruebas (criterios exactos en `docs/roadmap.md`),
incluye el registro de peso diferido de FASE 3:
1. Modelo `EntradaDiario` (peso, energía, ánimo, sueño) + DB v4
   (`entradasDiario`, índice `[userId+fecha]`); exportar/borrar actualizados.
2. Repositorio con upsert por día (una entrada por usuario y fecha) + pruebas
   con fake-indexeddb.
3. Servicios de cálculo (`src/lib/progreso/`): racha de días registrados,
   promedios móviles 7 días, tendencia de peso (Δ vs mes anterior) con fórmula
   documentada (D13).
4. Página `/progreso`: dashboard A (rachas + energía), formularios rápidos de
   registro diario, gráficos de tendencia SVG sin librerías externas.
5. Pruebas de servicios y repositorio; verificar `npm test` + build + recorrida
   en `npm run dev` (puerto 5174).
6. Menor: si el aviso de chunk (~570 kB) molesta, ajustar code-splitting.

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
