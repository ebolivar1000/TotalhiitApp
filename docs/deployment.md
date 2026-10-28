# Despliegue — App TOTALHIIT

> Estado actual: **NADA desplegado** (correcto para FASE 0–1; master prompt §14
> prohíbe publicar producción sin aprobación). Este doc se completa en FASE 11.

## 1. Desarrollo local

```bash
npm run dev        # http://127.0.0.1:5174  (strictPort; no usar 5173, es del sitio)
npm run build      # tsc -b && vite build -> dist/
npm run preview    # probar dist/ en local (necesario para validar el service worker)
```

## 2. PWA (iOS / web) — FASE 11
Requisito: HTTPS (obligatorio para service worker y cámara/geolocalización si se usaran).
Opciones gratuitas a comparar y verificar TOS/límites en FASE 11 (no asumir uso comercial ilimitado):
- Cloudflare Pages (proyecto independiente del sitio; el sitio `totalhiit` NO se toca).
- Alternativas: GitHub Pages (sin headers custom → SW limitado), Netlify free, Vercel hobby.
Decisión documentada en `ai/decisions.md` al momento.

## 3. APK Android — FASE 11
Requisitos en esta PC (hoy ausentes): **JDK 21 + Android SDK** (command-line tools,
gratuitos, ~2–3 GB). Instalación documentada paso a paso cuando se llegue a la fase,
con autorización del propietario (no instalación masiva sin necesidad).

Pasos previstos (resumen):
1. `npm i -D @capacitor/cli @capacitor/core @capacitor/android` (autorizar antes).
2. `npx cap init com.totalhiit.app TOTALHIIT --web-dir dist` (identificador propio).
3. `npx cap add android` → se commitea `android/` (sin artefactos de build).
4. `npm run build && npx cap sync android`.
5. Build debug APK para pruebas (`gradlew assembleDebug`).
6. Keystore del propietario (creado una vez; **NUNCA en el repo**; respaldo en
   OneDrive del propietario) → `gradlew bundleRelease`/`assembleRelease` firmado.
7. Versionado: `versionCode` incremental + `versionName` semántico; actualizaciones
   instalando el APK firmado con la misma firma.

## 4. Actualizaciones
- PWA: autoUpdate (service worker). APK: nueva versión firmada con la MISMA keystore
  (Android exige misma firma para actualizar; cambiarla = desinstalar y perder datos).
- Registro de cambios por release en `docs/progreso.md`.

## 5. Vínculo desde la web existente
- La web (`MiPrimeraApp`) NO se modifica en este proyecto. En FASE 11 se prepara el
  texto/enlace ("Descargar la app") para que el propietario lo agregue cuando quiera.

## 6. Prohibido en este proyecto (master prompt §14)
Publicar APK sin aprobación · tocar el sitio · modificar Cloudflare del sitio ·
crear servicios pagos · instalar herramientas masivas sin necesidad.
