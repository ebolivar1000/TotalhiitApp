# Decisiones técnicas — TOTALHIIT App

> Registro de decisiones con justificación breve. Las nuevas se agregan al final.

## D1 (2026-10-28) — Proyecto independiente con base de código única
Creación de `TotalhiitApp` separado del sitio (MiPrimeraApp), sin compartir
dependencias ni versiones. Un solo código React genera APK (Capacitor) y PWA (iOS/web).
Justificación: master prompt §3; evita duplicar lógica y mantenimiento.

## D2 — Versiones del stack (auditadas 28/10/2026 en el registro npm)
React 19.3.1 · TypeScript 7.0.2 · Vite 8.3.5 · @vitejs/plugin-react 6.1.2 ·
Tailwind 4.3.3 (+@tailwindcss/vite) · react-router 8.5.1 · Capacitor 8.5.3 (fase APK) ·
pdf-lib 1.17.1 · Dexie 4.4.7 · zod 4.6.7 · react-hook-form 7.91 + resolvers 6 ·
vitest 5.0.5 · vite-plugin-pwa 2.0.
Riesgo aceptado: TypeScript 7 es la nueva generación del compilador; si aparecen
incompatibilidades de tipos con librerías, se baja a TS 5.9 documentándolo.
Justificación: master prompt exige versiones estables actuales y compatibilidad verificada.

## D3 — Almacenamiento local-first con Dexie (IndexedDB)
El MVP no requiere backend; IndexedDB sirve datos estructurados offline en
Android WebView y Safari/iOS. Los repositorios quedan detrás de una interfaz
(`src/lib/datos/`) para migrar a Cloudflare Workers+D1 o Supabase sin reescribir UI.
Advertencia documentada: IndexedDB no cifra por sí solo; los datos del ciclo
menstrual recibirán capa de cifrado y consentimiento explícito en su fase.

## D4 — Estado de UI con React Context (sin librería de estado global)
Hasta que el estado global lo justifique, se evitan dependencias innecesarias.

## D5 — PWA con vite-plugin-pwa (manifest + precache + autoUpdate)
Si el plugin presentara conflicto de peers con Vite 8, se documenta y se migra a
service worker manual (patrón ya probado en InventarioSalón).

## D6 — PDF con pdf-lib
MIT, JS puro (funciona igual en WebView Android y Safari), permite A4, imágenes,
tablas y marca de agua diagonal en todas las páginas. Alternativas descartadas:
jsPDF (API menos cómoda para layout de tabla) y solución backend (dependencia de servidor en MVP).

## D7 — Recursos del sitio reutilizables bajo autorización del propietario
Logo (`logo_valen.jpeg`, respaldo `logo.png`), fuente Edo (uso comercial libre,
`public/fonts/README.txt`), paleta magenta, IDs de YouTube propios, textos del
bootcamp y material nutricional. NO se reutilizan auth/admin/pagos sin revisión de seguridad.

## D8 — Herramientas Android diferidas a la fase APK
JDK 21 + Android SDK no existen en esta PC; se instalan (con autorización) cuando
se llegue a la fase del APK. La PWA no depende de eso.

## D9 — Vulnerabilidades bajas de la cadena de build de vite-plugin-pwa
`npm audit` marca 4 vulnerabilidades LOW, todas en dependencias de BUILD
(`deepmerge` → `@rollup/plugin-node-resolve` → `workbox-build` → `vite-plugin-pwa`).
No afectan al código de la app en runtime (solo al proceso de generar el service
worker). `npm audit fix --force` degradaría vite-plugin-pwa a 0.2.1 (rompe la API):
se descarta. Se vigila la actualización de la cadena y se repite el audit en cada
fase (requisito de dependencias actualizadas del master prompt §8).

## D10 (2026-10-28) — Nombres de documentación según master prompt §12
Se adoptan exactamente: `docs/architecture.md`, `docs/roadmap.md`,
`docs/data-model.md`, `docs/security-privacy.md`, `docs/deployment.md`,
`docs/testing.md`, `ai/state.md`, `ai/decisions.md`, `ai/next-steps.md` (contenido
en español). Se retiraron los borradores `docs/arquitectura-app.md` y
`docs/plan-fases.md`. Cada sesión termina actualizando estos archivos.

## D11 (2026-10-28) — Roadmap definitivo recibido del propietario
El plan FASES 0–12 quedó registrado en `docs/roadmap.md` con criterios de
aceptación, matriz de dependencias, complejidad relativa y riesgos. Nota: la FASE 1
(fundación) ya había sido ejecutada con aprobación explícita del propietario
(carpeta + `npm install` autorizados), por lo que el flujo sigue en FASE 2.

## D12 (2026-10-28) — Convenciones de la capa de datos (aprendidas con pruebas)
- IndexedDB **no admite booleans como clave de índice**: el campo `activo` de
  objetivos se persiste como `1/0` (zod `union(literal 1, literal 0)`); las
  consultas compuestas usan `[userId+activo]` = `[userId, 1]`.
- `perfiles` lleva índice `createdAt` porque `perfilPrincipal()` ordena por él.
- Un único esquema zod de formulario (`formulario-esquema.ts`) alimenta onboarding
  y edición con react-hook-form (mismas secciones `<SeccionDatos|Objetivo|Preferencias>`);
  el resolutor se castea a `Resolver<FormPerfil>` para evitar fricción de tipos
  input/output de zod v4.
- `active` del onboarding saltado: bandera `localStorage` (`totalhiit.onboarding.saltado`).
