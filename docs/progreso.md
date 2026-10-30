# Progreso — TOTALHIIT App

## 2026-10-30 (sesión 20) — Video de Presentación en Bucle en Entrenamientos y Respaldo de Recursos Multimedia
- **Video Banner de Entrenamientos:**
  - Sustituido el video de fondo anterior en `Entrenamientos.tsx` por `public/videos/presentaciondelasclases.mp4`.
  - Optimizado el video mediante FFmpeg con compresión H.264 CRF 26, `+faststart` y perfil de banner móvil (reducción de 56.2 MB iniciales a 4.68 MB), asegurando reproducción instantánea sin buffering y cumpliendo con el límite de 25 MB por archivo estático en Cloudflare Workers y compatibilidad nativa en Android.
  - Video configurado en bucle continuo y silencioso (`autoPlay`, `loop`, `muted`, `playsInline`).
  - Removido todo texto, título y subtítulo del banner en `Entrenamientos.tsx`, dejando de forma exclusiva la insignia en la esquina superior derecha: `"Coach VALENTINA"`.
  - En `BannerSeccion.tsx`, refinada la visualización: cuando no hay títulos, el degradado es más transparente y el brillo se preserva al 95% para resaltar la calidad visual del video de Valentina, manteniendo la insignia fijada a la esquina superior derecha.
- **Sincronización y Compilación:**
  - 196/196 pruebas unitarias aprobadas (`npm test`).
  - Compilación Web (`dist`) y sincronización nativa de Capacitor con Android ejecutadas con éxito.
  - Generada nueva compilación nativa de depuración `app-debug.apk` (24.48 MB) y copiada a `public/totalhiit.apk` y `dist/totalhiit.apk`.
  - Desplegado en Cloudflare Workers (`npx wrangler deploy`).
  - Todos los videos e imágenes respaldados en Git y listos en GitHub.

## 2026-10-30 (sesión 19) — Actualización APK v1.0.3 (Build 4), Banner Limpio de Entrenamientos, Vista Dual de Nutrición y Autocarga Resistente de Menú Semanal
- **Incremento y Sincronización Global de Versión v1.0.3 (Build 4):**
  - Actualizado `versionCode 4` y `versionName "1.0.3"` en `android/app/build.gradle`.
  - Actualizado `VERSION_ACTUAL = '1.0.3'` y `BUILD_ACTUAL = 4` en `src/lib/version/actualizador.ts`.
  - Actualizado `public/version.json` con fecha `2026-10-30` y registro de novedades.
  - Actualizado `package.json` a `v1.0.3`.
  - Configurado `public/_headers` con directivas estrictas `no-cache` y `max-age=0, must-revalidate` para `/version.json` y `/totalhiit.apk`, eliminando cachés intermedias en Cloudflare CDN y navegadores móviles.
  - En `Ajustes.tsx`, botón interactivo mejorado con llamada `window.open(url, '_system')` para descarga nativa directa sin bloqueos en WebView, mostrando el botón destacado "📲 Descargar e instalar versión v1.0.3" al detectar actualización.
- **Simplificación del Banner de Entrenamientos:**
  - En `BannerSeccion.tsx`, `titulo` convertido en propiedad opcional.
  - En `Entrenamientos.tsx`, eliminados los títulos "Programa TOTAL+40" y "Entrenamientos en Video", conservando la insignia destacada "Coach Valentina" arriba y el resumen de "12 clases progresivas + 2 de estiramiento" en la base.
- **Resiliencia Total y Diseño Visual en "Ver mi plan semanal" (`/plan`):**
  - Soporte universal para usuarios con perfil o en modo invitado (`usuario_invitado`), garantizando que la pantalla jamás quede en blanco.
  - Diseño enriquecido si no hubiera plan: tarjeta visual con fotografía de Valentina (`valen-plan-comidas.jpg`), lista de beneficios (7 días balanceados, compras consolidadas, PDF) y botón "✨ Generar mi menú de 7 días".
  - Corregidos tipos de timestamps (`Date.now()` en lugar de ISO strings) en `createdAt` y `updatedAt`.
- **Vista Dual en Nutrición ("Recetas para hoy" vs "Catálogo completo"):**
  - Selector de vista por pestañas en `Nutricion.tsx`:
    * **☀️ Recetas para hoy:** extrae las 4 comidas programadas para el día de la semana actual (Desayuno, Almuerzo, Cena, Snack) con tiempos de cocción, calorías, macronutrientes y enlace directo a la preparación, más botón para ver el menú semanal completo de 7 días.
    * **📚 Catálogo completo:** acceso a las 12 recetas antiinflamatorias completas con filtros por categoría, búsqueda por ingrediente y favoritos.
- **Verificación:** 196/196 pruebas en verde (`npm test`), build web sincronizado y nuevo APK Android compilado (18.6 MB). Desplegado en Cloudflare Workers y respaldado en Git.

