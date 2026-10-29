import { describe, expect, it } from 'vitest';
import type { DatosCiclo } from '../datos/entidades';
import { episodiosSangrado, estadoDeHoy, estimarCiclo, calcularSemanaCiclo, construirHistorialMesAMes } from './estimaciones';

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

  it('calcula la semana del ciclo y la recomendación de Totalhiit', () => {
    // Día 3 (Semana 1)
    const s1 = calcularSemanaCiclo('2026-10-26', '2026-10-28');
    expect(s1.diaCiclo).toBe(3);
    expect(s1.semana).toBe(1);
    expect(s1.fase).toBe('menstrual');
    expect(s1.semanaVideo).toBe('1');

    // Día 10 (Semana 2)
    const s2 = calcularSemanaCiclo('2026-10-19', '2026-10-28');
    expect(s2.diaCiclo).toBe(10);
    expect(s2.semana).toBe(2);
    expect(s2.fase).toBe('folicular');
    expect(s2.semanaVideo).toBe('2');

    // Día 17 (Semana 3)
    const s3 = calcularSemanaCiclo('2026-10-12', '2026-10-28');
    expect(s3.diaCiclo).toBe(17);
    expect(s3.semana).toBe(3);
    expect(s3.fase).toBe('ovulatoria');
    expect(s3.semanaVideo).toBe('3');

    // Día 25 (Semana 4)
    const s4 = calcularSemanaCiclo('2026-10-04', '2026-10-28');
    expect(s4.diaCiclo).toBe(25);
    expect(s4.semana).toBe(4);
    expect(s4.fase).toBe('lutea');
    expect(s4.semanaVideo).toBe('4');
  });

  it('construye historial mes a mes con duración y regularidad', () => {
    const episodios = [
      { inicio: '2026-08-20', fin: '2026-08-24', diasSangrado: 5 },
      { inicio: '2026-09-17', fin: '2026-09-21', diasSangrado: 5 },
      { inicio: '2026-10-15', fin: '2026-10-19', diasSangrado: 5 },
    ];
    const historial = construirHistorialMesAMes(episodios);
    expect(historial).toHaveLength(3);
    expect(historial[0]!.inicio).toBe('2026-10-15');
    expect(historial[0]!.duracionCicloDias).toBe(28); // 15 Oct - 17 Sep = 28 días
    expect(historial[0]!.esRegular).toBe(true);
  });
});
