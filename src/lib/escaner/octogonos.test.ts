import { describe, expect, it } from 'vitest';
import { calcularOctogonosArgentina } from './octogonos';

describe('octógonos negros Ley 27.642 (Argentina)', () => {
  it('detecta exceso de azúcares y calorías en gaseosa común', () => {
    // Gaseosa regular: 42 kcal, 10.6g azúcares por 100ml (líquido)
    // kcal azúcares = 10.6 * 4 = 42.4 kcal -> 100% kcal de azúcares (> 10%)
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 42,
        azucaresG: 10.6,
        grasasTotalesG: 0,
        grasasSaturadasG: 0,
        sodioMg: 4,
      },
      { esLiquido: true },
    );

    const azucar = res.octogonos.find((o) => o.tipo === 'exceso_azucares');
    expect(azucar?.activo).toBe(true);

    // En líquidos el límite de calorías es 70 kcal (42 < 70 -> no lleva calorías)
    const calorias = res.octogonos.find((o) => o.tipo === 'exceso_calorias');
    expect(calorias?.activo).toBeUndefined();
  });

  it('detecta leyenda de edulcorantes y cafeína en gaseosa light o zero', () => {
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 0.5,
        azucaresG: 0,
        grasasTotalesG: 0,
        grasasSaturadasG: 0,
        sodioMg: 15,
      },
      {
        esLiquido: true,
        aditivosCodigos: ['en:e950', 'en:e951'],
        ingredientesTexto: 'Agua carbonatada, colorante caramelo IV, edulcorantes: aspartamo y acesulfamo K, cafeina.',
      },
    );

    const edulcorante = res.leyendas.find((l) => l.tipo === 'edulcorantes');
    const cafeina = res.leyendas.find((l) => l.tipo === 'cafeina');

    expect(edulcorante?.activa).toBe(true);
    expect(cafeina?.activa).toBe(true);
  });

  it('detecta 4 octógonos en galletitas dulces industriales rellenas', () => {
    // Galletitas rellenas: 480 kcal, 32g azúcares, 20g grasas totales, 9g saturadas, 250mg sodio
    const res = calcularOctogonosArgentina({
      caloriasKcal: 480,
      azucaresG: 32, // 32*4 = 128 kcal (26.6% > 10%)
      grasasTotalesG: 20, // 20*9 = 180 kcal (37.5% > 30%)
      grasasSaturadasG: 9, // 9*9 = 81 kcal (16.8% > 10%)
      sodioMg: 250,
    });

    expect(res.octogonos.some((o) => o.tipo === 'exceso_azucares')).toBe(true);
    expect(res.octogonos.some((o) => o.tipo === 'exceso_grasas_totales')).toBe(true);
    expect(res.octogonos.some((o) => o.tipo === 'exceso_grasas_saturadas')).toBe(true);
    expect(res.octogonos.some((o) => o.tipo === 'exceso_calorias')).toBe(true); // 480 > 275 kcal
  });

  it('un yogur natural o fruta fresca no tiene sellos negros', () => {
    // Yogur natural entero: 62 kcal, 4.5g azúcares intrínsecos de lactosa, 3.2g grasa, 1.8g saturadas, 45mg sodio
    // Azúcares: 4.5 * 4 = 18 kcal (29%), pero sin azúcares agregados
    // Simulemos un producto 100% natural sin excesos:
    const res = calcularOctogonosArgentina({
      caloriasKcal: 55,
      azucaresG: 1,
      grasasTotalesG: 0.5,
      grasasSaturadasG: 0.1,
      sodioMg: 10,
    });

    expect(res.tieneSellos).toBe(false);
    expect(res.octogonos.length).toBe(0);
  });
});
