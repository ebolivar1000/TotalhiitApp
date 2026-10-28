# TOTALHIIT App

Aplicación independiente del sitio web TOTALHIIT: entrenamiento HIIT adaptado,
nutrición personalizada y bienestar integral para mujeres de más de 40 años.

- **Un solo código base:** React + TypeScript + Vite + Tailwind CSS v4.
- **Dos distribuciones:**
  - Android: APK con Capacitor (fase posterior; requiere JDK 21 + Android SDK).
  - iOS / web: PWA instalable (manifest + service worker, `vite-plugin-pwa`).
- **Datos:** local-first (IndexedDB vía Dexie). Sin backend en el MVP.
- **Sitio web (NO modificar sin autorización):** https://totalhiit.pages.dev —
  repo: `C:\Users\Everth\ProyectosIA\MiPrimeraApp`.

## Comandos

```bash
npm run dev        # http://127.0.0.1:5174  (puerto propio para no chocar con el sitio: 5173)
npm run build      # tsc -b + vite build
npm test           # vitest (fórmulas, motor de reglas, PDF, predicciones)
npm run preview    # sirve dist/ para probar la PWA en local
```

## Estructura

```
src/
├── componentes/    UI reutilizable (navegación, tarjetas, formularios…)
├── paginas/        Pantallas por módulo (A–L del master prompt)
├── lib/
│   ├── salud/      Fórmulas comprobables (IMC, TMB, TDEE, macros) + pruebas
│   ├── nutricion/  Catálogo de recetas + motor de recomendaciones por reglas
│   ├── entrenamiento/ Catálogo de rutinas
│   ├── pdf/        Servicio de generación PDF con marca de agua
│   └── datos/      Repositorios Dexie (local-first) y entidades
└── index.css       Tailwind + tokens de marca (paleta magenta, fuente Edo)
```

## Documentación (nombres según master prompt §12)

- `docs/architecture.md` — arquitectura, mapa de navegación y recursos reutilizados.
- `docs/roadmap.md` — fases 0–12, criterios de aceptación, dependencias y riesgos.
- `docs/data-model.md` — entidades, relaciones y esquema Dexie.
- `docs/security-privacy.md` — seguridad, privacidad y reglas de datos íntimos.
- `docs/testing.md` — estrategia de pruebas por fase.
- `docs/deployment.md` — PWA y APK (estado: nada desplegado aún).
- `docs/progreso.md` — bitácora por sesión.
- `ai/state.md`, `ai/decisions.md`, `ai/next-steps.md` — memoria de continuidad.

## Reglas del proyecto

- Todo en español; TypeScript estricto; mobile-first.
- No reutilizar mecanismos de auth/admin/pagos del sitio sin revisión de seguridad.
- Sin suscripciones ni servicios pagos; el MVP debe funcionar sin IA de pago.
- Los datos menstruales y de salud son íntimos: mínimos, locales y con consentimiento explícito.
