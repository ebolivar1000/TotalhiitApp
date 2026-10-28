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
- FASE 6 (PDF de recetas): **pendiente de inicio**.

## Próximo paso concreto
FASE 6 en incrementos con pruebas (criterios exactos en `docs/roadmap.md`):
1. Servicio PDF con pdf-lib (`src/lib/nutricion/pdf.ts`): A4, logo, nombre,
   ingredientes escalados, pasos, tabla nutricional y nota de valores
   aproximados.
2. **Marca de agua TOTALHIIT semitransparente en TODAS las páginas** (texto
   diagonal, reutilizable para el plan semanal de FASE 9).
3. Pruebas automatizadas de generación (bytes del PDF + texto incrustado).
4. Botón "Descargar PDF" en el detalle de receta; verificar guardado/compartir
   en Android (WebView) y Safari/iOS en dispositivos reales (documentar).
5. Verificación: `npm test`, `npm run build`, recorrer en `npm run dev`.
6. Menor pendiente: code-splitting del bundle (~567 kB) si el aviso molesta.

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
