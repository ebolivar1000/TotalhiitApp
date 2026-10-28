import { describe, expect, it } from 'vitest';
import { calcularProteinaDiaria, PROTEINA_POR_OBJETIVO } from './proteina';

describe('Proteína diaria para mujeres +40', () => {
  it('base 1,2 g/kg en mantenimiento', () => {
    expect(calcularProteinaDiaria(68, 'mantenimiento')).toEqual({ minimo: 82, ideal: 82 });
  });

  it('1,6 g/kg en objetivos con carga muscular', () => {
    expect(calcularProteinaDiaria(68, 'masa_muscular')?.ideal).toBe(109);
    expect(calcularProteinaDiaria(68, 'perder_grasa')?.ideal).toBe(109);
    expect(calcularProteinaDiaria(68, 'recomposicion')?.ideal).toBe(109);
  });

  it('1,4 g/kg en resistencia', () => {
    expect(calcularProteinaDiaria(68, 'resistencia')?.ideal).toBe(95);
  });

  it('mínimo siempre es 1,2 g/kg', () => {
    expect(calcularProteinaDiaria(90, 'bienestar')?.minimo).toBe(108);
  });

  it('todos los objetivos tienen factor definido', () => {
    for (const objetivo of Object.keys(PROTEINA_POR_OBJETIVO)) {
      expect(PROTEINA_POR_OBJETIVO[objetivo as keyof typeof PROTEINA_POR_OBJETIVO]).toBeGreaterThan(1);
    }
  });

  it('rechaza pesos fuera de rango', () => {
    expect(calcularProteinaDiaria(10, 'bienestar')).toBeNull();
  });
});
