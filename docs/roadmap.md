# Roadmap — App TOTALHIIT

> Fases según master prompt (FASE 0–12). Cada fase tiene criterios de aceptación
> verificables. Regla: **app funcional antes que pantallas incompletas**; fases se
> pueden trozar en hitos menores.
> Complejidad relativa: S < M < L < XL.

## Matriz de dependencias entre fases

| Fase | Depende de | Nota |
|---|---|---|
| 1 Fundación | — | ✅ hecha |
| 2 Perfil/onboarding | 1 | base de datos local + consentimientos |
| 3 Calculadoras | 2 | usan datos del perfil |
| 4 Entrenamientos | 2 (histórico de sesiones) | catálogo puede avanzar en paralelo con 3 |
| 5 Nutrición/recetas | 2, 3 | motor usa perfil+objetivos y límites energéticos |
| 6 PDF recetas | 5 | |
| 7 Progreso y sueño | 4 (sesiones), 2 (peso inicial) | dashboard (A) se completa aquí |
| 8 Menstrual | 2 (consentimientos) | independiente de 4–7 salvo dashboard |
| 9 Menús semanales | 5, 6 | lista de compras + PDF de plan |
| 10 Backend/premium | todas las funcionales | decisión de backend + seguridad previa |
| 11 Distribución | 2–9 | APK + PWA en producción |
| 12 Evolución | 10, 11 | IA opcional, admin, i18n |

## Estado y criterios de aceptación

### FASE 0 — Auditoría y planificación ✅ (2026-10-28)
- [x] Entorno verificado; recursos del sitio inventariados (modo lectura)
- [x] Arquitectura, estructura de carpetas y modelo de datos diseñados
- [x] Matriz de dependencias, complejidad, riesgos y roadmap con criterios

### FASE 1 — Fundación ✅ (2026-10-28) — complejidad M
- [x] Proyecto independiente creado (repo propio, git, sin tocar el sitio)
- [x] React 19 + TS 7 + Vite 8 + Tailwind 4.3 + PWA configurados y compilando
- [x] Navegación base (6 rutas + barra inferior mobile-first con safe-areas)
- [x] Design system inicial (tokens de marca, fuente Edo, componentes base)
- [x] Pruebas configuradas y en verde (8/8 IMC)
- [x] Documentación de continuidad §12 completa

### FASE 2 — Onboarding y perfil — complejidad L  ← **próxima**
Criterios de aceptación:
1. Onboarding en pasos skippables guarda un `UserProfile` válido (zod) en Dexie.
2. Los 7 objetivos configurables cambian sin perder historial (`UserGoal` con vigencia).
3. Preferencias nutricionales (alergias, exclusiones, tiempo, presupuesto, región) editables.
4. Consentimientos registrados (módulo, versión, fecha) y revocables desde Ajustes.
5. Edición y **borrado** de datos desde Ajustes (borrado = eliminar stores del usuario).
6. Solo mayores de 18 (validación de edad con minimización de datos).

### FASE 3 — Calculadoras — complejidad M
1. [x] IMC (ya probado) + TMB Mifflin-St Jeor + TDEE + orientación de macros, con
   variables fisiológicas pedidas por separado del género.
2. [x] Estimaciones ajustables por objetivo; sin déficits extremos automáticos.
3. [x] Pruebas matemáticas unitarias (casos límite) en verde.
4. [ ] Registro opcional de evolución (peso) conectado a Progreso → se implementa
   junto con el dashboard de Progreso (FASE 7); la FASE 3 deja la fórmula lista.
5. [x] Advertencias de incertidumbre visibles en cada resultado.

### FASE 4 — Entrenamientos — complejidad L ✅ (2026-10-28)
1. [x] Catálogo con 10 categorías (derivadas del contenido real del canal) + filtros por objetivo/nivel/duración/equipo.
2. [x] Reproductor (YouTube en modo nocookie) con estados de carga/error/offline y reintento.
3. [x] Completados, favoritos e historial de sesiones en Dexie (DB v2).
4. [x] Contenido con videos/textos propios del proyecto (canal del propietario); nada propietario de terceros.
1. Catálogo con las 10 categorías del §5.F; filtros por objetivo/nivel/duración/equipo.
2. Reproductor (YouTube propio + origen configurable) con estados de carga/error/offline.
3. Completados, favoritos e historial de sesiones en Dexie.
4. Contenido con videos/textos propios del proyecto; nada propietario de terceros.

### FASE 5 — Nutrición y recetas — complejidad XL ✅ (2026-10-28)
1. [x] Catálogo estructurado original (6 categorías) con los campos del §5.D:
   macros por porción, alérgenos, objetivos compatibles, sustituciones,
   conservación (ingredientes embebidos; la normalización FoodIngredient/RecipeIngredient
   queda diferida a la FASE 9, que la necesita para la lista de compras).
2. [x] Motor de reglas determinista: **nunca sugiere alérgenos declarados (prueba obligatoria en verde)**.
3. [x] Filtro por ingrediente ("¿qué tenés en casa?"), exclusión de alimentos,
   ajuste de porciones con recálculo de cantidades y macros.
