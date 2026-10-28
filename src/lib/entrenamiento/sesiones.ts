/**
 * FASE 4 — Catálogo de entrenamientos.
 * Contenido del canal propio del proyecto (videos de YouTube del sitio
 * TOTAL+40; ver `docs/architecture.md` §4). Se sirven en modo privado
 * (youtube-nocookie). El catálogo es contenido de la app, no datos del usuario.
 */

import { z } from 'zod';
import { nivelesExperiencia, equipamientos, OBJETIVOS, type NivelExperiencia, type Equipamiento } from '../datos/entidades';

export const CATEGORIAS_SESION = [
  'activacion',
  'fuerza',
  'core',
  'cardio',
  'hiit',
  'tonificacion',
  'tren_inferior',
  'tren_superior',
  'movilidad',
  'equilibrio',
] as const;

export type CategoriaSesion = (typeof CATEGORIAS_SESION)[number];

export const ETIQUETAS_CATEGORIA: Record<CategoriaSesion, string> = {
  activacion: 'Activación',
  fuerza: 'Fuerza',
  core: 'Core y suelo pélvico',
  cardio: 'Cardio suave',
  hiit: 'HIIT adaptado',
  tonificacion: 'Tonificación',
  tren_inferior: 'Piernas y glúteos',
  tren_superior: 'Brazos y postura',
  movilidad: 'Estiramiento y movilidad',
  equilibrio: 'Balance y coordinación',
};

export const ICONO_CATEGORIA: Record<CategoriaSesion, string> = {
  activacion: '🌱',
  fuerza: '💪',
  core: '🧘',
  cardio: '🫀',
  hiit: '🔥',
  tonificacion: '✨',
  tren_inferior: '🦵',
  tren_superior: '🙌',
  movilidad: '🤸',
  equilibrio: '⚖️',
};

export const workoutSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  categorias: z.array(z.enum(CATEGORIAS_SESION)).min(1),
  objetivosCompatibles: z.array(z.enum(OBJETIVOS)).min(1),
  nivel: z.enum(nivelesExperiencia),
  duracionMin: z.number().int().min(5).max(120),
  equipo: z.array(z.enum(equipamientos)),
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  precauciones: z.string().max(300).optional(),
});

export type Workout = z.infer<typeof workoutSchema>;

const P = 'peso_corporal' as Equipamiento;
const M = 'mancuernas' as Equipamiento;

