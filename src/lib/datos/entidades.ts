import { z } from 'zod';
import { edadCumplida } from '../utilidades/fechas';

/** Los 7 objetivos configurables del master prompt §5.B. */
export const OBJETIVOS = [
  'masa_muscular',
  'perder_grasa',
  'recomposicion',
  'mantenimiento',
  'descanso',
  'resistencia',
  'bienestar',
] as const;
export type TipoObjetivo = (typeof OBJETIVOS)[number];

export const ETIQUETAS_OBJETIVO: Record<TipoObjetivo, string> = {
  masa_muscular: 'Aumentar masa muscular',
  perder_grasa: 'Reducir grasa corporal',
  recomposicion: 'Recomposición corporal',
  mantenimiento: 'Mantener peso y condición',
  descanso: 'Mejorar descanso y sueño',
  resistencia: 'Mejorar resistencia',
  bienestar: 'Bienestar general',
};

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

export const generos = ['femenino', 'masculino', 'no_binario', 'prefiero_no_decir'] as const;
export const nivelesActividad = ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'] as const;
export const nivelesExperiencia = ['principiante', 'intermedio', 'avanzado'] as const;
export const equipamientos = ['peso_corporal', 'mancuernas', 'banda_elastica', 'colchoneta', 'gimnasio'] as const;
export const presupuestos = ['bajo', 'medio', 'alto'] as const;

export const ETIQUETAS_NIVEL_ACTIVIDAD: Record<(typeof nivelesActividad)[number], string> = {
  sedentario: 'Sedentaria (poco movimiento)',
  ligero: 'Ligera (camino un poco)',
  moderado: 'Moderada (muevo 3–4 veces por semana)',
  activo: 'Activa (muevo casi todos los días)',
  muy_activo: 'Muy activa (trabajo físico o doble sesión)',
};

export const userGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tipo: z.enum(OBJETIVOS),
  desde: fechaIso,
  hasta: fechaIso.nullish(),
  /** IndexedDB no acepta booleans como clave de índice: se guarda 1 (activo) / 0 (cerrado). */
  activo: z.union([z.literal(1), z.literal(0)]).default(1),
});
export type UserGoal = z.infer<typeof userGoalSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  alias: z.string().trim().min(1, 'Ingresá tu nombre o alias').max(40, 'Máximo 40 caracteres'),
  fechaNacimiento: fechaIso.refine(
    (iso) => edadCumplida(iso) >= 18,
    'La primera versión es solo para personas de 18 años o más',
  ),
  pesoKg: z.number().min(25, 'Peso fuera de rango plausible').max(400, 'Peso fuera de rango plausible'),
  estaturaCm: z.number().min(50, 'Estatura fuera de rango plausible').max(260, 'Estatura fuera de rango plausible'),
  genero: z.enum(generos).optional(),
  nivelActividad: z.enum(nivelesActividad),
  experiencia: z.enum(nivelesExperiencia),
  equipamiento: z.array(z.enum(equipamientos)).default([]),
  paisRegion: z.string().trim().max(60).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;
export type EntradaPerfil = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type CambiosPerfil = Partial<EntradaPerfil>;

export const nutritionPreferencesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  alergenos: z.array(z.string().trim().min(1).max(40)).default([]),
  exclusiones: z.array(z.string().trim().min(1).max(40)).default([]),
  tiempoCocinaMaxMin: z.number().int().min(5).max(240).optional(),
  presupuesto: z.enum(presupuestos).optional(),
  porcionesHabituales: z.number().int().min(1).max(12).default(2),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type NutritionPreferences = z.infer<typeof nutritionPreferencesSchema>;
export type EntradaPreferencias = Omit<NutritionPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const consentModulos = ['perfil', 'salud_general', 'menstrual'] as const;
export type ModuloConsentimiento = (typeof consentModulos)[number];

export const consentRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  modulo: z.enum(consentModulos),
  version: z.string(),
  otorgado: z.number(),
  revocado: z.number().nullish(),
});
export type ConsentRecord = z.infer<typeof consentRecordSchema>;

/** Versión actual de cada consentimiento (bump al cambiar el texto legal). */
export const VERSIONES_CONSENTIMIENTO: Record<ModuloConsentimiento, string> = {
  perfil: 'v1',
  salud_general: 'v1',
  menstrual: 'v1',
};
