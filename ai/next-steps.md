# Próximos pasos — TOTALHIIT App

> Archivo de continuidad (master prompt §12). Se actualiza al final de cada sesión.

## Última actualización: 2026-10-28

## Estado
- FASE 0 (auditoría y planificación): ✅ completa.
- FASE 1 (fundación): ✅ completa — build, pruebas y PWA en verde.
- FASE 2 (onboarding y perfil): ✅ completa — 33/33 pruebas, onboarding saltado,
  perfil editable, ajustes con exportar/borrar, guard de rutas.
- FASE 3 (calculadoras de salud): **pendiente de inicio**.

## Próximo paso concreto
FASE 3 en incrementos con pruebas (criterios en `docs/roadmap.md`):
1. `src/lib/salud/bmr.ts`: Mifflin-St Jeor con género/edad/peso/estatura + tests.
2. `src/lib/salud/tdee.ts`: TDEE desde BMR × factor de `nivelActividad` + tests.
3. Calculadora de IMC integrada en UI con datos del perfil (ya existe la lógica).
4. Agua y proteína diaria estimada (fórmulas simples documentadas) + tests.
5. Verificación: `npm test`, `npm run build` y recorrer en `npm run dev`.
6. Menor pendiente: code-splitting del bundle (511 kB) si el aviso molesta.

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
