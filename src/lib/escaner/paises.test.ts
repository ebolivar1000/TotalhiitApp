import { describe, expect, it } from 'vitest';
import { detectarPaisPorCodigo } from './paises';

describe('Detección de país y normativa por código de barras GS1', () => {
  it('detecta México por prefijo 750', () => {
    const p = detectarPaisPorCodigo('7501000153103');
    expect(p.codigo).toBe('MX');
    expect(p.nombre).toBe('México');
    expect(p.bandera).toBe('🇲🇽');
    expect(p.normativa).toBe('NOM-051');
    expect(p.organismo).toBe('Secretaría de Salud');
    expect(p.prefijoSello).toBe('EXCESO');
  });

  it('detecta Argentina por prefijo 779', () => {
    const p = detectarPaisPorCodigo('7790070265333');
    expect(p.codigo).toBe('AR');
    expect(p.nombre).toBe('Argentina');
    expect(p.bandera).toBe('🇦🇷');
    expect(p.normativa).toBe('Ley 27.642');
  });

  it('detecta Colombia por prefijo 770 o 771', () => {
    const p = detectarPaisPorCodigo('7702111000107');
    expect(p.codigo).toBe('CO');
    expect(p.nombre).toBe('Colombia');
    expect(p.bandera).toBe('🇨🇴');
    expect(p.normativa).toContain('Res. 2492');
  });

  it('detecta Chile por prefijo 780', () => {
    const p = detectarPaisPorCodigo('7802500001018');
    expect(p.codigo).toBe('CL');
    expect(p.nombre).toBe('Chile');
    expect(p.bandera).toBe('🇨🇱');
    expect(p.prefijoSello).toBe('ALTO EN');
  });

  it('detecta Perú por prefijo 775', () => {
    const p = detectarPaisPorCodigo('7750101001012');
    expect(p.codigo).toBe('PE');
    expect(p.nombre).toBe('Perú');
    expect(p.bandera).toBe('🇵🇪');
  });

  it('detecta España por prefijo 84', () => {
    const p = detectarPaisPorCodigo('8410020001016');
    expect(p.codigo).toBe('ES');
    expect(p.nombre).toBe('España');
    expect(p.bandera).toBe('🇪🇸');
    expect(p.usaNutriScorePrincipal).toBe(true);
  });

  it('respeta la preferencia de país elegida por el usuario si no es auto', () => {
    // Código de Argentina pero usuario forzó México
    const p = detectarPaisPorCodigo('7790070265333', 'MX');
    expect(p.codigo).toBe('MX');
    expect(p.normativa).toBe('NOM-051');
  });

  it('retorna OPS/OMS para prefijos no mapeados', () => {
    const p = detectarPaisPorCodigo('001234567890');
    expect(p.codigo).toBe('OPS');
    expect(p.bandera).toBe('🌎');
  });
});