export const CATALOGO_SESIONES: Workout[] = [
  {
    id: 'intro-1',
    titulo: 'Bienvenida a TOTAL+40',
    descripcion:
      'Conocé cómo está estructurado el programa, recomendaciones previas y cómo cuidar tus articulaciones mientras ganás fuerza.',
    categorias: ['activacion'],
    objetivosCompatibles: ['bienestar', 'mantenimiento'],
    nivel: 'principiante',
    duracionMin: 10,
    equipo: [P],
    youtubeId: 'Fnk5WgIfZog',
    precauciones: 'Mirala con calma antes de tu primera clase.',
  },
  {
    id: 'w1-c1',
    titulo: 'Activación Full Body +40',
    descripcion: 'Movilidad articular y circuitos de activación muscular suave para despertar el metabolismo.',
    categorias: ['activacion', 'movilidad'],
    objetivosCompatibles: ['bienestar', 'descanso', 'mantenimiento', 'recomposicion'],
    nivel: 'principiante',
    duracionMin: 25,
    equipo: [P],
    youtubeId: 'wVlBMg6QKqE',
    precauciones: 'Movimientos sin impacto; si algo duele, reducí el rango.',
  },
  {
    id: 'w1-c2',
    titulo: 'Fuerza y Estabilidad Central (Core)',
    descripcion: 'Fortalecimiento de suelo pélvico, abdomen y espalda baja.',
    categorias: ['core', 'fuerza'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'bienestar', 'mantenimiento'],
    nivel: 'principiante',
    duracionMin: 28,
    equipo: [P],
    youtubeId: 'f2QcIBb-hR4',
    precauciones: 'Activa el suelo pélvico antes de cada serie; exhalá en el esfuerzo.',
  },
  {
    id: 'w1-c3',
    titulo: 'Intervalos Cardio-Metabólicos Suaves',
    descripcion: 'Quema de calorías y estimulación aeróbica sin saltos.',
    categorias: ['cardio'],
    objetivosCompatibles: ['perder_grasa', 'resistencia', 'recomposicion'],
    nivel: 'principiante',
    duracionMin: 25,
    equipo: [P],
    youtubeId: 'yClvb1a2BmQ',
    precauciones: 'Sin saltos: cuidá rodillas y suelo pélvico.',
  },
  {
    id: 'w2-c4',
    titulo: 'Fuerza Tren Inferior (Piernas y Glúteos)',
    descripcion: 'Fuerza funcional para rodillas, caderas y glúteos firmes.',
    categorias: ['fuerza', 'tren_inferior'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'perder_grasa'],
    nivel: 'principiante',
    duracionMin: 30,
    equipo: [M],
    youtubeId: 'W-gHxh9cc9A',
    precauciones: 'Rodillas alineadas con la punta del pie; empezá con peso liviano.',
  },
  {
    id: 'w2-c5',
    titulo: 'Tren Superior y Postura',
    descripcion: 'Brazos, hombros y espalda para mejorar postura y tonicidad.',
    categorias: ['fuerza', 'tren_superior'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'bienestar'],
    nivel: 'principiante',
    duracionMin: 26,
    equipo: [M],
    youtubeId: 'pZVpFu94J6M',
    precauciones: 'Hombros lejos de las orejas; escapulas activas.',
  },
  {
    id: 'w2-c6',
    titulo: 'HIIT Adaptado y Resistencia',
    descripcion: 'Intervalos diseñados para activar el metabolismo sin agotar tus articulaciones.',
    categorias: ['hiit', 'cardio'],
    objetivosCompatibles: ['perder_grasa', 'resistencia', 'recomposicion'],
    nivel: 'intermedio',
    duracionMin: 28,
    equipo: [P],
    youtubeId: 'tdoob2mOpaw',
    precauciones: 'Versiones sin salto en cada intervalo si necesitás menos impacto.',
  },
  {
    id: 'w3-c7',
    titulo: 'Potencia y Circuito Funcional',
    descripcion: 'Combinación dinámica de fuerza y coordinación para mujeres activas.',
    categorias: ['fuerza', 'tonificacion', 'equilibrio'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'resistencia'],
    nivel: 'intermedio',
    duracionMin: 30,
    equipo: [M],
    youtubeId: 'ARs5oAGVW8c',
    precauciones: 'Priorizá la técnica antes de la velocidad.',
  },
  {
    id: 'w3-c8',
    titulo: 'TOTAL+40 Tonificación Integral',
    descripcion: 'Clase completa de escultura corporal y resistencia muscular.',
    categorias: ['tonificacion', 'fuerza'],
    objetivosCompatibles: ['recomposicion', 'masa_muscular', 'perder_grasa'],
    nivel: 'intermedio',
    duracionMin: 32,
    equipo: [M],
    youtubeId: 'BXN4CRqOfdM',
    precauciones: 'Hidrata antes y durante la clase.',
  },
  {
    id: 'w3-c9',
    titulo: 'Core Dinámico y Balance',
    descripcion: 'Control corporal, equilibrio y fuerza en la zona media.',
    categorias: ['equilibrio', 'core'],
    objetivosCompatibles: ['bienestar', 'descanso', 'resistencia'],
    nivel: 'intermedio',
    duracionMin: 27,
    equipo: [P],
    youtubeId: 'clWk36HDB50',
    precauciones: 'Apoiá una mano en la pared si perdés estabilidad.',
  },
  {
    id: 'w4-c10',
    titulo: 'Total Body HIIT de Cierre',
    descripcion: 'Rutina completa de cuerpo entero para sellar tu energía.',
    categorias: ['hiit', 'tonificacion'],
    objetivosCompatibles: ['perder_grasa', 'resistencia', 'recomposicion'],
    nivel: 'intermedio',
    duracionMin: 32,
    equipo: [P],
    youtubeId: 'OnuA4Y7DKaQ',
    precauciones: 'Bajá el ritmo en el descanso entre bloques.',
  },
  {
    id: 'w4-c11',
    titulo: 'Fuerza y Definición Funcional',
    descripcion: 'Último circuito de sobrecarga progresiva y resistencia.',
    categorias: ['fuerza', 'tren_inferior', 'tren_superior'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'perder_grasa'],
    nivel: 'intermedio',
    duracionMin: 30,
    equipo: [M],
    youtubeId: 'YPNEUd873wQ',
    precauciones: 'Aumentá el peso solo cuando domines el movimiento completo.',
  },
  {
    id: 'w4-c12',
    titulo: 'Gran Final TOTAL+40',
    descripcion: 'La sesión culminante que marca el inicio de tu nuevo estilo de vida.',
    categorias: ['hiit', 'cardio', 'tonificacion'],
    objetivosCompatibles: ['perder_grasa', 'resistencia', 'recomposicion', 'mantenimiento'],
    nivel: 'intermedio',
    duracionMin: 35,
    equipo: [P],
    youtubeId: 'rsmPFHrQIpg',
    precauciones: 'Celebrá tu progreso: ajustá intensidad, no la arranques fría.',
  },
  {
    id: 'stretch-1',
    titulo: 'Estiramiento y Flexibilidad +40',
    descripcion: 'Alivio de tensiones en espalda, cadera y cuello. Ideal para días de descanso o post-entreno.',
    categorias: ['movilidad'],
    objetivosCompatibles: ['descanso', 'bienestar', 'mantenimiento'],
    nivel: 'principiante',
    duracionMin: 18,
    equipo: [P],
    youtubeId: 'Ga89sFd3CRo',
    precauciones: 'Estirá hasta tensión cómoda, nunca dolor.',
  },
  {
    id: 'stretch-2',
    titulo: 'Movilidad Articular y Relajación Guiada',
    descripcion: 'Mejorá el rango de movimiento, cuidá tus ligamentos y reducí el estrés acumulado.',
    categorias: ['movilidad', 'activacion'],
    objetivosCompatibles: ['descanso', 'bienestar', 'mantenimiento'],
    nivel: 'principiante',
    duracionMin: 15,
    equipo: [P],
    youtubeId: 'Ag41JO-rJj4',
    precauciones: 'Respirá profundo durante todo el recorrido.',
  },
] satisfies Workout[];

export function obtenerSesion(id: string): Workout | undefined {
  return CATALOGO_SESIONES.find((s) => s.id === id);
}

export const ETIQUETAS_NIVEL_SESION: Record<NivelExperiencia, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
