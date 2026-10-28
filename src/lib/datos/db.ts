import Dexie, { type EntityTable } from 'dexie';
import type { ConsentRecord, NutritionPreferences, UserGoal, UserProfile } from './entidades';

export const NOMBRE_DB = 'totalhiit-app';

export const db = new Dexie(NOMBRE_DB) as Dexie & {
  perfiles: EntityTable<UserProfile, 'id'>;
  objetivos: EntityTable<UserGoal, 'id'>;
  preferencias: EntityTable<NutritionPreferences, 'id'>;
  consentimientos: EntityTable<ConsentRecord, 'id'>;
};

db.version(1).stores({
  perfiles: 'id, createdAt',
  objetivos: 'id, userId, [userId+activo]',
  preferencias: 'id, userId',
  consentimientos: 'id, userId, [userId+modulo]',
});
