/**
 * FASE 5 — Motor de reglas de nutrición (determinista, sin IA).
 * REGLA DURA #1: nunca sugiere una receta que declara un alérgeno que la
 * usuaria cargó (prueba obligatoria en motor.test.ts).
 * REGLA DURA #2: los alimentos excluidos por preferencia nunca aparecen,
 * comparando por nombre de ingrediente (case-insensitive).
 * El presupuesto funciona como escalera: bajo → solo bajo; medio → bajo+medio;
 * alto o sin dato → todo.
 */

import type { TipoObjetivo } from '../datos/entidades';
import type { CategoriaReceta, PresupuestoReceta, Receta } from './recetas';

export interface FiltroRecetas {
  alergenos?: string[];
  exclusiones?: string[];
  tiempoMaxMin?: number | null;
  presupuesto?: PresupuestoReceta | null;
  categoria?: CategoriaReceta | null;
  /** Incluye recetas que tengan este ingrediente (¿qué tenés en casa?). */
  ingrediente?: string | null;
  objetivo?: TipoObjetivo | null;
}

const normalizar = (t: string) => t.toLowerCase().trim();

export function contieneAlergeno(receta: Receta, alergenos: string[]): boolean {
  return receta.alergenos.some((a) => alergenos.some((u) => normalizar(u) === normalizar(a)));
}

export function tieneExclusion(receta: Receta, exclusiones: string[]): boolean {
  return receta.ingredientes.some((i) =>
    exclusiones.some((x) => i.nombre.toLowerCase().includes(normalizar(x))),
  );
}

export function presupuestosPermitidos(presupuestoUsuario: string | null | undefined): PresupuestoReceta[] {
  if (presupuestoUsuario === 'bajo') return ['bajo'];
  if (presupuestoUsuario === 'medio') return ['bajo', 'medio'];
  return ['bajo', 'medio', 'alto'];
}

export function filtrarRecetas(recetas: Receta[], filtro: FiltroRecetas): Receta[] {
  const permitidos = presupuestosPermitidos(filtro.presupuesto);
  return recetas.filter((r) => {
    if (contieneAlergeno(r, filtro.alergenos ?? [])) return false;
    if (tieneExclusion(r, filtro.exclusiones ?? [])) return false;
    if (filtro.tiempoMaxMin && r.tiempoMin > filtro.tiempoMaxMin) return false;
    if (!permitidos.includes(r.presupuesto)) return false;
    if (filtro.categoria && r.categoria !== filtro.categoria) return false;
    if (filtro.ingrediente && !r.ingredientes.some((i) => i.nombre.toLowerCase().includes(normalizar(filtro.ingrediente ?? '')))) {
      return false;
    }
    return true;
  });
}

export function ordenarPorObjetivo(recetas: Receta[], objetivo: TipoObjetivo | null | undefined): Receta[] {
  return [...recetas].sort((a, b) => {
    const mA = objetivo && a.objetivosCompatibles.includes(objetivo) ? 0 : 1;
    const mB = objetivo && b.objetivosCompatibles.includes(objetivo) ? 0 : 1;
    if (mA !== mB) return mA - mB;
    return a.tiempoMin - b.tiempoMin;
  });
}

export interface IngredienteEscalado {
  nombre: string;
  cantidad: number | null;
  unidad: string;
}

export interface RecetaEscalada {
  porciones: number;
  ingredientes: IngredienteEscalado[];
  macrosTotales: { kcal: number; proteinaG: number; carbohidratosG: number; grasasG: number; fibraG: number };
}

/** Reescala la receta a N porciones recalculando cantidades y macros totales. */
export function escalarReceta(receta: Receta, porciones: number): RecetaEscalada {
  const factor = porciones / receta.porcionesBase;
  const escala = (v: number) => Math.round(v * factor * 100) / 100;
  return {
    porciones,
    ingredientes: receta.ingredientes.map((i) => ({
      nombre: i.nombre,
      cantidad: i.cantidad === null ? null : escala(i.cantidad),
      unidad: i.unidad,
    })),
    macrosTotales: {
      kcal: Math.round(receta.macrosPorPorcion.kcal * porciones),
      proteinaG: Math.round(receta.macrosPorPorcion.proteinaG * porciones * 10) / 10,
      carbohidratosG: Math.round(receta.macrosPorPorcion.carbohidratosG * porciones * 10) / 10,
      grasasG: Math.round(receta.macrosPorPorcion.grasasG * porciones * 10) / 10,
      fibraG: Math.round(receta.macrosPorPorcion.fibraG * porciones * 10) / 10,
    },
  };
}

/** Formatea cantidades para pantalla (1 → "1", 0,5 → "0,5"). */
export function formatearCantidad(cantidad: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(cantidad);
}