## 2026-10-29 (sesión 18) — Renovación Integral del Ciclo Menstrual (Estilo Flo/Clue), Autocarga del Menú Semanal y Banners Temáticos de Valentina
- **Incorporación y Optimización de las 6 Fotografías de Valentina:**
  - Archivos procesados con bicubic interpolation a 1600px y 85% de calidad JPEG, reduciendo el peso de ~2.5 MB por archivo a ~145 KB sin pérdida perceptible de nitidez.
  - Banners actualizados en toda la app:
    * `banner-salud.jpg` y `valen-salud-agua.jpg`: Valentina bebiendo agua junto a la ventana.
    * `banner-objetivo.jpg` y `valen-objetivo-rutina.jpg`: Valentina atándose las zapatillas lista para entrenar con preparación saludable.
    * `banner-progreso.jpg` y `valen-progreso-metricas.jpg`: Smartwatch, libreta de registro y cinta métrica en estudio de fitness.
    * `banner-nutricion.jpg` y `valen-nutricion-salmon.jpg`: Valentina con plato de salmón a la plancha y vegetales al vapor.
    * `banner-entrenamiento.jpg` y `valen-entrenamiento-gym.jpg`: Valentina en el gimnasio estirando cuádriceps con mancuernas y bandas.
    * `banner-plan.jpg` y `valen-plan-comidas.jpg`: Composición cenital de superalimentos (quinua, garbanzos, palta, aceite de oliva, frutos secos).
- **Corrección de "Ver mi plan semanal" en Inicio:**
  - En `Plan.tsx` y `repositorio.ts`, se eliminó el bloqueo de pantalla en blanco (`return null;`) reemplazándolo por un indicador visual animado de carga.
  - Se implementó auto-generación inicial determinista del plan: al ingresar a `/plan`, si aún no existe menú para la semana en curso, se genera y persiste automáticamente respetando alérgenos y objetivos, evitando pantallas vacías.
  - Fallback defensivo en consulta IndexedDB (`db.planes.where`) para evitar excepciones no controladas.
- **Módulo de Ciclo Menstrual Renovado (Funcionalidad y UX estilo Flo / Clue):**
  - **Hero Card "¿En qué semana estás hoy?":** Widget destacado que indica el día exacto del ciclo (`Día X de tu ciclo`), nombre de la fase fisiológica (`Fase Menstrual`, `Fase Folicular`, `Fase Ovulatoria`, `Fase Lútea`), ícono representativo, descripción y barra de progreso de las 4 semanas.
  - **Conexión Directa con Entrenamientos de Totalhiit:** Recomendación de entrenamiento adaptada a la energía de la fase y botón directo `▶️ Ir a videos de la Semana {X}` que abre `/entrenamientos?semana={X}` filtrando de inmediato los videos correspondientes.
  - **Panel de Métricas y Estimaciones:** Próximo período con cuenta regresiva (*"Faltan X días"*, *"Mañana"*, *"Hoy"* o *"Retraso de X días"*), duración promedio del ciclo, variación promedio en días (`± X días`) y duración habitual de sangrado.
  - **Seguimiento Mes a Mes:** Historial estructurado mes a mes con fechas de inicio y fin de sangrado, duración total del ciclo entre períodos y badge de regularidad.
- **Verificación:** 196/196 pruebas unitarias pasando (`npm test`), build web sincronizado y APK Android compilado (`18.6 MB`). Desplegado en Cloudflare Workers y respaldado en Git.

## 2026-10-29 (sesión 17) — Validación y Cumplimiento Integral para Amazon Appstore (Fire OS y Tablets)
- **Auditoría Técnica y de Políticas para Amazon Appstore:**
  evaluación exhaustiva contra la documentación oficial de Amazon Appstore Submission (`developer.amazon.com/docs/app-submission/getting-started.html`).
- **Compatibilidad con Fire OS (sin dependencias de Google Play Services):**
  - La aplicación está desacoplada de Google Play Services (`com.google.android.gms`), permitiendo ejecución nativa fluida en Amazon Fire 7, Fire HD 8, Fire HD 10 y Max 11.
  - Reproductor de video adaptado en `ReproductorVideo.tsx`: reemplazo del intent propietario `vnd.youtube:` por apertura controlada en navegador (`window.open('https://www.youtube.com/watch?v=...')`), asegurando que en tabletas Fire sin la app nativa de YouTube se abra directamente en el navegador Silk sin fallos ni `ERR_UNKNOWN_URL_SCHEME`.
- **URL Pública y Oficial de Política de Privacidad:**
  - Creada página accesible y completa en `src/paginas/Privacidad.tsx` con la ruta `/privacidad` (`https://totalhiit-app.caribialabs.workers.dev/privacidad`).
  - Cumple los requerimientos de Amazon y normativas COPPA/GDPR: describe datos locales en el dispositivo (IndexedDB/Dexie), cifrado de extremo a extremo AES-GCM para ciclo menstrual, ausencia de rastreadores invasivos de terceros y mecanismo de supresión total de datos.
