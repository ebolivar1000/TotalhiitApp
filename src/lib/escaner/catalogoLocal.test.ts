import { describe, expect, it } from 'vitest';
import { buscarEnCatalogoLocal, CATALOGO_PRODUCTOS_LOCALES } from './catalogoLocal';

describe('Catálogo local de alimentos argentinos', () => {
  it('tiene productos precargados en el catálogo', () => {
    expect(CATALOGO_PRODUCTOS_LOCALES.length).toBeGreaterThanOrEqual(15);
  });

  it('resuelve Fritolím Cocinero con 92g de grasa y 828 kcal (no 0%)', () => {
    // EAN: 7790070265333
    const prod = buscarEnCatalogoLocal('7790070265333');
    expect(prod).not.toBeNull();
    expect(prod?.nombre).toContain('Fritolím');
    expect(prod?.nutrientes.grasasTotalesG).toBe(92);
    expect(prod?.nutrientes.caloriasKcal).toBe(828);
    expect(prod?.nutrientes.grasasSaturadasG).toBe(12);
    expect(prod?.fuente).toBe('catalogo_local');
    expect(prod?.puntaje.puntos).toBeGreaterThanOrEqual(50);
  });

  it('resuelve Aceite de Girasol Cocinero con 100g de grasa y 900 kcal', () => {
    const prod = buscarEnCatalogoLocal('7790070218216');
    expect(prod).not.toBeNull();
    expect(prod?.nutrientes.grasasTotalesG).toBe(100);
    expect(prod?.nutrientes.caloriasKcal).toBe(900);
    expect(prod?.nutrientes.azucaresG).toBe(0);
    expect(prod?.nutrientes.sodioMg).toBe(0);
  });

  it('resuelve Leche Entera La Serenísima como alimento líquido con nutrientes completos', () => {
    const prod = buscarEnCatalogoLocal('7792798000016');
    expect(prod).not.toBeNull();
    expect(prod?.nombre).toContain('Leche Entera');
    expect(prod?.esLiquido).toBe(true);
    expect(prod?.nutrientes.proteinasG).toBe(3.1);
    expect(prod?.nutrientes.grasasTotalesG).toBe(3.0);
    expect(prod?.nutrientes.caloriasKcal).toBe(58);
  });

  it('resuelve Galletitas Chocolinas con octógonos de advertencia', () => {
    const prod = buscarEnCatalogoLocal('7790040000200');
    expect(prod).not.toBeNull();
    expect(prod?.nombre).toContain('Chocolinas');
    expect(prod?.nutrientes.azucaresG).toBe(32);
    expect(prod?.nutrientes.grasasTotalesG).toBe(12);
    expect(prod?.puntaje.octogonos.some((o) => o.tipo === 'exceso_azucares')).toBe(true);
  });

  it('soporta códigos con guiones, espacios o prefijos numéricos', () => {
    const conFormato = buscarEnCatalogoLocal('779-0070-265333');
    expect(conFormato).not.toBeNull();
    expect(conFormato?.nombre).toContain('Fritolím');
  });

  it('retorna null para un código inexistente', () => {
    const noExiste = buscarEnCatalogoLocal('9999999999999');
    expect(noExiste).toBeNull();
  });
});
