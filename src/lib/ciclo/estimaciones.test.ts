import { describe, expect, it } from 'vitest';
import type { DatosCiclo } from '../datos/entidades';
import { episodiosSangrado, estadoDeHoy, estimarCiclo } from './estimaciones';

const H = '2026-10-28';

function dia(fecha: string, datos: Partial<DatosCiclo> = {}): { fecha: string; datos: DatosCiclo } {
  return { fecha, datos: { flujo: datos.flujo ?? 'medio', sintomas: datos.sintomas ?? [] } };
}

describe('episodiosSangrado', () => {
  it('agrupa días consecutivos y tolera un día sin registro en el medio', () => {
    const episodios = episodiosSangrado([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-05', // hueco del 04 (gap 2): mismo episodio
      '2026-10-26', // nuevo episodio
      '2026-10-27',
    ]);
    expect(episodios).toHaveLength(2);
    expect(episodios[0]).toEqual({ inicio: '2026-10-01', fin: '2026-10-05', diasSangrado: 4 });
    expect(episodios[1]).toEqual({ inicio: '2026-10-26', fin: '2026-10-27', diasSangrado: 2 });
  });

  it('separa episodios con más de un día de hueco y deduplica fechas', () => {
    const episodios = episodiosSangrado(['2026-10-01', '2026-10-01', '2026-10-06']);
    expect(episodios).toHaveLength(2);
  });
});

describe('estimarCiclo', () => {
  it('sin registros: datos insuficientes', () => {
    const r = estimarCiclo([], H);
    if (r.suficiente) throw new Error('no debió estimar');
    expect(r.motivo).toBe('sin_registros');
  });

  it('un solo episodio: todavía no hay patrón', () => {
    const r = estimarCiclo([dia('2026-10-01'), dia('2026-10-02')], H);
    if (r.suficiente) throw new Error('no debió estimar');
    expect(r.motivo).toBe('un_solo_ciclo');
  });

  it('dos ciclos regulares: promedio y ventana con margen de ±3', () => {
    const registros = [
      dia('2026-09-01'),
      dia('2026-09-02'),
      dia('2026-09-03'),
      dia('2026-09-28'), // ciclo 1: 27 días
      dia('2026-09-29'),
      dia('2026-10-25'), // ciclo 2: 27 días
    ];
    const r = estimarCiclo(registros, H);
    expect(r.suficiente).toBe(true);
    if (!r.suficiente) return;
    expect(r.duracionPromedio).toBe(27);
    expect(r.ciclosContados).toBe(2);
    expect(r.irregular).toBe(false);
    expect(r.proximoInicioEstimado).toBe('2026-11-21');
    expect(r.ventanaDesde).toBe('2026-11-18'); // +24 (27-3)
    expect(r.ventanaHasta).toBe('2026-11-24'); // +30 (27+3)
  });

  it('marca irregularidad cuando las duraciones salen del rango típico', () => {
    const registros = [
      dia('2026-09-01'),
      dia('2026-09-25'), // 24 días
      dia('2026-11-05'), // 41 días
    ];
    const r = estimarCiclo(registros, H);
    expect(r.suficiente).toBe(true);
    if (!r.suficiente) return;
    expect(r.irregular).toBe(true);
    expect(r.motivoIrregularidad).toBe('fuera_de_rango');
    // Ventana amplia: último inicio (2026-11-05) + [mín-3, máx+3]
    expect(r.ventanaDesde).toBe('2026-11-26');
    expect(r.ventanaHasta).toBe('2026-12-19');
  });

  it('estadoDeHoy ubica a hoy respecto de la ventana', () => {
    const registros = [
      dia('2026-09-01'),
      dia('2026-09-28'),
      dia('2026-10-25'),
    ];
    const r = estimarCiclo(registros, H);
    expect(estadoDeHoy(r, '2026-11-20')).toBe('en_ventana');
    expect(estadoDeHoy(r, '2026-11-10')).toBe('antes_de_ventana');
    expect(estadoDeHoy(r, '2026-12-01')).toBe('despues_de_ventana');
    expect(estadoDeHoy({ suficiente: false, motivo: 'sin_registros' }, H)).toBe('sin_estimacion');
  });
});
