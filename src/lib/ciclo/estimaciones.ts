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
  /** Variación promedio típica de duración en días (desviación media absoluta). */
  variacionPromedio: number;
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
  const variacionMedia = duraciones.reduce((acc, d) => acc + Math.abs(d - promedio), 0) / duraciones.length;
  const variacionPromedio = Math.round(variacionMedia * 10) / 10;

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
    variacionPromedio: variacionPromedio === 0 ? 1 : variacionPromedio,
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

export type FaseCiclo = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea';

export interface InfoSemanaCiclo {
  diaCiclo: number;
  semana: 1 | 2 | 3 | 4;
  fase: FaseCiclo;
  nombreFase: string;
  icono: string;
  colorClase: string;
  colorBorde: string;
  colorBg: string;
  descripcionFase: string;
  recomendacionTotalhiit: string;
  semanaVideo: '1' | '2' | '3' | '4';
}

/** Determina la semana y fase del ciclo actual según el último inicio de sangrado. */
export function calcularSemanaCiclo(ultimoInicio: string, hoy: string): InfoSemanaCiclo {
  const diff = diasEntre(ultimoInicio, hoy);
  const diaCiclo = Math.max(1, diff + 1);

  if (diaCiclo <= 7) {
    return {
      diaCiclo,
      semana: 1,
      fase: 'menstrual',
      nombreFase: 'Fase Menstrual',
      icono: '🩸',
      colorClase: 'text-rose-600',
      colorBorde: 'border-rose-400',
      colorBg: 'bg-rose-50',
      descripcionFase: 'Tus niveles hormonales están bajos y tu cuerpo prioriza regeneración celular.',
      recomendacionTotalhiit: 'Entrenamientos suaves, bajo impacto o sesiones de estiramientos regenerativos.',
      semanaVideo: '1',
    };
  }

  if (diaCiclo <= 14) {
    return {
      diaCiclo,
      semana: 2,
      fase: 'folicular',
      nombreFase: 'Fase Folicular',
      icono: '🌱',
      colorClase: 'text-emerald-600',
      colorBorde: 'border-emerald-400',
      colorBg: 'bg-emerald-50',
      descripcionFase: 'Aumento progresivo de estrógenos y energía. Mayor resistencia a la fatiga muscular.',
      recomendacionTotalhiit: 'Momento óptimo para fuerza progresiva y tonificación muscular.',
      semanaVideo: '2',
    };
  }

  if (diaCiclo <= 21) {
    return {
      diaCiclo,
      semana: 3,
      fase: 'ovulatoria',
      nombreFase: 'Fase Ovulatoria',
      icono: '⚡',
      colorClase: 'text-amber-600',
      colorBorde: 'border-amber-400',
      colorBg: 'bg-amber-50',
      descripcionFase: 'Pico de vitalidad y fuerza muscular. Tu cuerpo responde con máxima potencia.',
      recomendacionTotalhiit: 'Máxima energía para sesiones HIIT intensas y estímulo cardiovascular.',
      semanaVideo: '3',
    };
  }

  return {
    diaCiclo,
    semana: 4,
    fase: 'lutea',
    nombreFase: 'Fase Lútea / Premenstrual',
    icono: '🌙',
    colorClase: 'text-purple-600',
    colorBorde: 'border-purple-400',
    colorBg: 'bg-purple-50',
    descripcionFase: 'Aumento de progesterona. El metabolismo se eleva ligeramente; prioriza constancia.',
    recomendacionTotalhiit: 'Ritmo moderado, ejercicios controlados y descanso reparador.',
    semanaVideo: '4',
  };
}

export interface CicloMesHistorial {
  mesNombre: string;
  anio: number;
  inicio: string;
  fin: string;
  diasSangrado: number;
  duracionCicloDias: number | null;
  esRegular: boolean;
}

/** Construye un seguimiento estructurado mes a mes de los ciclos registrados. */
export function construirHistorialMesAMes(episodios: EpisodioSangrado[]): CicloMesHistorial[] {
  if (episodios.length === 0) return [];
  const ordenados = [...episodios].sort((a, b) => b.inicio.localeCompare(a.inicio));

  return ordenados.map((ep, idx) => {
    const fecha = new Date(ep.inicio + 'T00:00:00');
    const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const anio = fecha.getFullYear();

    let duracionCicloDias: number | null = null;
    const epAnterior = ordenados[idx + 1];
    if (epAnterior) {
      duracionCicloDias = diasEntre(epAnterior.inicio, ep.inicio);
    }

    const esRegular = duracionCicloDias !== null ? duracionCicloDias >= 21 && duracionCicloDias <= 35 : true;

    return {
      mesNombre: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
      anio,
      inicio: ep.inicio,
      fin: ep.fin,
      diasSangrado: ep.diasSangrado,
      duracionCicloDias,
      esRegular,
    };
  });
}
