# Arquitectura — App TOTALHIIT

> Documento vivo (nombres según master prompt §12). Actualizar al cerrar cada decisión.

## 1. Visión general

```
┌────────────────────────────────────────────────────────────┐
│                BASE DE CÓDIGO ÚNICA (React + TS)           │
│  src/lib/*      lógica pura (fórmulas, motor, entidades)   │
│  src/componentes/*  UI reutilizable (design system)        │
│  src/paginas/*  pantallas por módulo A–L                   │
│  src/lib/datos/* repositorios (Dexie/IndexedDB, local)     │
└─────────────┬──────────────────────────────┬───────────────┘
              │                              │
   ┌──────────▼─────────┐         ┌──────────▼─────────┐
   │  PWA (iOS / web)   │         │  Android (Capacitor)│
   │  vite-plugin-pwa   │         │  @capacitor/android │
   │  SW + manifest     │         │  APK firmado (fase 11)│
   └────────────────────┘         └─────────────────────┘
```

Principios (master prompt §1): un solo código base, tecnología gratuita y open
source, módulos desacoplados, mobile-first, privacidad por defecto, MVP funcional
antes que pantallas incompletas, sin servicios pagos ni suscripciones.

## 2. Decisiones por capa

### Lógica pura (`src/lib/*`)
- Sin dependencias de React ni DOM: se prueba con Vitest en Node.
- Fórmulas de salud documentadas con fuente (IMC: clasificación orientativa OMS;
  TMB: Mifflin-St Jeor; TDEE: factor de actividad sobre TMB).
- Motor de recomendaciones **determinista por reglas**; la IA es opcional y posterior (FASE 12).

### Datos (local-first)
- IndexedDB con **Dexie 4**: entidades separadas (ver `docs/data-model.md`).
- Repositorio abstracto (`src/lib/datos/`) para migrar a backend (Cloudflare
  Workers+D1 / Supabase) sin reescribir UI (FASE 10 compara opciones).
- Advertencia explícita: **IndexedDB no cifra por sí solo** y en Safari/iOS el
  sistema puede desalojar almacenamiento de sitios poco usados (ITP/eviction).
  Consecuencias y mitigaciones en `docs/security-privacy.md`.

### Estado de UI
- React Context + hooks. Zustand solo si el estado global crece (justificar antes de sumar dependencias).

### Formularios
- react-hook-form + zod (esquemas compartidos con las entidades del modelo de datos).

### PDF (`src/lib/pdf/*`, FASE 6)
- pdf-lib (MIT, JS puro: mismo comportamiento en WebView Android y Safari/iOS).
- A4, logo, tabla nutricional, **marca de agua diagonal semitransparente en todas
  las páginas**, fecha de generación y nota de valores aproximados.

### PWA (iOS/web)
- vite-plugin-pwa: manifest + precache + autoUpdate.
- `viewport-fit=cover` + `.safe-area-inferior` para safe areas iOS; teclado virtual
  y navegación a validar en dispositivo real (FASE 11).
- Pantalla de instalación con instrucciones para iPhone (Añadir a pantalla de inicio).

### Android (FASE 11)
- Capacitor 8 genera el proyecto nativo; `android/` se commitea (excepto artefactos).
- Requiere JDK 21 + Android SDK (no instalados aún; instalación documentada en
  `docs/deployment.md` cuando llegue la fase, con autorización del propietario).
- Identificador propio: `com.totalhiit.app` (propuesto). Permisos mínimos.

## 3. Mapa de navegación y pantallas (propuesta FASE 0)

Barras: **inferior fija** con 5 destinos; superior con marca y título de contexto.

| Ruta | Pantalla | Módulo | Fase |
|---|---|---|---|
| `/` | Inicio / Dashboard | A | 7 (stub desde 1) |
| `/perfil` | Perfil + onboarding | B | 2 |
| `/calculadoras` | Calculadoras (IMC, TMB, TDEE, macros) | C | 3 |
| `/nutricion` | Recetas (lista + filtros) | D | 5 |
| `/nutricion/:id` | Detalle de receta | D | 5 |
| `/nutricion/plan` | Plan semanal + lista de compras | D | 9 |
| `/entrenamientos` | Catálogo de rutinas | F | 4 |
| `/entrenamientos/:id` | Detalle + reproductor | F | 4 |
| `/progreso` | Progreso, hábitos, gráficos | G | 7 |
| `/ciclo` | Calendario menstrual (opcional) | H | 8 |
| `/sueno` | Sueño y recuperación | I | 7 |
| `/ajustes` | Preferencias, consentimientos, privacidad, exportar/borrar | J | 2 (base) / 8 |
| `/ajustes/ayuda` | Ayuda, privacidad, términos | J | 2 |
| Onboarding | `/onboarding` (primera ejecución, skippable) | B | 2 |

Reglas de navegación: el onboarding corre solo la primera vez; el módulo menstrual
aparece en Progreso/Ajustes **solo si fue activado** (consentimiento explícito);
el dashboard se adapta a los módulos activos.

## 4. Recursos reutilizables del sitio (uso autorizado por el propietario)

| Recurso | Origen (MiPrimeraApp) | Uso en la app | Licencia/condición |
|---|---|---|---|
| Logo `logo_valen.jpeg` (+ `logo.png`) | `public/images/` | Splash, PDFs, headers | Propiedad del proyecto |
| Fuente Edo | `public/fonts/edo.woff` + README | Marca tipográfica | Uso comercial libre (Vic Fieger) |
| Paleta magenta | `src/index.css` del sitio | Tokens de marca | Propia |
| 15 videos (YouTube IDs) | `src/data/bootcampData.ts` | Módulo entrenamientos | Propios / embebidos |
| Textos de clases y material nutricional | repo del sitio | Contenido de módulos | Propios |
| Auth / admin / pagos del sitio | — | **NO reutilizar** sin revisión de seguridad | — |

## 5. Versiones auditadas (28/10/2026)
React 19.3.1 · TypeScript 7.0.2 (en uso, con plan de fallback a 5.9) ·
Vite 8.3.5 · Tailwind 4.3.3 · react-router 8.5.1 · Capacitor 8.5.3 (fase 11) ·
pdf-lib 1.17.1 · Dexie 4.4.7 · zod 4.6.7 · react-hook-form 7.91 · vitest 5.0.5 ·
vite-plugin-pwa 2.0. Node v26.7.0 / npm 11.19.0 en la PC del propietario.
