import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectarDispositivoIos,
  debeMostrarBannerIos,
  marcarBannerIosDescartado,
  restablecerBannerIos,
} from './detectorIos';

describe('detectorIos', () => {
  const localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(localStorageMock).forEach((k) => delete localStorageMock[k]);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => localStorageMock[k] ?? null,
      setItem: (k: string, v: string) => {
        localStorageMock[k] = v;
      },
      removeItem: (k: string) => {
        delete localStorageMock[k];
      },
      clear: () => {
        Object.keys(localStorageMock).forEach((k) => delete localStorageMock[k]);
      },
    });
  });

  it('detecta iPhone correctamente por User Agent', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });

    const estado = detectarDispositivoIos();
    expect(estado.esIos).toBe(true);
    expect(estado.esIphone).toBe(true);
    expect(estado.esIpad).toBe(false);
    expect(estado.esSafari).toBe(true);
    expect(estado.esStandalone).toBe(false);
    expect(estado.esNavegadorInApp).toBe(false);
  });

  it('detecta navegador in-app de Instagram en iOS', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Instagram 300.0',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });

    const estado = detectarDispositivoIos();
    expect(estado.esIos).toBe(true);
    expect(estado.esNavegadorInApp).toBe(true);
    expect(estado.esSafari).toBe(false);
  });

  it('detecta que la app ya está en modo Standalone PWA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148',
      platform: 'iPhone',
      standalone: true,
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({ matches: query === '(display-mode: standalone)' }),
    });

    const estado = detectarDispositivoIos();
    expect(estado.esIos).toBe(true);
    expect(estado.esStandalone).toBe(true);
    expect(debeMostrarBannerIos()).toBe(false);
  });

  it('gestiona descarte y persistencia de banner', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
      location: { pathname: '/' },
    });

    expect(debeMostrarBannerIos()).toBe(true);
    marcarBannerIosDescartado();
    expect(debeMostrarBannerIos()).toBe(false);
    restablecerBannerIos();
    expect(debeMostrarBannerIos()).toBe(true);
  });

  it('no muestra el banner en rutas de onboarding', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
      location: { pathname: '/onboarding' },
    });

    expect(debeMostrarBannerIos()).toBe(false);
  });
});
