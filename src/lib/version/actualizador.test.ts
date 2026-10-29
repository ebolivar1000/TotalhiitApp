import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BUILD_ACTUAL, VERSION_ACTUAL, consultarActualizacion } from './actualizador';

describe('actualizador de versión', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detecta cuando hay una versión más reciente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0.3',
          buildNumber: BUILD_ACTUAL + 1,
          releaseDate: '2026-10-30',
          apkUrl: '/totalhiit.apk',
          novedades: ['Mejoras de rendimiento'],
        }),
      }),
    );

    const resultado = await consultarActualizacion();
    expect(resultado.disponible).toBe(true);
    expect(resultado.versionRemota?.version).toBe('1.0.3');
    expect(resultado.mensaje).toContain('1.0.3');
  });

  it('informa que ya está al día si la versión es la misma', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: VERSION_ACTUAL,
          buildNumber: BUILD_ACTUAL,
          releaseDate: '2026-10-28',
          apkUrl: '/totalhiit.apk',
          novedades: [],
        }),
      }),
    );

    const resultado = await consultarActualizacion();
    expect(resultado.disponible).toBe(false);
    expect(resultado.mensaje).toContain(VERSION_ACTUAL);
  });

  it('maneja fallos de red sin romper la app', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const resultado = await consultarActualizacion();
    expect(resultado.disponible).toBe(false);
    expect(resultado.mensaje).toContain('Error de conexión');
  });
});
