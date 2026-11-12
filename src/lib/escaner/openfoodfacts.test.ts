import { describe, expect, it } from 'vitest';
import { consultarOpenFoodFacts } from './openfoodfacts';

describe('Servicio Open Food Facts con fallback a catálogo local', () => {
  it('resuelve inmediatamente códigos del catálogo curado local sin necesidad de red', async () => {
    // 7790070265333: Fritolím
    const res = await consultarOpenFoodFacts('7790070265333');
    expect(res.exito).toBe(true);
    expect(res.producto).toBeDefined();
    expect(res.producto?.nombre).toContain('Fritolím');
    expect(res.producto?.nutrientes.grasasTotalesG).toBe(92);
    expect(res.producto?.fuente).toBe('catalogo_local');
  });

  it('rechaza códigos no numéricos o con longitud inválida', async () => {
    const res = await consultarOpenFoodFacts('abc12');
    expect(res.exito).toBe(false);
    expect(res.mensaje).toContain('El código de barras debe ser numérico');
  });
});