- **Mecanismo Obligatorio de Eliminación de Datos de Cuenta:**
  - Amazon exige opción de eliminación de cuenta/datos: implementada y visible en `/ajustes` ("Borrar mis datos").
- **Versión y Compilación Limpia:**
  - `versionCode 3` y `versionName "1.0.2"` en `android/app/build.gradle`.
  - Configurado `ignoreAssetsPattern` en AAPT para evitar empaquetado redundante de archivos `.apk` dentro de los assets nativos, optimizando el tamaño del APK a ~18.6 MB.
- **Verificación:** 194/194 pruebas en verde (`npm test`), build web sincronizado con Capacitor y APK Android compilado con éxito (`gradlew assembleDebug`). Desplegado en Cloudflare Workers.

## 2026-10-29 (sesión 16) — Safe Area Superior, Portadas Oficiales en Video, Banners Temáticos, Persistencia de Sincronización y Seguridad Admin
- **Botones superiores accesibles y ergonomía táctil (Safe Area):**
  reglas CSS `.safe-area-superior` y `.margin-safe-top` incorporadas en `src/index.css` con padding superior generoso adaptativo a notch y barra de estado de Android/iOS. Todos los botones de acción superior (retroceder, ir a la app, ajustes, salir, bienvenida) se aumentaron a dimensiones táctiles cómodas (mínimo 44px de alto) con botones estilo píldora de alto contraste.
- **Portadas oficiales en videos de entrenamiento y reproducción optimizada:**
  integración de las portadas oficiales (`img_21` a `img_35`) en el catálogo de sesiones (`CATALOGO_SESIONES`) y nuevo reproductor `ReproductorVideo.tsx` con portada de alta resolución, badge de duración, botón de reproducción animado sobre la imagen y acceso directo a la app nativa de YouTube (`vnd.youtube:...`) para reproducir videos privados con la cuenta Google de la usuaria sin trabas. Miniaturas añadidas a las tarjetas de la lista de entrenamientos.
- **Fotografía gastronómica en Nutrición:**
  reemplazo de imagen genérica por fotografía culinaria de alta definición (`banner-nutricion.jpg`) con plato antiinflamatorio saludable, colorido y balanceado.
- **Banners temáticos ilustrativos en pantalla de Inicio:**
  tarjetas visuales enriquecidas con imágenes temáticas de fondo para cada área clave: Tu Objetivo (`banner-objetivo.jpg`), Salud (`banner-salud.jpg`), Entrenamiento (`banner-entrenamiento.jpg`), Nutrición (`banner-nutricion.jpg`), Progreso (`banner-progreso.jpg`) y Ciclo Menstrual (`banner-ciclo.jpg`).
- **Persistencia de sincronización en la nube:**
  resuelto el problema donde el tilde de sincronización se desactivaba al salir de la pantalla; ahora se persiste de forma confiable en `localStorage` tanto para la sincronización general como para la privacidad del ciclo menstrual.
- **Botón de Cerrar Sesión en Ajustes:**
  agregado botón visible y seguro de "Cerrar sesión" en la sección de Cuenta y Membresía, restaurando el modo invitado sin borrar ni alterar los datos locales del dispositivo.
- **Visualización, cambio y recuperación de clave de administración:**
  - Botón "👁️ Ver clave" / "🙈 Ocultar" en el formulario de acceso para revisar la contraseña que se escribe.
  - Pestaña "🔐 Clave y Seguridad" dentro del panel de administración para cambiar la contraseña con validación de longitud y confirmación.
  - Mecanismo de recuperación de contraseña que permite restablecer la clave maestra a la predeterminada validando contra correos autorizados (`caribialabs@gmail.com` y `ebolivar1000@gmail.com`).
- **Actualizador in-app v1.0.2:**
  actualizado `actualizador.ts` para consultar la URL remota absoluta en Cloudflare Workers (evitando que Capacitor consulte el archivo local estático empaquetado), manifest `version.json` incrementado a v1.0.2 (build 3) y botón directo de descarga del nuevo APK con instrucciones para sobreescribir la app sin perder datos.
- **Verificación:** 194/194 pruebas en verde (`npm test`), build web impecable, APK Android compilado (17.76 MB) y desplegado con éxito en Cloudflare Workers.

## 2026-10-29 (sesión 15) — Branding Oficial, Banners Multimedia, Portada Animada, Panel de Admin y Control Demo
- **Letras de PDF ampliadas para máxima legibilidad:**
  ajuste tipográfico en `src/lib/nutricion/pdf.ts` incrementando tamaños a 20-22pt en títulos principales, 14pt en encabezados de sección, 11.5pt en listas de ingredientes y pasos (con interlineado generoso de 18pt), 10.5pt en la tabla nutricional (filas de 24pt) y notas aclaratorias a 9.5pt.
