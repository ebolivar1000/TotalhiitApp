/**
 * C2 — Metabolismo Basal (BMR) con la ecuación Mifflin-St Jeor (1990),
 * la más precisa para población general según la Academia de Nutrición y Dietética (EE. UU.).
 * Fórmula: 10·peso(kg) + 6.25·estatura(cm) − 5·edad(años) + 5 (hombres) / − 161 (mujeres).
 * Si no se informa el género, se usa el punto medio de ambos términos (+5 y −161 → −78).
 */

/** Género tal como llega del perfil; cualquier valor distinto de masculino/femenino usa el punto medio. */
export type GeneroBMR = string | undefined;

export function calcularBMR(entrada: {
  pesoKg: number;
  estaturaCm: number;
  edad: number;
  genero?: GeneroBMR;
}): number | null {
  const { pesoKg, estaturaCm, edad, genero } = entrada;
  if (!Number.isFinite(pesoKg) || !Number.isFinite(estaturaCm) || !Number.isFinite(edad)) return null;
  if (pesoKg < 25 || pesoKg > 400) return null;
  if (estaturaCm < 50 || estaturaCm > 260) return null;
  if (edad < 18 || edad > 100) return null;
  const base = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad;
  const ajuste = genero === 'masculino' ? 5 : genero === 'femenino' ? -161 : -78;
  return Math.round(base + ajuste);
}
