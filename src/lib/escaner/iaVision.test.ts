import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  analizarFotoConIa,
  guardarApiKeyGemini,
  obtenerApiKeyGemini,
} from './iaVision';

describe('Servicio de IA Vision para Escáner de Etiquetas', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
    });
  });

  it('guarda y recupera la API key de Gemini correctamente en localStorage', () => {
    expect(obtenerApiKeyGemini()).toBe('');
    guardarApiKeyGemini('AIzaSyTestKey123');
    expect(obtenerApiKeyGemini()).toBe('AIzaSyTestKey123');
    guardarApiKeyGemini('');
    expect(obtenerApiKeyGemini()).toBe('');
  });

  it('devuelve error SIN_API_KEY si no se proporciona ninguna clave', async () => {
    const res = await analizarFotoConIa({
      imagenBase64: 'abc123mock',
      apiKey: '',
    });

    expect(res.ok).toBe(false);
    expect(res.errorTipo).toBe('SIN_API_KEY');
    expect(res.mensaje).toContain('API Key');
  });

  it('detecta y reporta CUOTA_EXCEDIDA ante error HTTP 429 sin realizar cobros imprevistos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 429,
        ok: false,
        text: async () => 'RESOURCE_EXHAUSTED: Quota exceeded for quota metric',
      }),
    );

    const res = await analizarFotoConIa({
      imagenBase64: 'abc123mock',
      apiKey: 'test-api-key',
    });

    expect(res.ok).toBe(false);
    expect(res.errorTipo).toBe('CUOTA_EXCEDIDA');
    expect(res.mensaje).toContain('1.500 consultas por día');
    expect(res.mensaje).toContain('NO genera cobros automáticos');
  });

  it('procesa exitosamente una foto de etiqueta y genera el producto con nota de salud y explicación en lenguaje simple', async () => {
    const respuestaMock = {
      nombre: 'Galletitas de Avena y Miel',
      marca: 'Granja Saludable',
      categoria: 'Galletitas',
      esLiquido: false,
      nutrientes: {
        caloriasKcal: 420,
        azucaresG: 18.0,
        grasasTotalesG: 12.0,
        grasasSaturadasG: 4.5,
        sodioMg: 210,
        fibraG: 5.2,
        proteinasG: 7.0,
      },
      ingredientesTexto: 'Avena arrollada, harina de trigo, azúcar, aceite de girasol, miel, lecitina de soja (INS 322).',
      explicacionSimple: 'Tienen un buen aporte de fibra por la avena, pero contienen el equivalente a 4 cucharaditas de azúcar por paquete. Consúmelas como snack ocasional, no como base diaria.',
      alertaAlergenos: ['gluten', 'soja'],
      nivelProcesamientoNova: 3,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(respuestaMock) }],
              },
            },
          ],
        }),
      }),
    );

    const res = await analizarFotoConIa({
      imagenBase64: 'base64sampledata',
      apiKey: 'valid-test-key',
      paisNormativa: 'AR',
    });

    expect(res.ok).toBe(true);
    expect(res.producto).toBeDefined();
    expect(res.producto?.nombre).toBe('Galletitas de Avena y Miel');
    expect(res.producto?.nutrientes.azucaresG).toBe(18.0);
    expect(res.producto?.nutrientes.caloriasKcal).toBe(420);
    expect(res.producto?.fuente).toBe('ia_vision');
    expect(res.producto?.puntaje.puntos).toBeGreaterThan(0);
    expect(res.producto?.explicacionIa).toContain('4 cucharaditas de azúcar');
    expect(res.producto?.alergenos).toContain('gluten');
  });

  it('maneja fotos ilegibles o que no son de alimentos devolviendo FOTO_ILEGIBLE', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ error: 'FOTO_ILEGIBLE' }) }],
              },
            },
          ],
        }),
      }),
    );

    const res = await analizarFotoConIa({
      imagenBase64: 'foto_borrosa',
      apiKey: 'valid-key',
    });

    expect(res.ok).toBe(false);
    expect(res.errorTipo).toBe('FOTO_ILEGIBLE');
  });
});
