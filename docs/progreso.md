# Progreso — TOTALHIIT App

## 2026-10-28 (sesión 4) — FASE 3 cerrada (calculadoras de salud)
- **Commit inicial creado** (117f261) con identidad repo-local git
  (Everth / ebolivar1000@gmail.com; Cloudflare sigue con caribialabs@gmail.com).
  Se excluyeron del repo los artefactos `.tsbuildinfo.*`.
- **Librería de fórmulas con pruebas** (cada una con su suite Vitest):
  - `bmr.ts` — Mifflin-St Jeor (10·kg + 6,25·cm − 5·edad + 5/−161; sin género → −78).
  - `tdee.ts` — BMR × factor de actividad estándar (1,2/1,375/1,55/1,725/1,9).
  - `hidratacion.ts` — 35 ml/kg con 1 decimal.
  - `proteina.ts` — base 1,2 g/kg (+40); 1,6 en objetivos de carga muscular; 1,4 resistencia.
  - `imc.ts` — se agregó `rangoPesoSaludable` (IMC 18,5–24,9 → kg).
- **Pantalla `/salud` (nueva, diseño premium):** tarjeta hero con degradado de
  marca para el IMC (número grande, chip de categoría con color por tramo,
  medidor segmentado animado con marcador, rango de peso saludable), cards
  BMR/TDEE con referencia de kcal para bajar/subir, cards agua y proteína
  ajustadas al objetivo activo, entradas peso/estatura precargadas desde el
  perfil (editables solo para el cálculo), avisos y limitaciones honestas.
- Navegación: entrada "Salud" en Inicio + ruta `/salud`.
- **Verificación:** `tsc -b` ✅ · **vitest 56/56** ✅ (23 nuevas) · build ✅
  (chunk 521 kB — code-splitting sigue pendiente menor).

## 2026-10-28 (sesión 3) — FASE 2 cerrada (onboarding y perfil)
- **Capa de datos con pruebas:** `src/lib/datos/entidades.ts` (schemas zod de
  perfil, objetivo, preferencias, consentimientos), `db.ts` (Dexie v1: perfiles,
  objetivos, preferencias, consentimientos), `repositorio.ts` (guardar/obtener
  perfil, objetivo activo con vigencia histórica, preferencias por usuario,
  otorgar/revocar consentimientos, exportar JSON, borrado total transaccional).
- **Suite total: 33/33 en verde** (fechas 9 + entidades + repositorio + IMC 8).
- Correcciones que las pruebas obligaron a hacer (valor de tenerlas primero):
  IndexedDB no admite booleans como clave de índice → `activo` se persiste 1/0;
  `perfilPrincipal` requería índice `createdAt`; auto-import accidental en `ids.ts`.
- **UI completa de FASE 2:** `formulario-esquema.ts` (zod compartido para
  onboarding/edición), primitivas de diseño (`componentes/ui.tsx`), secciones de
  formulario reutilizables (`componentes/formulario/Secciones.tsx`), hook `usePerfil`.
- **Onboarding 5 pasos** (bienvenida → datos → objetivo → preferencias →
  consentimientos y resumen) con react-hook-form + zod; saltado con bandera en
  localStorage; registra consentimientos `perfil` y `salud_general` v1.
- **`/perfil` (vista) y `/perfil/editar`:** reutilizan las mismas secciones;
  cambiar objetivo cierra el anterior con fecha (historial intacto).
- **Guard en App:** sin perfil → redirige a `/onboarding`; con perfil en
  onboarding → vuelve a inicio.
- **Ajustes reales:** exportar JSON (descarga), borrado definitivo con doble
  confirmación, resumen de privacidad y versión.
- **Verificación:** `tsc -b` ✅, vitest 33/33 ✅, build ✅ (aviso esperable de
  chunk 511 kB: zod+RHF+Dexie+router juntos; code-splitting queda para después),
  dev server 5174 responde.

## 2026-10-28 (sesión 2) — Plan definitivo + FASE 0 cerrada
- El propietario aportó el plan completo de fases (FASE 0–12) y las condiciones
  (§11 presupuesto $0, §12 continuidad, §13 entregables, §14 reglas de ejecución).
- FASE 0 cerrada con todos los entregables del informe de planificación:
  - Inventario de recursos reutilizables (tabla en `docs/architecture.md` §4).
  - Matriz de dependencias y complejidad relativa (`docs/roadmap.md`).
  - Mapa de navegación y pantallas por módulo (§3 de architecture.md).
  - Modelo de datos completo (`docs/data-model.md`: 16 entidades + esquema Dexie v1).
  - Seguridad/privacidad (`docs/security-privacy.md`: OWASP, reglas de datos
    íntimos, límites honestos del almacenamiento local).
  - Estrategia de pruebas (`docs/testing.md`) y despliegue (`docs/deployment.md`).
  - Riesgos con mitigaciones (tabla en `docs/roadmap.md`).
- Documentación reorganizada a los nombres §12 (D10 en `ai/decisions.md`);
  borradores anteriores retirados.
- `ai/next-steps.md` creado con los incrementos concretos de la FASE 2.

## 2026-10-28 — FASE 0 (auditoría y base)
- **Auditoría de entorno:** Node v26.7.0, npm 11.19.0. Sin Java ni Android SDK
  (se instalan en la fase APK con autorización). Versions de paquetes verificadas
  en el registro npm (ver `ai/decisions.md` D2).
- **Proyecto independiente creado** en `C:\Users\Everth\ProyectosIA\TotalhiitApp`
  (git init, rama main, `.gitignore` con exclusión de secretos y artefactos).
- **Stack instalado y verificado:** React 19 + TypeScript 7 (¡tsc -b sin problemas!) +
  Vite 8 + Tailwind 4.3 + react-router 8 + Dexie + pdf-lib + zod/react-hook-form +
  vitest + vite-plugin-pwa. Primer `tsc -b`, `vite build` y `vitest` en verde
  (8/8 pruebas IMC). PWA generada (manifest + sw.js, precache 14 archivos).
- **Design system inicial:** tokens de marca en `src/index.css` (paleta magenta
  del sitio, fuente Edo), navegación inferior móvil con safe-areas iOS,
  páginas placeholder por módulo (A–L).
- **Primera fórmula con pruebas:** `src/lib/salud/imc.ts` (C1) con clasificación
  orientativa OMS, validaciones de rango y suite de Vitest.
- **Recursos legales copiados del sitio:** logo, fuente Edo + licencia;
  íconos PWA 192/512 generados desde el logo.
- `docs/arquitectura-app.md` y `docs/plan-fases.md` (borrador a ajustar con el
  plan definitivo del propietario).
