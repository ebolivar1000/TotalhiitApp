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
- FASE 4 (módulo D: nutrición y recetas): **pendiente de inicio**.

## Próximo paso concreto
FASE 4 en incrementos con pruebas (criterios exactos en `docs/roadmap.md`):
1. Banco de recetas propio en TypeScript (`src/lib/nutricion/recetas.ts`) con
   macros por porción y alérgenos declarados.
2. Motor de filtrado: alérgenos + exclusiones + tiempo de cocina + presupuesto
   desde `NutritionPreferences` + tests.
3. Pantalla `/nutricion`: lista filtrada + detalle de receta (ingredientes,
   pasos, macros) usando los datos del perfil.
4. Verificación: `npm test`, `npm run build`, recorrer en `npm run dev`.
5. Menor pendiente: code-splitting del bundle (~521 kB) si el aviso molesta.

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