- **Detección inteligente de App Instalada vs Navegador:**
  en `Inicio.tsx`, el banner con llamado a la acción para instalar o descargar la app se oculta automáticamente si la aplicación se ejecuta dentro de la app nativa instalada (Capacitor) o en modo PWA standalone (`window.matchMedia('(display-mode: standalone)').matches`).
- **Banner Hero con Branding y Video en Bucle:**
  incorporación de reproductor de video en bucle en la cabecera de la pantalla de Inicio con `intro-totalhiit.mp4`, degradados oscuros de alto contraste y logotipos oficiales de TOTALHIIT.
- **Logotipo Oficial de TOTALHIIT en Pantalla Principal del Celular (Iconos Android y PWA):**
  script `scripts/generar-iconos-android.ps1` que generó los iconos de la app en todas las densidades de Android (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) para `ic_launcher.png`, `ic_launcher_round.png` e `ic_launcher_foreground.png`, así como los iconos de PWA (`icon-192.png`, `icon-512.png`), reemplazando el icono genérico de Capacitor por el branding oficial de TOTALHIIT.
- **Módulo de Administración (`/admin`), Suscriptores Activos y Modo Demo:**
  - Base de datos Dexie actualizada a versión 7 (`suscriptores` y `anuncios`).
  - Servicio `admin-servicio.ts` con clave de seguridad (`totalhiit2026`), administradores por defecto (`caribialabs@gmail.com`, `ebolivar1000@gmail.com`), CRUD completo de suscriptores y anuncios de promociones/actualizaciones. 6 pruebas unitarias (`admin-servicio.test.ts`).
  - Pantalla `/admin` accesible desde Ajustes con protección por contraseña, gestión de suscriptores y editor de anuncios.
  - Modo Demo implementado: las usuarias que aún no están dadas de alta como suscriptoras activas acceden a una demo funcional (clases 0 y 1 en Entrenamientos, primeras recetas en Nutrición); el resto del catálogo muestra candado informativo 🔒 y recordatorio para vincular su cuenta de Google o suscribirse.
  - Tablón de anuncios activos en pantalla de Inicio para avisos de promociones y nuevas versiones de la app.
- **Portada de Transición Animada (Splash Screen):**
  componente `PortadaTransicion.tsx` que muestra una presentación animada de 2 segundos al abrir la app con logo pulsante, anillos radiantes, lema de marca "Entrenamiento, Nutrición y Salud para Mujeres +40" y barra de progreso fluida.
- **Banners Modernos con Valentina en Todas las Secciones:**
  componente reutilizable `BannerSeccion.tsx` con soporte para video en bucle y fotografías optimizadas de Valentina (`totalhiit_1.jpg` a `totalhiit_8.jpg`), degradados de diseño y badges de sección integrados en `Entrenamientos`, `Nutrición`, `Salud`, `Progreso`, `Ciclo` y `Plan`.
- **Icono de Salud en la Barra Inferior:**
  barra de navegación actualizada en `Navegacion.tsx` mostrando las 5 secciones principales: Inicio, Entrenar, Nutrición, Salud (❤️) y Progreso.
- **Optimización y Despliegue en Cloudflare Workers:**
  optimización de imágenes con `scripts/optimizar-imagenes.ps1` y eliminación de copias recursivas de APK, reduciendo el APK de Android a solo 15.13 MB (muy por debajo del límite de 25 MB de Cloudflare). Despliegue completado con éxito en `https://totalhiit-app.caribialabs.workers.dev` y `totalhiit.apk` disponible para descarga directa. 192/192 pruebas unitarias pasando.

## 2026-10-28 (sesión 14) — Descarga Nativa de PDFs, Acceso a Videos Privados con Gmail y Actualizador In-App
- **Descarga y guardado de PDFs nativo y multiplataforma:**
  integración de `@capacitor/filesystem` (v8.1.5) y `@capacitor/share` (v8.0.3). En Android APK, el PDF se escribe en caché y se comparte directamente mediante la hoja nativa del sistema (Guardar en Descargas, Drive, Abrir con PDF viewer, etc.). En navegadores móviles se usa Web Share con `new File(...)`, y en escritorio descarga directa con revocado diferido de Blob URL (60s). Mensajes claros de confirmación en `DetalleReceta.tsx` y `Plan.tsx`.
- **Acceso a videos privados de YouTube con cuenta Google (@gmail.com):**
  campo `emailGoogle` añadido al perfil (`userProfileSchema`, `esquemaPerfilFormulario`, `Secciones.tsx`, `Onboarding.tsx`, `EditarPerfil.tsx`, `Perfil.tsx`). Reproductor de video actualizado a `youtube.com/embed` con panel de autorización y botón de acción directa `▶️ Abrir en la app de YouTube con Google`, permitiendo que la usuaria aproveche su sesión activa de Google para visualizar videos privados autorizados.
