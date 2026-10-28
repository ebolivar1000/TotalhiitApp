/**
 * FASE 9 — Planificador semanal de comidas (sin IA).
 * Regla: cada slot usa SOLO recetas de la categoría del slot, filtradas por
 * alérgenos/exclusiones/presupuesto (reglas duras del motor) y ordenadas por
 * objetivo. La asignación es rotación determinista por día: mismas entradas →
 * mismo plan; la usuaria puede reemplazar cualquier slot a mano.
 */

import { COMIDAS_PLAN, type ComidaPlan, type SlotPlan, type TipoObjetivo } from '../datos/entidades';
import { filtrarRecetas, ordenarPorObjetivo } from './motor';
import { CATALOGO_RECETAS, type CategoriaReceta, type PresupuestoReceta, type Receta } from './recetas';

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

export const ETIQUETAS_COMIDA_PLAN: Record<ComidaPlan, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  snack: 'Snack',
};

/** Categorías de receta válidas para cada comida del plan. */
export const CATEGORIAS_POR_COMIDA: Record<ComidaPlan, CategoriaReceta[]> = {
  desayuno: ['desayuno'],
  almuerzo: ['almuerzo'],
  cena: ['cena'],
  snack: ['snack', 'bebida', 'postre'],
};

export interface OpcionesPlan {
  alergenos?: string[];
  exclusiones?: string[];
  presupuesto?: PresupuestoReceta | null;
  objetivo?: TipoObjetivo | null;
}

/** Recetas compatibles para una comida (reglas duras + categoría + orden por objetivo). */
export function recetasParaComida(recetas: Receta[], comida: ComidaPlan, opciones: OpcionesPlan): Receta[] {
  const categorias = CATEGORIAS_POR_COMIDA[comida];
  const compatibles = filtrarRecetas(recetas, {
    alergenos: opciones.alergenos,
    exclusiones: opciones.exclusiones,
    presupuesto: opciones.presupuesto ?? undefined,
  }).filter((r) => categorias.includes(r.categoria));
  return ordenarPorObjetivo(compatibles, opciones.objetivo);
}

/** Genera los slots de la semana (rotación determinista por día). */
export function generarPlan(opciones: OpcionesPlan, recetas: Receta[] = CATALOGO_RECETAS): SlotPlan[] {
  const slots: SlotPlan[] = [];
  for (const comida of COMIDAS_PLAN) {
    const candidatas = recetasParaComida(recetas, comida, opciones);
    if (candidatas.length === 0) continue;
    for (let dia = 0; dia < 7; dia++) {
      slots.push({ dia, comida, recetaId: candidatas[dia % candidatas.length]!.id });
    }
  }
  return slots.sort(
    (a, b) => a.dia - b.dia || COMIDAS_PLAN.indexOf(a.comida) - COMIDAS_PLAN.indexOf(b.comida),
  );
}

/** Reemplaza (o agrega) un slot puntual manteniendo el resto. */
export function reemplazarSlot(slots: SlotPlan[], dia: number, comida: ComidaPlan, recetaId: string): SlotPlan[] {
  const existente = slots.find((s) => s.dia === dia && s.comida === comida);
  if (existente) {
    return slots.map((s) => (s === existente ? { ...s, recetaId } : s));
  }
  const nuevos = [...slots, { dia, comida, recetaId }];
  return nuevos.sort(
    (a, b) => a.dia - b.dia || COMIDAS_PLAN.indexOf(a.comida) - COMIDAS_PLAN.indexOf(b.comida),
  );
}
