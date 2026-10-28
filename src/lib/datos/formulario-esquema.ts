import { z } from 'zod';
import { OBJETIVOS, nutritionPreferencesSchema, userProfileSchema } from './entidades';

/**
 * Esquema único del formulario de perfil (onboarding y edición).
 * A diferencia de los esquemas de almacenamiento, acá los arrays son
 * requeridos (los valores iniciales los provee el formulario).
 */
export const esquemaPerfilFormulario = z.object({
  alias: userProfileSchema.shape.alias,
  fechaNacimiento: userProfileSchema.shape.fechaNacimiento,
  pesoKg: userProfileSchema.shape.pesoKg,
  estaturaCm: userProfileSchema.shape.estaturaCm,
  genero: userProfileSchema.shape.genero,
  nivelActividad: userProfileSchema.shape.nivelActividad,
  experiencia: userProfileSchema.shape.experiencia,
  equipamiento: z.array(userProfileSchema.shape.equipamiento.unwrap().element),
  paisRegion: userProfileSchema.shape.paisRegion,
  tipo: z.enum(OBJETIVOS, { message: 'Elegí un objetivo para personalizar la app' }),
  alergenos: nutritionPreferencesSchema.shape.alergenos,
  exclusiones: nutritionPreferencesSchema.shape.exclusiones,
  tiempoCocinaMaxMin: nutritionPreferencesSchema.shape.tiempoCocinaMaxMin,
  presupuesto: nutritionPreferencesSchema.shape.presupuesto,
  porcionesHabituales: nutritionPreferencesSchema.shape.porcionesHabituales,
  acepta18: z.literal(true, { message: 'Confirmá que sos mayor de 18 años' }),
  aceptaAviso: z.literal(true, { message: 'Confirmá el aviso de salud para continuar' }),
});

export type FormPerfil = z.infer<typeof esquemaPerfilFormulario>;

export const valoresInicialesPerfil: FormPerfil = {
  alias: '',
  fechaNacimiento: '',
  pesoKg: 0,
  estaturaCm: 0,
  genero: undefined,
  nivelActividad: 'ligero',
  experiencia: 'principiante',
  equipamiento: [],
  paisRegion: '',
  tipo: undefined as unknown as FormPerfil['tipo'],
  alergenos: [],
  exclusiones: [],
  tiempoCocinaMaxMin: undefined,
  presupuesto: undefined,
  porcionesHabituales: 2,
  acepta18: false as unknown as true,
  aceptaAviso: false as unknown as true,
};
