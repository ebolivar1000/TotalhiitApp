import { describe, expect, it } from 'vitest';
import { calcularPuntajeSalud } from './puntaje';

describe('algoritmo de puntaje de salud (0 a 100)', () => {
  it('caso 1: gaseosa común azucarada obtiene puntaje Malo (rojo)', () => {
    const res = calcularPuntajeSalud({
      nutrientes: {
        caloriasKcal: 42,
        azucaresG: 10.6,
        grasasTotalesG: 0,
        grasasSaturadasG: 0,
        sodioMg: 4,
        fibraG: 0,
        proteinasG: 0,
      },
      novaGroup: 4,
      esLiquido: true,
      aditivosCodigos: ['en:e150d'],
    });

    expect(res.puntos).toBeLessThan(35);
    expect(res.nivel).toMatch(/malo|mediocre/);
    expect(res.desglose.procesamientoNova).toBe(0); // NOVA 4
    expect(res.equivalencias.cucharaditasAzucar).toBeGreaterThanOrEqual(2.5);
    expect(res.motivos.some((m) => m.titulo.includes('azúcar'))).toBe(true);
  });

  it('caso 2: avena integral o yogur natural sin azúcar obtiene Excelente (verde)', () => {
    const res = calcularPuntajeSalud({
      nutrientes: {
        caloriasKcal: 370,
        azucaresG: 1.0,
        grasasTotalesG: 6.5,
        grasasSaturadasG: 1.1,
        sodioMg: 6,
        fibraG: 10.0,
        proteinasG: 13.5,
      },
      novaGroup: 1,
      aditivosCodigos: [],
    });

    expect(res.puntos).toBeGreaterThanOrEqual(75);
    expect(res.nivel).toBe('excelente');
    expect(res.desglose.procesamientoNova).toBe(25); // NOVA 1
    expect(res.desglose.aditivos).toBe(15); // Sin aditivos
    expect(res.motivos.some((m) => m.titulo.includes('fibra') || m.titulo.includes('natural'))).toBe(true);
  });

  it('caso 3: galletitas ultraprocesadas rellenas obtienen puntaje Malo o Mediocre', () => {
    const res = calcularPuntajeSalud({
      nutrientes: {
        caloriasKcal: 490,
        azucaresG: 34,
        grasasTotalesG: 22,
        grasasSaturadasG: 11,
        sodioMg: 380,
        fibraG: 1.8,
        proteinasG: 5.2,
      },
      novaGroup: 4,
      aditivosCodigos: ['en:e322', 'en:e471', 'en:e500'],
    });

    expect(res.puntos).toBeLessThan(40);
    expect(['malo', 'mediocre']).toContain(res.nivel);
    expect(res.octogonos.length).toBeGreaterThanOrEqual(3);
  });

  it('caso 4: aceite de oliva virgen extra obtiene calificación favorable', () => {
    const res = calcularPuntajeSalud({
      nutrientes: {
        caloriasKcal: 884,
        azucaresG: 0,
        grasasTotalesG: 100,
        grasasSaturadasG: 14,
        sodioMg: 0,
        fibraG: 0,
        proteinasG: 0,
      },
      novaGroup: 2,
      categoriaTags: ['en:olive-oils', 'en:extra-virgin-olive-oils'],
      aditivosCodigos: [],
    });

    expect(res.puntos).toBeGreaterThanOrEqual(65);
    expect(['bueno', 'excelente']).toContain(res.nivel);
    expect(res.desglose.procesamientoNova).toBe(20); // NOVA 2
  });

  it('caso 5: snack ultraprocesado con colorantes sintéticos penaliza aditivos', () => {
    const res = calcularPuntajeSalud({
      nutrientes: {
        caloriasKcal: 530,
        azucaresG: 3.5,
        grasasTotalesG: 34,
        grasasSaturadasG: 15,
        sodioMg: 780,
        fibraG: 2.1,
        proteinasG: 6.0,
      },
      novaGroup: 4,
      aditivosCodigos: ['en:e102', 'en:e621'], // Tartrazina (evitar) + Glutamato
    });

    expect(res.puntos).toBeLessThan(30);
    expect(res.desglose.aditivos).toBeLessThan(10);
    expect(res.motivos.some((m) => m.titulo.includes('aditivo') || m.titulo.includes('sodio'))).toBe(true);
  });
});