- **Sistema de actualización in-app sin reinstalar ni perder datos:**
  manifiesto `public/version.json` (`v1.0.1`, build 2), módulo `src/lib/version/actualizador.ts` con comprobación sin caché y pruebas unitarias (3/3). Tarjeta "Actualización de la App" en `/ajustes` con botón "Buscar actualización" y descarga directa del APK. En Android, la instalación sobre la app existente preserva intacta la base de datos local (Dexie), sin desinstalar ni perder avances.
- **Verificación:** 186/186 pruebas unitarias en verde (`npm test`) y build `tsc -b && vite build` impecable. APK Android compilado (`17.7 MB`) y desplegado en Cloudflare Workers.

## 2026-10-28 (sesión 13) — Ajustes UX, Español Neutro, Ciclo Flexible, Catálogo Completo y Compilación Nativa APK
- **Compilación Nativa de Android APK:**
  compilación exitosa en local con Gradle 8.14.3, OpenJDK 21 y Android SDK 35/36 (`android/app/build/outputs/apk/debug/app-debug.apk`, ~5 MB).
  Desplegado en Cloudflare con acceso directo para descarga en celular vía `https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk` y botones de descarga directa en pantalla de Inicio y Ajustes.
- **Ciclo Menstrual flexible:**
  calendario interactivo posicionado arriba con selección de día y navegación de meses; soporte para registrar períodos completos con rango de fechas personalizable (inicio y fin) o registros por día; métricas y episodios adaptados.
- **Español neutro de Latinoamérica:**
  reemplazo integral del voseo argentino por español neutro (completa, revisa, tienes, eres, puedes, haz, ingresa, elige, disfruta, aquí) en formularios, esquemas Zod, componentes y todas las pantallas.
- **Catálogo de entrenamientos ordenado por semana:**
  las 12 clases del programa + 2 de estiramientos organizadas por semana (Semana 1, Semana 2, Semana 3, Semana 4, Estiramientos) con pestañas dedicadas; las clases con mancuernas no se ocultan, sino que se destacan con badge informativo.
- **Espaciado inferior y UX móvil:**
  aumento de padding inferior (`pb-48` / `pb-52`) y espaciadores finales en todas las pantallas para evitar solapamientos con la barra de navegación del navegador o el sistema.
- **Módulo de progreso flexible:**
  selector de fecha personalizable (`<input type="date">` y calendario interactivo) para registrar o editar cualquier día pasado o futuro; función `borrarEntradaDiaria` con prueba unitaria dedicada.
- **Botones de PDF:**
  etiquetas simplificadas a "Descargar en PDF" (conservando la marca de agua interna TOTALHIIT).
- **Verificación:** 183/183 pruebas unitarias en verde (`npm test`) y build TypeScript sin errores (`npm run build`).

## 2026-10-28 (sesión 12) — FASE 11 cerrada (distribución APK + PWA)
- **Capacitor 8 para Android APK:**
  instalación de `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` v8.6.0;
  inicialización de `com.totalhiit.app` (`capacitor.config.ts`);
  plataforma nativa `android/` configurada con permisos mínimos (`INTERNET`,
  `ACCESS_NETWORK_STATE`) y `allowBackup="true"`.
- **Firma y compilación reproducible:**
  `android/app/build.gradle` configurado con soporte para firma de release
  mediante variables de entorno/propiedades; script de generación de keystore
  `scripts/generar-keystore.ps1` (RSA 2048, 10.000 días de validez);
  `.keystore`, `.jks`, `.apk` excluidos del repo en `.gitignore`.
  Workflow automatizado CI en `.github/workflows/build-apk.yml` (compilación
  en la nube con Ubuntu y JDK 21 Temurin).
- **PWA en Cloudflare Pages:**
  `public/_redirects` (`/* /index.html 200`) para SPA; `public/_headers` con
  seguridad OWASP y política de autoUpdate (`/sw.js` y manifest sin caché,
  `/assets/*` inmutables por 1 año).
- **Materiales de distribución para la usuaria:**
  guía completa de instalación fuera de Google Play (`docs/guia-instalacion-apk.md`)
  con explicación transparente del aviso de Play Protect para mujeres +40;
  bloque HTML/Tailwind preparado para el sitio web (`docs/enlace-descarga-web.md`)
  sin tocar el repositorio del sitio existente.
- **Resiliencia offline y accesibilidad:**
  monitor desacoplado `MonitorConexion` (`src/lib/red/conexion.ts`), hook `useConexion`
  con `useSyncExternalStore` (React 19) y banner superior accesible `AvisoConexion`
  (`role="status"`, `aria-live="polite"`).
- **Verificación:** `tsc -b` ✅ · **vitest 180/180** ✅ (3 nuevas: monitoreo de red,
  notificación a suscriptores, desuscripción limpia) · `npm run cap:copy` ✅ ·
  build web y sincronización nativa en verde.
- Docs actualizadas (`docs/roadmap.md`, `docs/deployment.md`, `ai/state.md`, `ai/next-steps.md`, D25–D27).

