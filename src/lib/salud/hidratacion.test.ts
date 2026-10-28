import { describe, expect, it } from 'vitest';
import { calcularAguaDiaria } from './hidratacion';

describe('Hidratación diaria (35 ml/kg)', () => {
  it('68 kg → 2,4 L', () => {
    expect(calcularAguaDiaria(68)).toBe(2.4);
  });

  it('25 kg → 0,9 L', () => {
    expect(calcularAguaDiaria(25)).toBe(0.9);
  });

  it('redondea a un decimal', () => {
    expect(calcularAguaDiaria(73)).toBe(2.6); // 2,555
  });

  it('rechaza pesos fuera de rango', () => {
    expect(calcularAguaDiaria(10)).toBeNull();
    expect(calcularAguaDiaria(Number.NaN)).toBeNull();
  });
});
