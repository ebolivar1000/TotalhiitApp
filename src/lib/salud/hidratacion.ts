/**
 * C4 — Hidratación diaria estimada.
 * Referencia de uso común en nutrición deportiva: 35 ml por kg de peso y día
 * (rango general aceptado 30–40 ml/kg). No reemplaza la indicación médica en
 * personas con cardiopatías o renales.
 */

export function calcularAguaDiaria(pesoKg: number): number | null {
  if (!Number.isFinite(pesoKg) || pesoKg < 25 || pesoKg > 400) return null;
  const litros = (pesoKg * 35) / 1000;
  return Math.round(litros * 10) / 10;
}