## 2026-10-28 (sesión 11) — FASE 10 cerrada (identidad, sync y premium)
- **Comparativa de Backend documentada** (`docs/comparacion-backend.md`):
  análisis exhaustivo Cloudflare Workers+D1(+R2) vs Supabase con límites de plan
  gratis verificados. Supabase suspende proyectos tras 7 días de inactividad,
  mientras que Cloudflare D1 ofrece 5 GB de BD sin suspensiones y R2 ofrece 10 GB
  con $0 por transferencia saliente (egress). Se adoptó Cloudflare aprovechando la
  cuenta existente (`caribialabs@gmail.com`).
- **Modelo de amenazas y privacidad de datos íntimos** (`docs/threat-model-sync.md`):
  análisis STRIDE/OWASP. Regla: el ciclo menstrual permanece solo local por defecto;
  si se sincroniza, se exige cifrado **Zero-Knowledge con PIN** en cliente
  (`src/lib/seguridad/pin-crypto.ts`, WebCrypto PBKDF2 100k + AES-GCM-256). El servidor
  recibe únicamente texto cifrado ininteligible.
- **Entitlements y validación en servidor** (`src/lib/premium/entitlements.ts`):
  roles `invitado`, `usuario`, `premium`, `admin`. Regla dura inviolable:
  el ciclo menstrual básico, las calculadoras y la exportación de datos son **SIEMPRE GRATIS**.
  La autorización se valida estrictamente en el backend (`validarPermisoServidor`);
  sin pasarelas de pago hasta decisión del propietario.
- **Autenticación y sesión local-first** (`src/lib/auth/auth.ts`):
  esquemas Zod de credenciales con complejidad obligatoria, sesión con persistencia
  local segura y modo invitado por defecto.
- **Motor de sincronización Local-First** (`src/lib/sync/sync-engine.ts`):
  resolución de conflictos Last-Write-Wins (LWW), cola offline con vaciado automático
  al sincronizar, soporte de lápidas (soft delete) y verificación de seguridad obligatoria
  que rechaza sincronizar datos íntimos en claro.
- **UI `/ajustes` actualizada:**
  sección "Cuenta y Membresía" (estado de invitado/usuario y aviso de gratuidad),
  sección "Sincronización y Respaldo" con selector de privacidad para el ciclo
  ("Solo en este dispositivo" vs "Cifrado Zero-Knowledge con PIN").
- **Verificación:** `tsc -b` ✅ · **vitest 177/177** ✅ (30 pruebas nuevas: 6 de PIN crypto,
  12 de entitlements y permisos de servidor, 6 de auth y sesión, 6 de sync engine) ·
  build de producción PWA ✅ (main 615 kB, pdf 426 kB lazy).
- Docs actualizadas (roadmap FASE 10 tildada, state, next-steps, D21–D24, backend y threat model).

## 2026-10-28 (sesión 10) — FASE 9 cerrada (menús semanales, compras y PDF del plan)
- **Modelo + DB v6:** `planSemanalSchema` (semana arranca en lunes, slots únicos
  por día/comida, porciones del plan) y store `planes` con índice
  `[userId+semanaInicio]`; `guardarPlanSemanal` hace upsert conservando
  id/createdAt; exportación pasa a **versión 6** y el borrado definitivo limpia
  los 10 stores.
- **Planificador determinista** (`src/lib/nutricion/planificador.ts`): 7 días ×
  desayuno/almuerzo/cena/snack con `filtrarRecetas` + `ordenarPorObjetivo`
  (alérgenos/exclusiones/presupuesto/objetivo del perfil, sin IA), rotación por
  día, `recetasParaComida` para el reemplazo manual y `reemplazarSlot`.
- **Lista de compras consolidada** (`compras.ts`): suma por nombre+unidad
  escalada a las porciones del plan, "a gusto" aparte y orden alfabético es-AR.
- **PDF del plan** (`pdf.ts` refactorizado): `crearMarco` compartido (cabecera
  con logo + wordmark) + `generarPdfPlan` (sección por día con las 4 comidas y
  lista de compras del día con cantidades) + `nombreArchivoPdfPlan`;
  `cargarLogoPdf` exportada y reutilizada por el detalle de receta. Marca de
  agua + pie en todas las páginas.
- **UI `/plan`:** CTA "Generar mi plan" si no hay plan de la semana; regenerar,
  toggle de compras, PDF (import dinámico) y Selector por comida para cambiar
  cualquier slot con link al detalle. Enlace "Plan semanal →" en la tarjeta de
  Nutrición de Inicio.
- **Verificación:** `tsc -b` ✅ · **vitest 147/147** ✅ (14 nuevas: determinismo,
  cobertura de categorías, alérgenos, reemplazo, upsert por semana, historial,
  compras, exportación v6, PDF del plan) · build ✅ (main 611 kB, pdf 426 kB
  lazy) · dev 5174 responde en `/plan`.
- Docs actualizadas (roadmap FASE 9 tildada, state, next-steps, D20).

