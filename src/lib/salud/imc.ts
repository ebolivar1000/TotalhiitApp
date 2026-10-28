/**
 * C1 — Índice de Masa Corporal (IMC).
 * Fórmula: IMC = peso (kg) / [estatura (m)]²
 * Fórmula comprobable, sin recomendaciones clínicas automáticas.
 */

export interface ResultadoIMC {
  valor: number;
  categoria: string;
}

/** Clasificación orientativa OMS para adultos (≥ 18 años). */
const LÍMITES = [
  { maximo: 18.5, categoria: 'Bajo peso' },
  { maximo: 25, categoria: 'Peso saludable' },
  { maximo: 30, categoria: 'Sobrepeso' },
  { maximo: Infinity, categoria: 'Obesidad' },
] as const;

/** Rangos plausibles para evitar errores de tipeo y valores peligrosos. */
const PESO_MIN_KG = 25;
const PESO_MAX_KG = 400;
const ESTATURA_MIN_M = 0.5;
const ESTATURA_MAX_M = 2.6;

export function validarEntradas(pesoKg: number, estaturaM: number): string | null {
  if (!Number.isFinite(pesoKg) || !Number.isFinite(estaturaM)) return 'Datos inválidos';
  if (pesoKg < PESO_MIN_KG || pesoKg > PESO_MAX_KG) return 'Peso fuera de rango plausible (25–400 kg)';
  if (estaturaM < ESTATURA_MIN_M || estaturaM > ESTATURA_MAX_M) return 'Estatura fuera de rango plausible (0,5–2,6 m)';
  return null;
}

/**
 * Calcula el IMC y su clasificación orientativa.
 * Devuelve null si las entradas no son válidas.
 */
export function calcularIMC(pesoKg: number, estaturaM: number): ResultadoIMC | null {
  if (validarEntradas(pesoKg, estaturaM)) return null;
  const valor = pesoKg / (estaturaM * estaturaM);
  const redondeado = Math.round(valor * 10) / 10;
  const categoria = LÍMITES.find((l) => valor < l.maximo)?.categoria ?? 'Obesidad';
  return { valor: redondeado, categoria };
}

/**
 * Texto orientativo sobre las limitaciones del IMC (para mostrar en la UI).
 */
export const LIMITACIONES_IMC =
  'El IMC es una medida orientativa: no distingue masa muscular de grasa y no determina por sí solo el porcentaje de grasa corporal. Para una evaluación personalizada consultá a un profesional de la salud.';
