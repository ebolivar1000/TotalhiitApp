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

  it('adapta los sellos y organismos a México (NOM-051) cuando el código empieza con 750', () => {
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 420,
        azucaresG: 28,
        grasasTotalesG: 12,
        grasasSaturadasG: 6,
        sodioMg: 450,
      },
      { codigoBarras: '7501000153103' }, // Gansito México
    );

    expect(res.paisInfo.codigo).toBe('MX');
    expect(res.paisInfo.normativa).toBe('NOM-051');
    expect(res.paisInfo.organismo).toBe('Secretaría de Salud');
    expect(res.octogonos.some((o) => o.titulo === 'EXCESO AZÚCARES')).toBe(true);
  });

  it('adapta los sellos y organismos a Chile (Ley 20.606) usando ALTO EN cuando el código empieza con 780', () => {
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 470,
        azucaresG: 36,
        grasasTotalesG: 19,
        grasasSaturadasG: 9,
        sodioMg: 320,
      },
      { codigoBarras: '7802500001018' }, // Tritón Chile
    );

    expect(res.paisInfo.codigo).toBe('CL');
    expect(res.paisInfo.normativa).toBe('Ley 20.606');
    expect(res.octogonos.some((o) => o.titulo === 'ALTO EN AZÚCARES')).toBe(true);
  });

  it('adapta los sellos a Colombia (Res. 2492) cuando el código empieza con 770', () => {
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 440,
        azucaresG: 36,
        grasasTotalesG: 20,
        grasasSaturadasG: 11,
        sodioMg: 210,
      },
      { codigoBarras: '7702111000107' }, // Chocoramo Colombia
    );

    expect(res.paisInfo.codigo).toBe('CO');
    expect(res.paisInfo.normativa).toContain('Res. 2492');
    expect(res.octogonos.some((o) => o.titulo === 'EXCESO EN AZÚCARES')).toBe(true);
  });

  it('detecta productos de España (prefijo 84) con sistema Nutri-Score', () => {
    const res = calcularOctogonosArgentina(
      {
        caloriasKcal: 435,
        azucaresG: 23,
        grasasTotalesG: 11,
        grasasSaturadasG: 2.5,
        sodioMg: 350,
      },
      { codigoBarras: '8410069001015' }, // Gullón España
    );

    expect(res.paisInfo.codigo).toBe('ES');
    expect(res.paisInfo.usaNutriScorePrincipal).toBe(true);
  });
});
