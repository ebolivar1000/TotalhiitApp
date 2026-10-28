/**
 * C5 — Proteína diaria orientativa para mujeres +40.
 * Base 1,2 g/kg (asociada a la prevención de pérdida muscular/sarcopenia en
 * esta etapa). Objetivos con carga muscular (masa, grasa, recomposición) suben
 * a 1,6 g/kg; resistencia a 1,4 g/kg. Rango respaldado por consensos de
 * nutrición deportiva (1,2–1,6 g/kg) y seguro para personas sanas.
 */

import type { TipoObjetivo } from '../datos/entidades';

export const PROTEINA_POR_OBJETIVO: Record<TipoObjetivo, number> = {
  masa_muscular: 1.6,
  perder_grasa: 1.6,
  recomposicion: 1.6,
  resistencia: 1.4,
  mantenimiento: 1.2,
  descanso: 1.2,
  bienestar: 1.2,
};

export function calcularProteinaDiaria(
  pesoKg: number,
  objetivo: TipoObjetivo,
): { minimo: number; ideal: number } | null {
  if (!Number.isFinite(pesoKg) || pesoKg < 25 || pesoKg > 400) return null;
  const minimo = Math.round(pesoKg * 1.2);
  const ideal = Math.round(pesoKg * PROTEINA_POR_OBJETIVO[objetivo]);
  return { minimo, ideal };
}
