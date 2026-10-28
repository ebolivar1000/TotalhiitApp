# Pruebas — App TOTALHIIT

## Ejecutar

```bash
npm test          # una pasada (vitest run)
npm run test:watch
```

## Estrategia por fase

| Qué | Cómo | Estado |
|---|---|---|
| Fórmulas de salud (IMC, TMB, TDEE, macros) | Vitest en Node, casos típicos + límites + inválidos | IMC ✅ (8 tests); resto en FASE 3 |
| Motor de recomendaciones por reglas | Vitest: regla dura de alérgenos (obligatoria), objetivo, exclusiones, porciones | FASE 5 |
| Calendario y estimación menstrual | Vitest: ciclos regulares/irregulares, datos insuficientes, límites de la estimación | FASE 8 |
| Privacidad | Vitest: nada íntimo en exportaciones/logs; borrado de stores; consentimientos | FASE 8 |
| PDF | Vitest: bytes generados, nº de páginas, marca de agua en cada página | FASE 6 |
| Entidades/validaciones zod | Vitest por esquema | FASE 2+ |
| Formularios/UI | Testing Library + jsdom (se agrega jsdom cuando haya pruebas de UI) | FASE 2+ |
| E2E | Playwright en FASE 11 (rutas críticas: onboarding → calculadoras → receta → PDF) | FASE 11 |
| Build y PWA | `vite build` + verificación de manifest/sw | FASE 1 ✅ |

## Pruebas que requieren dispositivo real (no automatizables aquí)

- Instalación PWA en iPhone real (Añadir a pantalla de inicio, standalone, safe areas, teclado).
- APK en Android real (instalación, permisos, PDF/compartir, notificaciones).
- Offline real (modo avión) y reconexión.
- Reproducción de videos en WebView Android vs Safari/iOS.

Estas pruebas se ejecutan en las FASES 4/6/8/11 con checklist manual documentado
en el correspondiente `docs/progreso.md`.

## Convenciones
- Archivos de test junto al código: `*.test.ts(x)` bajo `src/`.
- Fórmulas y motor son lógica pura → no necesitan DOM (environment `node`).
- Cada fix de bug se acompaña de un test que lo reproduce.
