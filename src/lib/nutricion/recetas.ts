/**
 * FASE 5 — Catálogo de recetas (contenido original del proyecto).
 * 6 categorías: desayuno, almuerzo, cena, snack, bebida, postre.
 * Macros por porción: valores APROXIMADOS elaborados a partir de tablas de
 * composición de alimentos de dominio público (USDA FoodData Central) y
 * redondeados con criterio casero. No son precisión clínica (ver aviso en UI).
 * El catálogo es contenido de la app, no datos del usuario.
 */

import { z } from 'zod';
import { OBJETIVOS, presupuestos } from '../datos/entidades';

export const CATEGORIAS_RECETA = ['desayuno', 'almuerzo', 'cena', 'snack', 'bebida', 'postre'] as const;
export type CategoriaReceta = (typeof CATEGORIAS_RECETA)[number];

export const ETIQUETAS_CATEGORIA_RECETA: Record<CategoriaReceta, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  snack: 'Snack',
  bebida: 'Bebida',
  postre: 'Postre',
};

export const ICONO_CATEGORIA_RECETA: Record<CategoriaReceta, string> = {
  desayuno: '☀️',
  almuerzo: '🍽️',
  cena: '🌙',
  snack: '🍎',
  bebida: '🥤',
  postre: '🍓',
};

export const ingredienteSchema = z.object({
  nombre: z.string().min(1).max(60),
  cantidad: z.number().positive().nullable(),
  unidad: z.string().min(1).max(20),
});

export const recetaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1).max(80),
  categoria: z.enum(CATEGORIAS_RECETA),
  descripcion: z.string().min(1).max(300),
  tiempoMin: z.number().int().min(1).max(180),
  porcionesBase: z.number().int().min(1).max(8),
  presupuesto: z.enum(presupuestos),
  alergenos: z.array(z.string().min(1).max(40)),
  objetivosCompatibles: z.array(z.enum(OBJETIVOS)).min(1),
  macrosPorPorcion: z.object({
    kcal: z.number().int().min(0).max(1500),
    proteinaG: z.number().min(0).max(120),
    carbohidratosG: z.number().min(0).max(200),
    grasasG: z.number().min(0).max(120),
    fibraG: z.number().min(0).max(60),
  }),
  ingredientes: z.array(ingredienteSchema).min(3).max(12),
  pasos: z.array(z.string().min(1).max(300)).min(2).max(10),
  sustituciones: z.string().max(300).optional(),
  conservacion: z.string().max(200).optional(),
});

export type Receta = z.infer<typeof recetaSchema>;
export type Ingrediente = z.infer<typeof ingredienteSchema>;
export type PresupuestoReceta = Receta['presupuesto'];

