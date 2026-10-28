/**
 * FASE 4 — Motor de filtros de entrenamientos.
 * Regla dura: nunca se sugiere una sesión cuyo equipo requerido falte en el
 * perfil (el equipo "peso_corporal" se considera siempre disponible).
 */

import type { NivelExperiencia, TipoObjetivo, Equipamiento } from '../datos/entidades';
import type { CategoriaSesion, Workout } from './sesiones';

export interface FiltroSesiones {
  /** Equipamiento disponible del perfil. */
  equipamiento?: Equipamiento[];
  /** Filtro exacto por nivel (opcional). */
  nivel?: NivelExperiencia | null;
  /** Duración máxima en minutos (opcional). */
  duracionMaxMin?: number | null;
  /** Categoría exacta (opcional). */
  categoria?: CategoriaSesion | null;
  /** Objetivo compatible (opcional). */
  objetivo?: TipoObjetivo | null;
}

export function equipoDisponible(sesion: Workout, equipamiento: Equipamiento[] | undefined): boolean {
  return sesion.equipo.every((e) => e === 'peso_corporal' || (equipamiento ?? []).includes(e));
}

export function filtrarSesiones(sesiones: Workout[], filtro: FiltroSesiones): Workout[] {
  return sesiones.filter((s) => {
    if (!equipoDisponible(s, filtro.equipamiento)) return false;
    if (filtro.nivel && s.nivel !== filtro.nivel) return false;
    if (filtro.duracionMaxMin && s.duracionMin > filtro.duracionMaxMin) return false;
    if (filtro.categoria && !s.categorias.includes(filtro.categoria)) return false;
    if (filtro.objetivo && !s.objetivosCompatibles.includes(filtro.objetivo)) return false;
    return true;
  });
}

/** Ordena: primero las compatibles con el objetivo, luego por duración. */
export function ordenarPorObjetivo(sesiones: Workout[], objetivo: TipoObjetivo | null | undefined): Workout[] {
  return [...sesiones].sort((a, b) => {
    const mA = objetivo && a.objetivosCompatibles.includes(objetivo) ? 0 : 1;
    const mB = objetivo && b.objetivosCompatibles.includes(objetivo) ? 0 : 1;
    if (mA !== mB) return mA - mB;
    return a.duracionMin - b.duracionMin;
  });
}
