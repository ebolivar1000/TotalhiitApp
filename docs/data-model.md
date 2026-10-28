# Modelo de datos — App TOTALHIIT

> Diseño FASE 0. Las entidades se implementan progresivamente por fase.
> Almacenamiento MVP: **IndexedDB vía Dexie (local-first)**, un store por entidad.
> Interfaz de repositorio abstracta en `src/lib/datos/` para migrar a backend sin tocar la UI.

## 1. Entidades y relaciones

```
UserProfile 1─┬─* UserGoal            (histórico de objetivos, con vigencia)
              ├─1 NutritionPreferences
              ├─1 ConsentRecord*
              ├─* ProgressEntry       (peso, notas de bienestar…)
              ├─* SleepEntry
              ├─* MenstrualCycle*     (opcional, dato íntimo)
              ├─* WorkoutSession      (entrenamientos realizados)
              └─* RecipePreparation   (recetas preparadas)

Recipe *─* FoodIngredient     (vía RecipeIngredient con cantidad/unidad)
MealPlan 1─* MealPlanDay 1─* MealPlanItem ─* Recipe
Workout *─* WorkoutSession
Subscription 1─1 Entitlement (fase 10, solo arquitectura)
```

## 2. Entidades (campos principales)

| Entidad | Campos clave | Sensibilidad | Fase |
|---|---|---|---|
| `UserProfile` | alias, fechaNacimiento (o edad), pesoKg, estaturaCm, género? **opcional**, variablesFisiologicas? (solo si fórmulas lo requieren, pedido aparte del género), nivelActividad, experiencia, equipamiento, paisRegion | Personal | 2 |
| `UserGoal` | tipo (7 objetivos del §5.B), desde, hasta?, activo | Personal | 2 |
| `NutritionPreferences` | alergenos[], exclusions[], tiempoCocina, presupuesto, preferenciasCulinarias[], porcionesHabituales | Personal | 2 |
| `ConsentRecord` | módulo, versión, otorgado, revocado?, fecha | Legal | 2/8 |
| `FoodIngredient` | id, nombre, categoria, kcal/100g, prot/carb/gras, alergenos[], fuenteDatos | — | 5 |
| `Recipe` | id, nombre, categoria (6 tipos), descripción, imagen?, pasos[], tiempoMin, porciones, kcal/prot/carb/gras **por porción**, alergenos[], objetivosCompatibles[], sustituciones?, conservación?, favorita | — | 5 |
| `RecipeIngredient` | recipeId, ingredientId, cantidad, unidad, sustituible? | — | 5 |
| `RecipePreparation` | recipeId, fecha, porciones | Personal | 5 |
| `MealPlan` | semana, objetivoRef, items[] | Personal | 9 |
| `Workout` | id, título, categoria[], objetivo, nivel, duracionMin, equipo[], descripción, videoId/URL, instrucciones, precauciones, premium? | — | 4 |
| `WorkoutSession` | workoutId, fecha, duracionRealMin?, completado | Personal | 4 |
| `ProgressEntry` | fecha, tipo (peso/hábito/nota), valor, nota? | Personal | 7 |
| `SleepEntry` | fecha, horasSueno, sensacionDescanso (1–5), horario habitual? | Personal | 7 |
| `MenstrualCycle` | inicio, fin?, duracionHabitualCiclo?, flujo?, notas? | **Íntimo** | 8 |
| `MenstrualSymptom` | cicloId/fecha, sintoma, intensidad? | **Íntimo** | 8 |
| `Subscription` / `Entitlement` | plan, estado, expiracion, fuente (fase 10) | Personal | 10 |

Reglas transversales:
- **Minimización**: solo se piden datos fisiológicos si una fórmula los necesita,
  y por separado de la identidad de género (master prompt §5.B/C).
- Género es opcional y **no** se usa para inferir variables fisiológicas.
- El módulo menstrual se activa por consentimiento; sus stores se marcan íntimos
  (ver `security-privacy.md`: cifrado, borrado, exportación).
- Toda fecha se guarda como `YYYY-MM-DD` local (sin timezone) + createdAt epoch.

## 3. Esquema Dexie (borrador v1)

```
DB: totalhiit-app (version 1)
  users          → id
  goals          → id, [userId+activo]
  preferences    → id
  consents       → [userId+modulo]
  recipes        → id, *categoria, *objetivos (multiEntry)
  recipe_ingredients → id, recipeId, ingredientId
  ingredients    → id, nombre
  workouts       → id, *categoria
  workout_sessions → id, fecha, [workoutId+fecha]
  progress       → id, fecha
  sleep          → id, fecha
  ciclo_…        → (FASE 8; nombre exacto y cifrado se definen ahí)
```

- Migraciones: `db.version(n).stores(...)` incremental, nunca destruir datos.
- Seeds: catálogos (recetas/ingredientes/workouts) versionados como contenido de
  la app (JSON en el bundle), no datos del usuario; actualizables por fase 12/admin.

## 4. Validaciones
- Cada entidad tiene un esquema zod compartido por formularios y repositorios.
- Validaciones razonables por campo (rangs plausibles) reutilizadas por las calculadoras.
- Pruebas unitarias por fórmula y por regla del motor (ver `docs/testing.md`).
