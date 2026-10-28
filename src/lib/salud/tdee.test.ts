import { describe, expect, it } from 'vitest';
import { calcularTDEE, FACTOR_TDEE } from './tdee';

describe('TDEE', () => {
  const casos = [
    ['sedentario', 1680],
    ['ligero', 1925],
    ['moderado', 2170],
    ['activo', 2415],
    ['muy_activo', 2660],
  ] as const;

  it.each(casos)('BMR 1400 × %s = %s kcal', (nivel, esperado) => {
    expect(calcularTDEE(1400, nivel)).toBe(esperado);
  });

  it('usa exactamente los factores estándar', () => {
    expect(FACTOR_TDEE['ligero']).toBe(1.375);
    expect(FACTOR_TDEE['muy_activo']).toBe(1.9);
  });

  it('rechaza BMR inválido o nivel desconocido', () => {
    expect(calcularTDEE(0, 'moderado')).toBeNull();
    expect(calcularTDEE(-100, 'moderado')).toBeNull();
    expect(calcularTDEE(Number.NaN, 'moderado')).toBeNull();
    expect(calcularTDEE(1400, 'fantasma' as never)).toBeNull();
  });
});