## 2026-10-28 (sesión 9) — FASE 8 cerrada (ciclo menstrual, privacidad estricta)
- **Cifrado local** (`src/lib/ciclo/cifrado.ts`): WebCrypto AES-GCM-256 con
  clave aleatoria que vive solo en `localStorage`; IV nuevo por cifrado; helpers
  exportados (crear/importar/cifrar/descifrar/obtenerOCrear/borrarClave) con
  almacenamiento inyectable para pruebas.
- **Registro cifrado:** la fila en IndexedDB (DB v5, store `ciclo`) solo tiene
  metadatos + `datosCifrados`; flujo/síntomas/notas se cifran ANTES del `put`
  y se descifran solo en memoria al leer (los corruptos se omiten). Upsert por
  día preservando id/createdAt.
- **Privacidad verificada con pruebas:** ni la fila cruda ni la exportación
  serializada (v5) contienen el contenido en claro; la clave nunca sale del
  dispositivo; sin telemetría ni logs. 133/133 pruebas.
- **Estimaciones honestas** (`estimaciones.ts`): episodios (gap ≤2 días), ciclos
  por inicios, ventana del próximo inicio = [mín−3, máx+3] con centro estimado,
  irregularidad marcada con motivo (fuera de 21–35 o variación >7 días) y
  estados con 0/1 ciclo sin inventar predicciones.
