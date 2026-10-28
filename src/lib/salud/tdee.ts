/**
 * C3 — Gasto energético diario (TDEE) = BMR × factor de actividad.
 * Factores estándar del PACR/Mifflin para población general:
 * sedentario 1.2 · ligero 1.375 · moderado 1.55 · activo 1.725 · muy activo 1.9.
 */

import type { NivelActividad } from '../datos/entidades';

export const FACTOR_TDEE: Record<NivelActividad, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
  muy_activo: 1.9,
};

export const ETIQUETAS_FACTOR_TDEE: Record<NivelActividad, string> = {
  sedentario: 'Sedentaria (oficina, poco movimiento)',
  ligero: 'Ligera (1–2 entrenos por semana)',
  moderado: 'Moderada (3–4 entrenos por semana)',
  activo: 'Activa (5–6 entrenos por semana)',
  muy_activo: 'Muy activa (entreno diario o trabajo físico)',
};

export function calcularTDEE(bmr: number, nivel: NivelActividad): number | null {
  if (!Number.isFinite(bmr) || bmr <= 0) return null;
  const factor = FACTOR_TDEE[nivel];
  if (!factor) return null;
  return Math.round(bmr * factor);
}
