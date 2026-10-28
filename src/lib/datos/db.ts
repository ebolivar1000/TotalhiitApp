import Dexie, { type EntityTable } from 'dexie';
import type {
  CicloRegistro,
  ConsentRecord,
  EntradaDiario,
  Favorito,
  NutritionPreferences,
  RecipePreparation,
  UserGoal,
  UserProfile,
  WorkoutSession,
} from './entidades';

export const NOMBRE_DB = 'totalhiit-app';

export const db = new Dexie(NOMBRE_DB) as Dexie & {
  perfiles: EntityTable<UserProfile, 'id'>;
  objetivos: EntityTable<UserGoal, 'id'>;
  preferencias: EntityTable<NutritionPreferences, 'id'>;
  consentimientos: EntityTable<ConsentRecord, 'id'>;
  sesiones: EntityTable<WorkoutSession, 'id'>;
  favoritos: EntityTable<Favorito, 'id'>;
  preparaciones: EntityTable<RecipePreparation, 'id'>;
  entradasDiario: EntityTable<EntradaDiario, 'id'>;
  ciclo: EntityTable<CicloRegistro, 'id'>;
};

db.version(1).stores({
  perfiles: 'id, createdAt',
  objetivos: 'id, userId, [userId+activo]',
  preferencias: 'id, userId',
  consentimientos: 'id, userId, [userId+modulo]',
});

/** FASE 4: entrenamientos realizados y favoritos genéricos (sesiones/recetas). */
db.version(2).stores({
  sesiones: 'id, userId, workoutId, fecha',
  favoritos: 'id, userId, [userId+tipo]',
});

/** FASE 5: recetas preparadas. */
db.version(3).stores({
  preparaciones: 'id, userId, recetaId, fecha',
});

/** FASE 7: registro diario voluntario (peso, energía, ánimo, sueño, agua, notas). */
db.version(4).stores({
  entradasDiario: 'id, userId, fecha, [userId+fecha]',
});

/** FASE 8: ciclo menstrual — SOLO metadatos + payload cifrado (nunca en claro). */
db.version(5).stores({
  ciclo: 'id, userId, fecha, [userId+fecha]',
});