- **UI `/ciclo`:** puerta de consentimiento (explica cifrado/borrado, con "No,
  gracias" y desactivación con doble confirmación + borrado total del módulo),
  registro de hoy (flujo chips, síntomas sugeridos + libres, notas), calendario
  del mes (sangrado/manchado/ventana punteada/hoy), historial de ciclos y
  avisos ("no sirve para prevenir ni planificar embarazos").
- Accesos: ruta `/ciclo` + tarjetas en Inicio y Progreso. Sin dependencias
  nuevas; build con pdf lazy; dev 5174 responde en `/ciclo`.
- Docs actualizadas (roadmap FASE 8 tildada, state, next-steps, D19).

## 2026-10-28 (sesión 8) — FASE 7 cerrada (progreso y sueño)
- **Modelo de registro diario** (`entradaDiarioSchema`): una entrada por usuario
  y día con upsert (`guardarEntradaDiaria` preserva id/createdAt, fusiona con lo
  previo y limpia los campos enviados como `undefined`/`''`). Campos voluntarios:
  peso (25–400), energía y ánimo 1–5, horas de sueño (0–16), calidad 1–5,
  vasos de agua (0–24) y notas (500).
- **DB v4:** store `entradasDiario` con índice `[userId+fecha]`; exportación
  (version 4) y borrado definitivo incluyen el nuevo store.
- **Métricas puras** (`src/lib/progreso/metricas.ts`, con fórmulas documentadas):
  racha de días activos (hoy o ayer; el descanso de hoy NO rompe la racha),
  promedio en ventana de N días, tendencia de peso (último vs más antiguo en 30
  días, ≥2 registros, Δ redondeado) y resúmenes semanales lunes–domingo.
- **Sugerencias del dashboard** (`recomendaciones.ts`): reglas deterministas y
  orden fijo (entrenamiento vs semana pasada → hidratación vs meta 35 ml/kg →
  sueño <7 h → peso si pasaron 14 días → receta del motor con alérgenos y
  presupuesto aplicados), máximo 3, sin culpabilización.
- **Gráficos propios** (`componentes/graficos.tsx`): línea SVG (polilínea +
  puntos + min/max) y barras por div; cero librerías nuevas.
- **Página `/progreso` completa:** racha en hero magenta, 4 métricas rápidas,
  formulario "Registro de hoy" (chips 1–5, checkbox para actualizar el peso del
  perfil usado por las calculadoras), gráficos, calendario de actividad del mes
  (entreno/registro/hoy), últimas 4 semanas y sugerencias. Copy sin juicios y
  aviso de datos solo locales.
- **Verificación:** `tsc -b` ✅ · **vitest 118/118** ✅ (25 nuevas: calendario,
  racha con huecos/duplicados, ventanas de promedio, tendencia y semanas,
  sugerencias con máximo 3, upsert/limpieza/rango/limite del registro diario,
  exportación v4 + borrado) · build ✅ (main 588 kB, pdf 424 kB lazy) ·
  dev server 5174 responde en `/progreso`.
- Docs actualizadas (roadmap FASE 7 tildada, state, next-steps, D18).

## 2026-10-28 (sesión 7) — FASE 6 cerrada (PDF de recetas)
- **Servicio `src/lib/nutricion/pdf.ts`** con pdf-lib: A4 exacto, logo opcional
  (`/images/logo.png` con fallback JPG y omisión en caso de error), título + meta
  (categoría, tiempo, fecha), descripción, ingredientes escalados a las porciones
  (reutiliza `escalarReceta`), pasos numerados con envoltura de línea
  (`wrapText`), sustituciones/conservación, tabla nutricional de dos filas (por
  porción y total N) dibujada con rects/bordes, y notas de fuentes (USDA FDC) +
  aviso no clínico + uso personal.
- **Marca de agua TOTALHIIT** (`estamparMarcaAgua`): texto diagonal 45° magenta
  con opacidad 0.08 estampado en **todas las páginas** + pie con numeración
  "n / total" en cada página. Exportada para reutilizar en el PDF del plan
  semanal (FASE 9).
- **Sanitización WinAnsi** (fuentes estándar): curly quotes → rectas, en/em dash
  → '-', y cualquier carácter fuera de Latin-1 eliminado; acentos/ñ/° intactos
  (probado).
- **Descarga en UI:** botón "⬇ Descargar PDF con marca de agua" en
  `/nutricion/:id` con estado "Generando PDF…". Guardado por Blob + a[download]
  (mismo mecanismo válido para Android WebView y Safari). La prueba en
  dispositivos reales queda para FASE 11 (anotada en roadmap y D17).
- **Code-splitting del PDF:** el import estático había llevado el main a 993 kB;
  con **import dinámico** pdf-lib queda en chunk propio `pdf-*.js`
  (424 kB / 177 kB gzip, cargado solo al descargar) y el main volvió a ~570 kB.
- **Verificación:** `tsc -b` ✅ · **vitest 93/93** ✅ (8 nuevas: PDF válido con
  acentos, A4 exacto, totales con 6 porciones, multi-página, sin logo con fecha
  fija, marca de agua en 3 páginas, wrapText ancho/saneo, nombre de archivo
  slug) · build ✅.
- Docs actualizadas (roadmap FASE 6 tildada, state, next-steps, D17).

## 2026-10-28 (sesión 6) — FASE 5 cerrada (nutrición y recetas)
- **Catálogo propio** (`src/lib/nutricion/recetas.ts`): 12 recetas originales
  para +40 en 6 categorías (desayuno/almuerzo/cena/snack/bebida/postre), con
  macros por porción, alérgenos declarados, objetivos compatibles,
  sustituciones, conservación y tiempos; ingredientes embebidos (normalización
  FoodIngredient diferida a FASE 9).
- **Motor determinista** (`motor.ts`): **regla dura de alérgenos con prueba
  obligatoria en verde** (ningún alérgeno cargado pasa, case-insensitive),
  exclusiones por nombre de ingrediente, presupuesto escalera, filtro "¿qué
  tenés en casa?" por ingrediente y orden por objetivo.
- **Escalado de porciones:** cantidades y macros totales recalculados (1–6).
- **DB v3:** `preparaciones` (RecipePreparation); exportación y borrado la incluyen.
- **Pantallas:** `/nutricion` (búsqueda por ingrediente, chips de categoría,
  ⭐ favoritas, badge "Preparada N×", aviso de protección del motor) y
  `/nutricion/:id` (macros por porción + totales, selector de porciones,
  ingredientes escalados, pasos, sustituciones/conservación, "La preparé",
  historial, fuentes USDA FDC).
- **Suite: 85/85 en verde** (+17 motor/catálogo, +1 preparaciones).
- **Verificación:** `tsc -b` ✅ · build ✅ (chunk 567 kB) · roadmap FASE 5 tildada.

## 2026-10-28 (sesión 5) — FASE 4 cerrada (entrenamientos)
- **Catálogo real:** 15 sesiones del canal del propietario (12 clases del
  bootcamp TOTAL+40 + intro + 2 de movilidad) en
  `src/lib/entrenamiento/sesiones.ts`, con 10 categorías derivadas del
  contenido, nivel, duración, equipo, objetivos compatibles y precauciones.
- **Motor de filtros** (`filtros.ts`) con **regla dura de equipo** (nunca sugiere
  equipo que falta en el perfil; `peso_corporal` siempre disponible) + filtros
  por categoría/duración/nivel/objetivo y orden "para tu objetivo".
- **DB v2:** stores `sesiones` (entrenamientos realizados) y `favoritos`
  genéricos (sesión|receta). Exportación JSON y borrado total incluyen ambas.
- **Reproductor** (`ReproductorVideo`): YouTube en modo nocookie con estados de
  carga, error (con "Ver en YouTube" + reintentar) y **offline** (detecta
  navigator.onLine).
- **Pantallas:** `/entrenamientos` (chips de categoría y duración, badge "Para
  tu objetivo", ⭐ favoritos, "Hecha N×", historial de últimas sesiones) y
  `/entrenamientos/:id` (reproductor, descripción, precauciones, equipo,
  "Completé esta clase" que registra la sesión, favoritos, historial por clase).
- **Suite: 68/68 en verde** (+10 de catálogo/filtros, +3 de repositorio).
- **Verificación:** `tsc -b` ✅ · build ✅ (chunk 542 kB) · roadmap actualizado
  (nota: registro de peso queda para FASE 7 junto al dashboard de Progreso).

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
