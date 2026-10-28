import { describe, expect, it } from 'vitest';
import { calcularBMR } from './bmr';

describe('BMR — Mifflin-St Jeor', () => {
  it('calcula para mujer con datos conocidos', () => {
    // 10·68 + 6.25·165 − 5·30 − 161 = 1400,25 → 1400
    expect(calcularBMR({ pesoKg: 68, estaturaCm: 165, edad: 30, genero: 'femenino' })).toBe(1400);
  });

  it('calcula para hombre (+5)', () => {
    expect(calcularBMR({ pesoKg: 68, estaturaCm: 165, edad: 30, genero: 'masculino' })).toBe(1566);
  });

  it('sin género usa el punto medio (−78)', () => {
    expect(calcularBMR({ pesoKg: 68, estaturaCm: 165, edad: 30, genero: undefined })).toBe(1483);
  });

  it('rechaza datos fuera de rango plausible', () => {
    expect(calcularBMR({ pesoKg: 10, estaturaCm: 165, edad: 30, genero: 'femenino' })).toBeNull();
    expect(calcularBMR({ pesoKg: 68, estaturaCm: 30, edad: 30, genero: 'femenino' })).toBeNull();
    expect(calcularBMR({ pesoKg: 68, estaturaCm: 165, edad: 12, genero: 'femenino' })).toBeNull();
    expect(calcularBMR({ pesoKg: Number.NaN, estaturaCm: 165, edad: 30 })).toBeNull();
  });
});
