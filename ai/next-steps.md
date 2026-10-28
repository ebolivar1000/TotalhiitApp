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

## Próximo paso concreto
FASE 8 — ciclo menstrual, privacidad estricta (criterios exactos en
`docs/roadmap.md`; revisar además `docs/security-privacy.md` y D18):
1. Esquema `CicloRegistro` (fecha, flujo, síntomas opcionales, notas) + DB v5
   con store `ciclo`; **cifrado local de los campos íntimos** (WebCrypto AES-GCM
   con clave derivada en el dispositivo — decidir derivación y guardarla solo
   local) antes de escribir en IndexedDB.
2. Consentimiento explícito `menstrual` ANTES de la primera pantalla del módulo
   (pantalla de consentimiento propio; sin consentimiento → no se ve nada).
3. Página `/ciclo`: calendario mensual, registro/edición/borrado, historial y
   estimaciones con **incertidumbre visible** (rangos, no fechas exactas);
   manejo de ciclos irregulares y datos insuficientes.
4. Exportación/borrado incluyen `ciclo`; NADA del módulo aparece en la
   exportación genérica sin los datos descifrados ni en logs.
5. Pruebas de privacidad: campos cifrados en la DB, ausencia en export genérica
   (o exportación con cifrado intacto), borrado completo.
6. Verificación: `npm test` + build + recorrida en `npm run dev` (puerto 5174).

## Recordatorios para la próxima sesión
- Leer `ai/state.md`, `ai/decisions.md` y `docs/roadmap.md` antes de codificar.
- No instalar dependencias nuevas sin autorización (ver D2/D9).
- Nada del sitio web se toca; puerto dev de la app: 5174.
- `activo` se persiste como 1/0 (no boolean: índices IndexedDB) — ver D12.
- Fórmulas de salud centralizadas en `src/lib/salud/` con fórmula documentada
  en el comentario del módulo — ver D13.
- Al terminar la sesión: actualizar `docs/progreso.md`, `ai/state.md`, `ai/next-steps.md`.
