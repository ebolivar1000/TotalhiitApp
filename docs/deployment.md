# Despliegue y Distribución — App TOTALHIIT

> **FASE 11 — Distribución (PWA + APK Android)**  
> Última actualización: 2026-10-28.  
> Un solo código React/TypeScript distribuido como **PWA** (iOS / Web) y **APK** (Android con Capacitor).

---

## 1. Desarrollo Local

```bash
npm run dev        # Servidor de desarrollo en http://127.0.0.1:5174 (puerto estricto)
npm run build      # tsc -b && vite build -> genera carpeta dist/
npm run preview    # Probar dist/ en local (valida Service Worker y PWA)
npm test           # Ejecutar suite de pruebas Vitest (180 pruebas)
```

---

## 2. PWA (iOS / Web) — Despliegue en Cloudflare Pages

### Requisitos y Configuración
- **Hosting recomendado:** Cloudflare Pages (plan gratuito ilimitado, SSL automático, HTTP/3, proyecto independiente `totalhiit-pwa`; la cuenta `caribialabs@gmail.com` ya existe).
- **Enrutamiento SPA:** `public/_redirects` configurado (`/* /index.html 200`).
- **Headers de seguridad y caché:** `public/_headers` configurado:
  - Inmutable para `/assets/*` (1 año).
  - No-cache para `/sw.js` y `/manifest.webmanifest` (autoUpdate garantizado).
  - Políticas de seguridad: `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`.

### Comando de Despliegue (CLI Wrangler)
```bash
# Construir la app
npm run build

# Desplegar en Cloudflare Pages
npx wrangler pages deploy dist --project-name totalhiit-pwa
```

### Instalación en iPhone / iPad (Safari)
1. Abrir la URL HTTPS en Safari.
2. Tocar el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Seleccionar **"Añadir a pantalla de inicio"**.
4. La PWA se ejecuta en pantalla completa con ícono de alta resolución y safe-areas nativas.

---

## 3. APK Android — Capacitor 8

### Configuración del Proyecto Nativo
- **Identificador de paquete (ApplicationId):** `com.totalhiit.app`
- **Nombre de la app:** `TOTALHIIT`
- **Permisos mínimos:** `INTERNET`, `ACCESS_NETWORK_STATE` (sin cámara, sin ubicación, sin contactos).
- **Directorio nativo:** `android/` (commiteado en el repositorio, artefactos y claves excluidos por `.gitignore`).

### Scripts NPM
```bash
npm run cap:copy    # Compila web (dist/) y copia assets a android/
npm run cap:sync    # Compila web, copia assets y actualiza plugins de Gradle
npm run cap:open    # Abre el proyecto nativo en Android Studio
```

### Generación de Keystore de Producción (Firma)
Se incluye el script automatizado en PowerShell:
```powershell
.\scripts\generar-keystore.ps1
```
O ejecutando manualmente:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore totalhiit-release.keystore -alias totalhiit -keyalg RSA -keysize 2048 -validity 10000
```
> **REGLA CRÍTICA DE SEGURIDAD:**  
> La keystore `totalhiit-release.keystore` **NUNCA** debe commitearse al repositorio git (`.gitignore` la protege).  
> Debe resguardarse en un lugar seguro (OneDrive / gestor de contraseñas del propietario).  
> Si se cambia de keystore, los usuarios no podrán actualizar la app y perderán sus datos locales.

### Compilación Reproducible del APK

#### Opción A: Automatizada en la Nube (GitHub Actions)
Se configuró el workflow en `.github/workflows/build-apk.yml`.
Al hacer push a `main` o disparar manualmente en GitHub:
1. Instala Node.js y JDK 21 Temurin.
2. Ejecuta los 180 tests Vitest.
3. Compila los assets y sincroniza Capacitor.
4. Genera el APK y lo publica como artefacto descargable en la pestaña *Actions*.

#### Opción B: Compilación Local (con JDK 21 instalado)
```bash
npm run cap:copy
cd android
.\gradlew.bat assembleRelease
```
El APK se genera en: `android/app/build/outputs/apk/release/app-release.apk`.

---

## 4. Estrategia de Actualizaciones

| Canal | Método de Actualización | Experiencia de la Usuaria |
|---|---|---|
| **PWA (iOS/Web)** | Service Worker `autoUpdate` (Workbox) | Al abrir la app, descarga la nueva versión en segundo plano y se activa en la siguiente visita o recarga. |
| **APK (Android)** | Sideload con misma Keystore | La usuaria descarga el nuevo APK desde la web. Android detecta la misma firma y actualiza sin perder los datos de IndexedDB. |

**Versionado semántico:**
- `package.json`: `"version": "0.1.0"` (SemVer).
- `android/app/build.gradle`: `versionCode 1`, `versionName "1.0"`. Cada nueva versión de APK debe incrementar `versionCode` (+1).

---

## 5. Materiales de Distribución y Enlace Web

- **Guía de instalación fuera de Play Store:** Ver [`docs/guia-instalacion-apk.md`](file:///C:/Users/Everth/ProyectosIA/TotalhiitApp/docs/guia-instalacion-apk.md) (instrucciones paso a paso y explicación del aviso de Play Protect).
- **Snippet para el sitio web:** Ver [`docs/enlace-descarga-web.md`](file:///C:/Users/Everth/ProyectosIA/TotalhiitApp/docs/enlace-descarga-web.md) (bloque HTML/Tailwind preparado para copiar y pegar en `MiPrimeraApp` sin alterar su repositorio).

---

## 6. Prohibiciones Verificadas (Master Prompt §14)
- [x] No se publicó en producción ni en Google Play sin aprobación previa.
- [x] El repositorio y código del sitio web (`MiPrimeraApp`) no fueron modificados.
- [x] No se crearon suscripciones ni servicios pagos.
- [x] No se instalaron herramientas masivas ni paquetes innecesarios.
