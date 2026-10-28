import { z } from 'zod';
import { OBJETIVOS, nutritionPreferencesSchema, userProfileSchema } from './entidades';
import { edadCumplida } from '../utilidades/fechas';

/**
 * Esquema único del formulario de perfil (onboarding y edición).
 * A diferencia de los esquemas de almacenamiento, acá los arrays son
 * requeridos (los valores iniciales los provee el formulario).
 */
export const esquemaPerfilFormulario = z.object({
  alias: z.string().trim().min(1, 'Ingresa tu nombre o alias').max(40, 'Máximo 40 caracteres'),
  fechaNacimiento: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .refine((iso) => edadCumplida(iso) >= 18, 'La app es para personas de 18 años o más'),
  pesoKg: z.coerce
    .number({ message: 'Ingresa tu peso en kg' })
    .min(25, 'El peso debe ser al menos 25 kg')
    .max(400, 'El peso debe ser menor a 400 kg'),
  estaturaCm: z.coerce
    .number({ message: 'Ingresa tu estatura en cm' })
    .min(50, 'La estatura debe ser al menos 50 cm')
    .max(260, 'La estatura debe ser menor a 260 cm'),
  genero: userProfileSchema.shape.genero,
  nivelActividad: userProfileSchema.shape.nivelActividad,
  experiencia: userProfileSchema.shape.experiencia,
  equipamiento: z.array(userProfileSchema.shape.equipamiento.unwrap().element),
  paisRegion: userProfileSchema.shape.paisRegion,
  tipo: z.enum(OBJETIVOS, { message: 'Elige un objetivo para personalizar la app' }),
  alergenos: nutritionPreferencesSchema.shape.alergenos,
  exclusiones: nutritionPreferencesSchema.shape.exclusiones,
  tiempoCocinaMaxMin: nutritionPreferencesSchema.shape.tiempoCocinaMaxMin,
  presupuesto: nutritionPreferencesSchema.shape.presupuesto,
  porcionesHabituales: nutritionPreferencesSchema.shape.porcionesHabituales,
  acepta18: z.literal(true, { message: 'Confirma que eres mayor de 18 años' }),
  aceptaAviso: z.literal(true, { message: 'Confirma el aviso de salud para continuar' }),
});

export type FormPerfil = z.infer<typeof esquemaPerfilFormulario>;

export const valoresInicialesPerfil: FormPerfil = {
  alias: '',
  fechaNacimiento: '',
  pesoKg: '' as unknown as number,
  estaturaCm: '' as unknown as number,
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
