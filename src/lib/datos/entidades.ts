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
export type NivelActividad = (typeof nivelesActividad)[number];
export type NivelExperiencia = (typeof nivelesExperiencia)[number];
export type Equipamiento = (typeof equipamientos)[number];

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

export const TIPOS_FAVORITO = ['sesion', 'receta'] as const;

export const workoutSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workoutId: z.string(),
  fecha: fechaIso,
  duracionRealMin: z.number().int().min(5).max(180).optional(),
  completado: z.boolean().default(true),
  notas: z.string().max(300).optional(),
});

export const favoritoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tipo: z.enum(TIPOS_FAVORITO),
  refId: z.string().min(1),
  createdAt: z.number().int().positive(),
});
export type Favorito = z.infer<typeof favoritoSchema>;
export type TipoFavorito = (typeof TIPOS_FAVORITO)[number];

export const recipePreparationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recetaId: z.string().min(1),
  fecha: fechaIso,
  porciones: z.number().int().min(1).max(12),
  createdAt: z.number().int().positive(),
});

/** FASE 7 — Registro diario voluntario. Todo el contenido es opcional y editable. */export const entradaDiarioSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fecha: fechaIso,
  pesoKg: z.number().min(25, 'Peso fuera de rango plausible').max(400, 'Peso fuera de rango plausible').optional(),
  energiaNivel: z.number().int().min(1).max(5).optional(),
  animoNivel: z.number().int().min(1).max(5).optional(),
  horasSueno: z.number().min(0, 'Entre 0 y 16 horas').max(16, 'Entre 0 y 16 horas').optional(),
  calidadSueno: z.number().int().min(1).max(5).optional(),
  vasosAgua: z.number().int().min(0).max(24).optional(),
  notas: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type EntradaDiario = z.infer<typeof entradaDiarioSchema>;
/** Campos que la usuaria puede cargar en el registro diario (todo opcional). */
export type DatosDiarios = Partial<
  Omit<EntradaDiario, 'id' | 'userId' | 'fecha' | 'createdAt' | 'updatedAt'>
>;

/**
 * FASE 8 — Ciclo menstrual (privacidad estricta).
 * El payload íntimo (flujo, síntomas, notas) NUNCA se guarda en claro: el
 * registro persistido solo tiene metadatos + `datosCifrados` (AES-GCM, D19).
 */
export const FLUJOS_CICLO = ['manchado', 'ligero', 'medio', 'abundante'] as const;
export type FlujoCiclo = (typeof FLUJOS_CICLO)[number];

export const ETIQUETAS_FLUJO: Record<FlujoCiclo, string> = {
  manchado: 'Manchado leve',
  ligero: 'Ligero',
  medio: 'Medio',
  abundante: 'Abundante',
};

export const SINTOMAS_CICLO = [
  'cólicos',
  'dolor de cabeza',
  'hinchazón',
  'cambios de ánimo',
  'antojos',
  'acné',
  'cansancio',
  'dolor de espalda',
  'sensibilidad en el pecho',
] as const;

export const datosCicloSchema = z.object({
  flujo: z.enum(FLUJOS_CICLO),
  sintomas: z.array(z.string().trim().min(1).max(40)).default([]),
  notas: z.string().trim().max(500).optional(),
});
export type DatosCiclo = z.infer<typeof datosCicloSchema>;

export const cicloRegistroSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fecha: fechaIso,
  datosCifrados: z.string().min(8),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type CicloRegistro = z.infer<typeof cicloRegistroSchema>;

export const consentRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  modulo: z.enum(consentModulos),
  version: z.string(),
  otorgado: z.number(),
  revocado: z.number().nullish(),
});
export type ConsentRecord = z.infer<typeof consentRecordSchema>;
export type WorkoutSession = z.infer<typeof workoutSessionSchema>;
export type RecipePreparation = z.infer<typeof recipePreparationSchema>;

/** Versión actual de cada consentimiento (bump al cambiar el texto legal). */
export const VERSIONES_CONSENTIMIENTO: Record<ModuloConsentimiento, string> = {
  perfil: 'v1',
  salud_general: 'v1',
  menstrual: 'v1',
};
