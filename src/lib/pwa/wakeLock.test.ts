import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activarWakeLock, desactivarWakeLock, soportaWakeLock } from './wakeLock';

describe('wakeLock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detecta soporte de Wake Lock correctamente', () => {
    vi.stubGlobal('navigator', {
      wakeLock: {
        request: vi.fn(),
      },
    });
    expect(soportaWakeLock()).toBe(true);

    vi.stubGlobal('navigator', {});
    expect(soportaWakeLock()).toBe(false);
  });

  it('activa y libera el Wake Lock de forma segura', async () => {
    const releaseMock = vi.fn().mockResolvedValue(undefined);
    const sentinelMock = {
      release: releaseMock,
      released: false,
      addEventListener: vi.fn(),
    };
    const requestMock = vi.fn().mockResolvedValue(sentinelMock);

    vi.stubGlobal('navigator', {
      wakeLock: {
        request: requestMock,
      },
    });

    const exito = await activarWakeLock();
    expect(exito).toBe(true);
    expect(requestMock).toHaveBeenCalledWith('screen');

    await desactivarWakeLock();
    expect(releaseMock).toHaveBeenCalled();
  });
});
