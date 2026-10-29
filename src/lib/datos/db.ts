import Dexie, { type EntityTable } from 'dexie';
import type {
  CicloRegistro,
  ConsentRecord,
  EntradaDiario,
  Favorito,
  NutritionPreferences,
  PlanSemanal,
  RecipePreparation,
  UserGoal,
  UserProfile,
  WorkoutSession,
} from './entidades';

export interface Suscriptor {
  id: string;
  email: string;
  nombre?: string;
  plan: 'mensual' | 'anual' | 'vitalicio' | 'total40';
  activo: number; // 1 | 0
  fechaAlta: string;
  notas?: string;
}

export interface AnuncioAdmin {
  id: string;
  tipo: 'promocion' | 'update' | 'aviso';
  titulo: string;
  mensaje: string;
  enlace?: string;
  activo: number; // 1 | 0
  fecha: string;
}

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
  planes: EntityTable<PlanSemanal, 'id'>;
  suscriptores: EntityTable<Suscriptor, 'id'>;
  anuncios: EntityTable<AnuncioAdmin, 'id'>;
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

/** FASE 9: planes semanales de comidas. */
db.version(6).stores({
  planes: 'id, userId, semanaInicio, [userId+semanaInicio]',
});

/** FASE 12: módulo de administración de suscriptores y anuncios del sistema. */
db.version(7).stores({
  suscriptores: 'id, email, activo',
  anuncios: 'id, tipo, activo, fecha',
});
