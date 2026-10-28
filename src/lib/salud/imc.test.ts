import { describe, expect, it } from 'vitest';
import { calcularIMC, validarEntradas } from './imc';

describe('calcularIMC', () => {
  it('calcula el IMC correcto para un caso típico', () => {
    // 70 kg / 1,75 m² = 22,86 → 22,9
    expect(calcularIMC(70, 1.75)).toEqual({ valor: 22.9, categoria: 'Peso saludable' });
  });

  it('clasifica bajo peso en el límite inferior', () => {
    expect(calcularIMC(45, 1.6)?.categoria).toBe('Bajo peso');
  });

  it('clasifica exactamente 18,5 como peso saludable (límite excluyente)', () => {
    // 74 / 2² = 18,5 exacto → pertenece al tramo siguiente
    expect(calcularIMC(74, 2.0)).toEqual({ valor: 18.5, categoria: 'Peso saludable' });
  });

  it('clasifica sobrepeso y obesidad', () => {
    expect(calcularIMC(80, 1.75)?.categoria).toBe('Sobrepeso');
    expect(calcularIMC(110, 1.75)?.categoria).toBe('Obesidad');
  });

  it('redondea a un decimal', () => {
    // 69,3 / 1,67² = 24,8497… → 24,8
    expect(calcularIMC(69.3, 1.67)?.valor).toBe(24.8);
  });

  it('rechaza entradas inválidas y devuelve null', () => {
    expect(calcularIMC(0, 1.7)).toBeNull();
    expect(calcularIMC(70, 0)).toBeNull();
    expect(calcularIMC(Number.NaN, 1.7)).toBeNull();
    expect(calcularIMC(70, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('rechaza valores fuera del rango plausible', () => {
    expect(calcularIMC(10, 1.7)).toBeNull();
    expect(calcularIMC(500, 1.7)).toBeNull();
    expect(calcularIMC(70, 0.3)).toBeNull();
    expect(calcularIMC(70, 3)).toBeNull();
  });
});

describe('validarEntradas', () => {
  it('devuelve mensajes útiles por cada regla', () => {
    expect(validarEntradas(Number.NaN, 1.7)).toBe('Datos inválidos');
    expect(validarEntradas(5, 1.7)).toContain('Peso fuera de rango');
    expect(validarEntradas(70, 5)).toContain('Estatura fuera de rango');
    expect(validarEntradas(70, 1.7)).toBeNull();
  });
});
