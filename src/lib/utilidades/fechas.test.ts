import { describe, expect, it } from 'vitest';
import { edadCumplida, fechaAiso, isoAFecha } from './fechas';

describe('fechaAiso / isoAFecha', () => {
  it('formatea con ceros y round-trips', () => {
    const fecha = new Date(2026, 9, 28);
    expect(fechaAiso(fecha)).toBe('2026-10-28');
    const vuelta = isoAFecha('2026-10-28');
    expect(vuelta.getFullYear()).toBe(2026);
    expect(vuelta.getMonth()).toBe(9);
    expect(vuelta.getDate()).toBe(28);
  });

  it('maneja meses y días de un dígito', () => {
    expect(fechaAiso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('edadCumplida', () => {
  const hoy = new Date(2026, 9, 28);

  it('cuenta la edad exacta cuando ya cumplió este año', () => {
    expect(edadCumplida('1990-05-10', hoy)).toBe(36);
  });

  it('no cuenta el cumpleaños si aún no llegó', () => {
    expect(edadCumplida('1990-12-01', hoy)).toBe(35);
  });

  it('día exacto del cumpleaños ya cuenta como cumplido', () => {
    expect(edadCumplida('1990-10-28', hoy)).toBe(36);
  });

  it('refleja el requisito de mayores de 18 años', () => {
    const nacido2008 = '2008-11-01';
    expect(edadCumplida(nacido2008, hoy)).toBeLessThan(18);
    const nacido2005 = '2005-01-01';
    expect(edadCumplida(nacido2005, hoy)).toBeGreaterThanOrEqual(18);
  });

  it('cumpleaños 29 de febrero no rompe (año no bisiesto)', () => {
    expect(edadCumplida('2000-02-29', new Date(2026, 1, 28))).toBe(25);
  });
});
