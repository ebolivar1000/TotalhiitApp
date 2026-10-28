import Dexie, { type EntityTable } from 'dexie';
import type {
  ConsentRecord,
  Favorito,
  NutritionPreferences,
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