export const CATALOGO_RECETAS: Receta[] = [
  {
    id: 'r1',
    nombre: 'Avena nocturna con frutos rojos',
    categoria: 'desayuno',
    descripcion: 'Se prepara la noche anterior: desayuno listo, con fibra y proteína para arrancar con energía.',
    tiempoMin: 10,
    porcionesBase: 1,
    presupuesto: 'bajo',
    alergenos: ['Gluten (trigo)', 'Lactosa'],
    objetivosCompatibles: ['perder_grasa', 'mantenimiento', 'bienestar'],
    macrosPorPorcion: { kcal: 310, proteinaG: 16, carbohidratosG: 45, grasasG: 8, fibraG: 7 },
    ingredientes: [
      { nombre: 'Avena en hojuelas', cantidad: 40, unidad: 'g' },
      { nombre: 'Yogur natural', cantidad: 100, unidad: 'g' },
      { nombre: 'Leche (o vegetal)', cantidad: 80, unidad: 'ml' },
      { nombre: 'Semillas de chía', cantidad: 5, unidad: 'g' },
      { nombre: 'Frutos rojos', cantidad: 80, unidad: 'g' },
    ],
    pasos: [
      'Mezclá avena, chía, yogur y leche en un frasco con tapa.',
      'Refrigerá la noche anterior (mínimo 6 horas).',
      'Antes de comer, sumá los frutos rojos y mezclá.',
    ],
    sustituciones: 'Yogur sin lactosa o bebida vegetal sin azúcar funcionan igual de bien.',
    conservacion: 'Hasta 24 h refrigerada.',
  },
  {
    id: 'r2',
    nombre: 'Omelette de espinaca y queso',
    categoria: 'desayuno',
    descripcion: 'Proteína de calidad en 10 minutos, ideal después del entrenamiento de la mañana.',
    tiempoMin: 10,
    porcionesBase: 1,
    presupuesto: 'bajo',
    alergenos: ['Huevo', 'Lactosa'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'perder_grasa'],
    macrosPorPorcion: { kcal: 280, proteinaG: 21, carbohidratosG: 4, grasasG: 20, fibraG: 2 },
    ingredientes: [
      { nombre: 'Huevos', cantidad: 3, unidad: 'unidades' },
      { nombre: 'Espinaca fresca', cantidad: 60, unidad: 'g' },
      { nombre: 'Queso rallado', cantidad: 20, unidad: 'g' },
      { nombre: 'Aceite de oliva', cantidad: 5, unidad: 'ml' },
      { nombre: 'Sal y pimienta', cantidad: null, unidad: 'a gusto' },
    ],
    pasos: [
      'Batí los huevos con sal y pimienta.',
      'Salteá la espinaca 1 minuto en aceite a fuego medio.',
      'Volcá los huevos, cociná 3 minutos y agregá el queso.',
      'Doblá a la mitad y serví.',
    ],
    sustituciones: 'El queso puede reemplazarse por levadura nutricional (sin lactosa).',
  },
  {
    id: 'r3',
    nombre: 'Smoothie verde de espinaca y banana',
    categoria: 'bebida',
    descripcion: 'Minerales y fibra en 5 minutos. Perfecta para hidratar y recargar después de entrenar.',
    tiempoMin: 5,
    porcionesBase: 1,
    presupuesto: 'bajo',
    alergenos: [],
    objetivosCompatibles: ['bienestar', 'descanso', 'mantenimiento'],
    macrosPorPorcion: { kcal: 180, proteinaG: 5, carbohidratosG: 38, grasasG: 2, fibraG: 5 },
    ingredientes: [
      { nombre: 'Espinaca fresca', cantidad: 50, unidad: 'g' },
      { nombre: 'Banana', cantidad: 1, unidad: 'unidad' },
      { nombre: 'Agua (o leche vegetal)', cantidad: 200, unidad: 'ml' },
      { nombre: 'Semillas de chía', cantidad: 5, unidad: 'g' },
      { nombre: 'Jugo de limón', cantidad: 5, unidad: 'ml' },
    ],
    pasos: [
      'Lavá la espinaca y pelá la banana.',
      'Licuá todo 40 segundos hasta que quede homogéneo.',
      'Tomala fresca, apenas la prepare.',
    ],
    sustituciones: 'La banana puede reemplazarse por pera o mango.',
  },
  {
    id: 'r4',
    nombre: 'Ensalada de lentejas y atún',
    categoria: 'almuerzo',
    descripcion: 'Almuerzo completo con proteína y fibra: sostiene la energía toda la tarde sin kitchen pesado.',
    tiempoMin: 15,
    porcionesBase: 2,
    presupuesto: 'bajo',
    alergenos: ['Pescado'],
    objetivosCompatibles: ['perder_grasa', 'recomposicion', 'mantenimiento'],
    macrosPorPorcion: { kcal: 360, proteinaG: 26, carbohidratosG: 32, grasasG: 10, fibraG: 9 },
    ingredientes: [
      { nombre: 'Lentejas cocidas', cantidad: 240, unidad: 'g' },
      { nombre: 'Atún al natural (lata)', cantidad: 120, unidad: 'g' },
      { nombre: 'Tomate', cantidad: 1, unidad: 'unidad' },
      { nombre: 'Cebolla', cantidad: 0.5, unidad: 'unidad' },
      { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml' },
      { nombre: 'Jugo de limón', cantidad: 10, unidad: 'ml' },
    ],
    pasos: [
      'Enjuagá las lentejas y el atún escurrido.',
      'Picá tomate y cebolla en cubos chicos.',
      'Mezclá todo con aceite, limón, sal y pimienta.',
    ],
    conservacion: 'Hasta 48 h refrigerada (aliñá al momento de servir).',
  },
  {
    id: 'r5',
    nombre: 'Pollo al horno con verduras',
    categoria: 'cena',
    descripcion: 'Una bandeja, una hora de horno: cena proteica con vegetales listos para la semana.',
    tiempoMin: 45,
    porcionesBase: 4,
    presupuesto: 'medio',
    alergenos: [],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'perder_grasa'],
    macrosPorPorcion: { kcal: 390, proteinaG: 34, carbohidratosG: 22, grasasG: 16, fibraG: 5 },
    ingredientes: [
      { nombre: 'Pechuga de pollo', cantidad: 600, unidad: 'g' },
      { nombre: 'Batata', cantidad: 400, unidad: 'g' },
      { nombre: 'Zanahoria', cantidad: 200, unidad: 'g' },
      { nombre: 'Zucchini', cantidad: 200, unidad: 'g' },
      { nombre: 'Aceite de oliva', cantidad: 20, unidad: 'ml' },
      { nombre: 'Pimentón y orégano', cantidad: null, unidad: 'a gusto' },
    ],
    pasos: [
      'Precalentá el horno a 200 °C.',
      'Cortá las verduras en trozos y la pechuga en porciones.',
      'Mezclá todo con aceite y condimentos en la bandeja.',
      'Horneá 35–40 minutos, dando vuelta a mitad de cocción.',
    ],
    conservacion: 'Hasta 3 días refrigerado; ideal para meal prep.',
  },
  {
    id: 'r6',
    nombre: 'Wok de ternera con brócoli',
    categoria: 'cena',
    descripcion: 'Cena rápida de sartén con hierro y vitamina C: poca grasa, mucha saciedad.',
    tiempoMin: 25,
    porcionesBase: 2,
    presupuesto: 'medio',
    alergenos: ['Soja'],
    objetivosCompatibles: ['masa_muscular', 'recomposicion', 'perder_grasa'],
    macrosPorPorcion: { kcal: 400, proteinaG: 32, carbohidratosG: 24, grasasG: 18, fibraG: 6 },
    ingredientes: [
      { nombre: 'Ternera en tiras', cantidad: 350, unidad: 'g' },
      { nombre: 'Brócoli', cantidad: 300, unidad: 'g' },
      { nombre: 'Zanahoria', cantidad: 100, unidad: 'g' },
      { nombre: 'Salsa de soja', cantidad: 20, unidad: 'ml' },
      { nombre: 'Ajo', cantidad: 2, unidad: 'dientes' },
      { nombre: 'Aceite', cantidad: 10, unidad: 'ml' },
    ],
    pasos: [
      'Sellá la ternera en el wok bien caliente, 2 minutos, y reservá.',
      'Salteá brócoli y zanahoria con ajo 4 minutos.',
      'Volvé la ternera, sumá la soja y cociná 2 minutos más.',
    ],
    sustituciones: 'Salsa de soja sin gluten si sos celíaca.',
  },
  {
    id: 'r7',
    nombre: 'Merluza al horno con limón',
    categoria: 'cena',
    descripcion: 'Pescado blanco liviano: proteína magra con omega para el corazón, sin olores fuertes.',
    tiempoMin: 25,
    porcionesBase: 2,
    presupuesto: 'medio',
    alergenos: ['Pescado'],
    objetivosCompatibles: ['perder_grasa', 'mantenimiento', 'bienestar'],
    macrosPorPorcion: { kcal: 260, proteinaG: 30, carbohidratosG: 6, grasasG: 12, fibraG: 2 },
    ingredientes: [
      { nombre: 'Filetes de merluza', cantidad: 400, unidad: 'g' },
      { nombre: 'Limón', cantidad: 1, unidad: 'unidad' },
      { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml' },
      { nombre: 'Perejil picado', cantidad: 5, unidad: 'g' },
      { nombre: 'Sal y pimienta', cantidad: null, unidad: 'a gusto' },
    ],
    pasos: [
      'Precalentá el horno a 200 °C.',
      'Ubicá los filetes en una fuente con aceite, limón, perejil, sal y pimienta.',
      'Horneá 12–15 minutos según el espesor.',
    ],
    sustituciones: 'Otro pescado blanco magro (lenguado, abadejo) funciona igual.',
  },
  {
    id: 'r8',
    nombre: 'Guiso de garbanzos con verduras',
    categoria: 'almuerzo',
    descripcion: 'Olla única, fibra y proteína vegetal: rinde varias porciones para toda la semana.',
    tiempoMin: 40,
    porcionesBase: 4,
    presupuesto: 'bajo',
    alergenos: [],
    objetivosCompatibles: ['mantenimiento', 'bienestar', 'resistencia'],
    macrosPorPorcion: { kcal: 350, proteinaG: 16, carbohidratosG: 48, grasasG: 9, fibraG: 12 },
    ingredientes: [
      { nombre: 'Garbanzos cocidos', cantidad: 480, unidad: 'g' },
      { nombre: 'Zanahoria', cantidad: 150, unidad: 'g' },
      { nombre: 'Cebolla', cantidad: 1, unidad: 'unidad' },
      { nombre: 'Tomate triturado', cantidad: 200, unidad: 'g' },
      { nombre: 'Pimentón dulce', cantidad: null, unidad: 'a gusto' },
      { nombre: 'Aceite de oliva', cantidad: 15, unidad: 'ml' },
    ],
    pasos: [
      'Sofreí cebolla y zanahoria en el aceite, 5 minutos.',
      'Sumá tomate, garbanzos y agua hasta cubrir.',
      'Cociná a fuego bajo 25 minutos con pimentón y sal.',
    ],
    conservacion: 'Hasta 4 días refrigerado; congela perfecto.',
  },
  {
    id: 'r9',
    nombre: 'Yogur con chía y fruta',
    categoria: 'snack',
    descripcion: 'Snack de 5 minutos con proteína y calcio, aliado de la salud ósea a los +40.',
    tiempoMin: 5,
    porcionesBase: 1,
    presupuesto: 'bajo',
    alergenos: ['Lactosa'],
    objetivosCompatibles: ['mantenimiento', 'bienestar', 'descanso'],
    macrosPorPorcion: { kcal: 210, proteinaG: 12, carbohidratosG: 22, grasasG: 7, fibraG: 4 },
    ingredientes: [
      { nombre: 'Yogur natural', cantidad: 150, unidad: 'g' },
      { nombre: 'Semillas de chía', cantidad: 10, unidad: 'g' },
      { nombre: 'Fruta de estación', cantidad: 100, unidad: 'g' },
    ],
    pasos: [
      'Mezclá el yogur con la chía y dejá reposar 5 minutos.',
      'Sumá la fruta cortada arriba.',
    ],
    sustituciones: 'Yogur de soja sin azúcar para versión sin lactosa.',
  },
  {
    id: 'r10',
    nombre: 'Mix de frutos secos y fruta',
    categoria: 'snack',
    descripcion: 'Energía portátil para la tarde: grasas buenas que cuidan el corazón.',
    tiempoMin: 2,
    porcionesBase: 1,
    presupuesto: 'medio',
    alergenos: ['Nueces y frutos secos'],
    objetivosCompatibles: ['mantenimiento', 'resistencia', 'bienestar'],
    macrosPorPorcion: { kcal: 240, proteinaG: 7, carbohidratosG: 18, grasasG: 16, fibraG: 4 },
    ingredientes: [
      { nombre: 'Nueces', cantidad: 25, unidad: 'g' },
      { nombre: 'Almendras', cantidad: 15, unidad: 'g' },
      { nombre: 'Manzana', cantidad: 1, unidad: 'unidad' },
    ],
    pasos: ['Porcioná los frutos secos (¡son calorías concentradas!).', 'Lavá la manzana y acompañá con el mix.'],
    conservacion: 'Los frutos secos: frasco hermético, hasta 1 mes.',
  },
  {
    id: 'r11',
    nombre: 'Tortilla de papa ligera',
    categoria: 'cena',
    descripcion: 'La clásica en versión al horno: menos aceite, mismo sabor de casa.',
    tiempoMin: 35,
    porcionesBase: 2,
    presupuesto: 'bajo',
    alergenos: ['Huevo'],
    objetivosCompatibles: ['mantenimiento', 'recomposicion', 'resistencia'],
    macrosPorPorcion: { kcal: 320, proteinaG: 18, carbohidratosG: 30, grasasG: 14, fibraG: 4 },
    ingredientes: [
      { nombre: 'Papa', cantidad: 300, unidad: 'g' },
      { nombre: 'Huevos', cantidad: 4, unidad: 'unidades' },
      { nombre: 'Cebolla', cantidad: 1, unidad: 'unidad' },
      { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml' },
      { nombre: 'Sal', cantidad: null, unidad: 'a gusto' },
    ],
    pasos: [
      'Cociná la papa en cubos 8 minutos en micro o vapor.',
      'Dorá la cebolla, sumá la papa y volcá los huevos batidos.',
      'Cociná 4 minutos a fuego bajo y terminá 5 minutos bajo el gratinador.',
    ],
  },
  {
    id: 'r12',
    nombre: 'Mousse de yogur y frutillas',
    categoria: 'postre',
    descripcion: 'Postre liviano con proteína: dulce sin culpa, listo en 10 minutos.',
    tiempoMin: 10,
    porcionesBase: 2,
    presupuesto: 'bajo',
    alergenos: ['Lactosa'],
    objetivosCompatibles: ['perder_grasa', 'mantenimiento', 'bienestar'],
    macrosPorPorcion: { kcal: 190, proteinaG: 11, carbohidratosG: 20, grasasG: 7, fibraG: 2 },
    ingredientes: [
      { nombre: 'Yogur natural', cantidad: 200, unidad: 'g' },
      { nombre: 'Frutillas', cantidad: 150, unidad: 'g' },
      { nombre: 'Semillas de chía', cantidad: 10, unidad: 'g' },
      { nombre: 'Miel', cantidad: 10, unidad: 'g' },
    ],
    pasos: [
      'Licuá yogur, miel y la mitad de las frutillas.',
      'Sumá la chía y llevá a la heladera 10 minutos.',
      'Serví con el resto de las frutillas cortadas.',
    ],
    sustituciones: 'Miel por edulcorante a elección; yogur sin lactosa si hace falta.',
  },
] satisfies Receta[];

export function obtenerReceta(id: string): Receta | undefined {
  return CATALOGO_RECETAS.find((r) => r.id === id);
}