4. [x] Favoritos (⭐, reutiliza favoritos genéricos) y "preparadas" (RecipePreparation, DB v3).
   [ ] Plan semanal básico + lista de compras → FASE 9 (pantalla dedicada).
5. [x] Fuentes documentadas: valores aproximados elaborados con tablas de
   dominio público (USDA FoodData Central), atribución visible en UI y código.
1. Catálogo estructurado original (6 categorías) con todos los campos del §5.D.
2. Motor de reglas determinista: nunca sugiere alérgenos declarados (prueba obligatoria).
3. Filtro por ingredientes, exclusión de alimentos, ajuste de porciones con recálculo.
4. Favoritos, preparadas, plan semanal básico y lista de compras consolidada.
5. Fuentes de datos nutricionales con licencia adecuada (atribución documentada).

### FASE 6 — PDF — complejidad M
1. PDF A4 de receta individual con logo, tabla nutricional, fecha, nota de valores
   aproximados y **marca de agua TOTALHIIT semitransparente en todas las páginas**.
2. Guardar/compartir OK en Android y Safari/iOS (probado en dispositivos reales).
3. PDF de plan semanal (FASE 9) reutiliza el mismo servicio.
4. Pruebas automatizadas de generación + verificación visual manual documentada.

### FASE 7 — Progreso y sueño — complejidad M
1. Registros voluntarios (entrenamientos, peso, recetas, sueño, hidratación, notas).
2. Gráficos de tendencia + calendario de actividad + resúmenes semanales.
3. Dashboard (módulo A) personalizado con recomendaciones del motor (sin IA).
4. Sin puntuaciones culpabilizantes ni afirmaciones médicas.

### FASE 8 — Seguimiento menstrual — complejidad L (privacidad estricta)
1. Consentimiento explícito antes de ver cualquier pantalla del módulo.
2. Calendario mensual, registro/edición/borrado, historial, síntomas opcionales, notas.
3. Estimaciones con **incertidumbre visible**; manejo de ciclos irregulares y datos insuficientes.
4. Cifrado local de los campos íntimos; exportación y borrado definitivo.
5. Pruebas de privacidad: nada de este módulo aparece en logs, exportaciones genéricas ni telemetría.

### FASE 9 — Menús semanales — complejidad M
1. Planificador semanal desde el motor (usa catálogo + preferencias).
2. Lista de compras consolidada por semana.
3. Recomendaciones y exportación PDF del plan (marca de agua incluida).

### FASE 10 — Identidad, sync y premium — complejidad XL
1. Comparación documentada Cloudflare Workers+D1(+R2) vs Supabase (límites gratis
   verificados, auth, base relacional, almacenamiento, protección de videos, sync).
2. Autenticación segura + roles (usuario/admin separados); validación de permisos en servidor.
3. Entitlements premium (nunca solo botones ocultos); menstrual básico y exportación SIEMPRE gratis.
4. Evaluación de amenazas para datos íntimos sincronizados ANTES del lanzamiento.
5. Sin pasarela de pagos hasta decisión del propietario.

### FASE 11 — Distribución — complejidad L
1. APK firmado (keystore del propietario), versionado, build reproducible, probado en Android real.
2. PWA desplegada en hosting HTTPS gratuito verificado; instalable en iPhone real.
3. Estrategia de actualizaciones documentada (PWA autoUpdate; APK con numero de versión).
4. Instrucciones de instalación fuera de Google Play; vínculo preparado desde la web
   (sin modificarla todavía).
5. Pruebas finales offline/reconexión y accesibilidad básica.

### FASE 12 — Evolución — complejidad XL (post-MVP)
IA opcional (con validación y sin claves en cliente), panel admin, contenido
premium ampliado, nuevas métricas, accesibilidad e internacionalización (es → en).

## Riesgos principales (matriz FASE 0)

| Riesgo | Fase | Mitigación |
|---|---|---|
| Datos íntimos expuestos (IndexedDB sin cifrar) | 8 | Cifrado AES-GCM + consentimiento + borrado fácil |
| Safari/iOS desaloja almacenamiento de PWAs poco usadas | 8/11 | Exportación fácil + aviso; backup opcional futuro |
| Contenido de salud mal interpretado | 3/5/7/8 | Avisos obligatorios, sin diagnósticos, adulto 18+ |
| Motor sugiere alérgeno | 5 | Regla dura + pruebas automáticas obligatorias |
| TS 7 incompatible con alguna librería | 1+ | Fallback documentado a 5.9 (hoy no hizo falta) |
| Videos YouTube no listados no son "privados" | 4/10 | No prometer protección; premium vía entitlements de servidor |
| APK sideload asusta al usuario | 11 | Guía clara + firma estable para actualizaciones sin reinstalar |
| Servicios "gratis" con límites no comerciales | 10/11 | Verificar TOS antes de usar; alternativas documentadas |
