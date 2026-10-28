/**
 * FASE 8 — Estimaciones del ciclo con incertidumbre VISIBLE (sin predicciones
 * exactas, sin valor clínico, jamás anticonceptivo). Reglas deterministas:
 * - Cada registro de ciclo es un día con sangrado (manchado o más).
 * - Un episodio agrupa días de sangrado separados por como máximo 1 día sin
 *   registro (gap ≤ 2 días calendario); los días sin datos no cortan el episodio.
 * - El inicio de ciclo es el primer día de cada episodio.
 * - La duración del ciclo es la diferencia entre inicios consecutivos.
 * - Ventana del próximo inicio: [último inicio + mínima − 3, último inicio +
 *   máxima + 3] días. Con ciclos irregulares la ventana ya es amplia por sí
 *   misma y se marca con la razón (variación alta o duraciones fuera de rango).
 */

import type { DatosCiclo } from '../datos/entidades';
import { diasEntre, sumarDias } from '../progreso/metricas';

export interface DiaLegible {
  fecha: string;
  datos: DatosCiclo;
}

export interface EpisodioSangrado {
  inicio: string;
  fin: string;
  diasSangrado: number;
}

export function episodiosSangrado(fechas: string[]): EpisodioSangrado[] {
  const ordenadas = Array.from(new Set(fechas)).sort();
  const episodios: EpisodioSangrado[] = [];
  for (const fecha of ordenadas) {
    const ultimo = episodios[episodios.length - 1];
    if (ultimo && diasEntre(ultimo.fin, fecha) <= 2) {
      ultimo.fin = fecha;
      ultimo.diasSangrado++;
    } else {
      episodios.push({ inicio: fecha, fin: fecha, diasSangrado: 1 });
    }
  }
  return episodios;
}

export interface EstimacionCiclo {
  suficiente: true;
  duracionPromedio: number;
  duracionMinima: number;
  duracionMaxima: number;
  proximoInicioEstimado: string;
  ventanaDesde: string;
  ventanaHasta: string;
  ciclosContados: number;
  /** Duraciones fuera del rango típico (21–35) o variación alta. */
  irregular: boolean;
  motivoIrregularidad: 'variacion_alta' | 'fuera_de_rango' | null;
}

export interface SinDatosCiclo {
  suficiente: false;
  motivo: 'sin_registros' | 'un_solo_ciclo';
}

export type ResultadoCiclo = EstimacionCiclo | SinDatosCiclo;

export function estimarCiclo(registros: DiaLegible[], _hoy: string): ResultadoCiclo {
  const episodios = episodiosSangrado(registros.map((r) => r.fecha));
  const inicios = episodios.map((e) => e.inicio);
  if (inicios.length === 0) return { suficiente: false, motivo: 'sin_registros' };
  if (inicios.length === 1) return { suficiente: false, motivo: 'un_solo_ciclo' };

  const duraciones = inicios.slice(1).map((inicio, i) => diasEntre(inicios[i]!, inicio));
  const promedio = duraciones.reduce((a, b) => a + b, 0) / duraciones.length;
  const minima = Math.min(...duraciones);
  const maxima = Math.max(...duraciones);
  const desvio = Math.sqrt(duraciones.reduce((a, d) => a + (d - promedio) ** 2, 0) / duraciones.length);

  let irregular = false;
  let motivoIrregularidad: EstimacionCiclo['motivoIrregularidad'] = null;
  if (minima < 21 || maxima > 35) {
    irregular = true;
    motivoIrregularidad = 'fuera_de_rango';
  } else if (duraciones.length >= 3 && desvio > 7) {
    irregular = true;
    motivoIrregularidad = 'variacion_alta';
  }

  const ultimoInicio = inicios[inicios.length - 1]!;
  const ventanaDesde = sumarDias(ultimoInicio, Math.max(minima - 3, 15));
  const ventanaHasta = sumarDias(ultimoInicio, maxima + 3);
  const estimadoCrudo = Math.round(promedio);
  const proximoInicioEstimado =
    estimadoCrudo < minima - 3
      ? ventanaDesde
      : estimadoCrudo > maxima + 3
        ? ventanaHasta
        : sumarDias(ultimoInicio, estimadoCrudo);

  return {
    suficiente: true,
    duracionPromedio: Math.round(promedio * 10) / 10,
    duracionMinima: minima,
    duracionMaxima: maxima,
    proximoInicioEstimado,
    ventanaDesde,
    ventanaHasta,
    ciclosContados: duraciones.length,
    irregular,
    motivoIrregularidad,
  };
}

export type EstadoHoy = 'en_ventana' | 'antes_de_ventana' | 'despues_de_ventana' | 'sin_estimacion';

/** Posición de hoy respecto de la ventana estimada (solo informativo). */
export function estadoDeHoy(estimacion: ResultadoCiclo, hoy: string): EstadoHoy {
  if (!estimacion.suficiente) return 'sin_estimacion';
  if (hoy >= estimacion.ventanaDesde && hoy <= estimacion.ventanaHasta) return 'en_ventana';
  if (hoy < estimacion.ventanaDesde) return 'antes_de_ventana';
  return 'despues_de_ventana';
}
