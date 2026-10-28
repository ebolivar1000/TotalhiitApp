/**
 * FASE 7 — Métricas puras de progreso (sin IA, sin juicios).
 * Fórmulas documentadas (D13). Todas las funciones son deterministas y
 * aceptan el día de referencia inyectado para poder probarse.
 */

import type { EntradaDiario } from '../datos/entidades';
import { fechaAiso, isoAFecha } from '../utilidades/fechas';

export type CampoDiario = 'energiaNivel' | 'animoNivel' | 'horasSueno' | 'calidadSueno' | 'vasosAgua';

const MS_DIA = 86_400_000;

/** Suma (o resta) días calendario a una fecha ISO sin timezone. */
export function sumarDias(iso: string, dias: number): string {
  const fecha = isoAFecha(iso);
  fecha.setDate(fecha.getDate() + dias);
  return fechaAiso(fecha);
}

/** Cantidad de días calendario entre dos fechas ISO (positiva si hasta > desde). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((isoAFecha(hasta).getTime() - isoAFecha(desde).getTime()) / MS_DIA);
}

/** Lunes de la semana a la que pertenece la fecha ISO. */
export function lunesDeSemana(iso: string): string {
  const fecha = isoAFecha(iso);
  const diaSemana = (fecha.getDay() + 6) % 7; // domingo = 6
  fecha.setDate(fecha.getDate() - diaSemana);
  return fechaAiso(fecha);
}

/**
 * Racha de días activos (entrenamiento o registro diario).
 * Fórmula: días consecutivos hasta el último día activo, siempre que ese día
 * sea hoy o ayer (un día de descanso hoy NO rompe la racha); 0 si el último
 * día activo es anterior a ayer.
 */
export function rachaDiasActivos(fechasActivas: string[], hoy: string): number {
  const unicas = Array.from(new Set(fechasActivas)).sort().reverse();
  if (unicas.length === 0) return 0;
  const ultima = unicas[0]!;
  if (ultima !== hoy && ultima !== sumarDias(hoy, -1)) return 0;
  let racha = 1;
  let cursor = ultima;
  for (let i = 1; i < unicas.length; i++) {
    const esperada = sumarDias(cursor, -1);
    if (unicas[i] === esperada) {
      racha++;
      cursor = unicas[i]!;
    } else if (unicas[i]! > esperada) {
      continue; // duplicados/futuros: ignorar
    } else {
      break;
    }
  }
  return racha;
}

/** Promedio simple de un campo diario dentro de una ventana de `dias` hacia atrás desde `hasta`. */
export function promedioUltimosDias(
  entradas: EntradaDiario[],
  campo: CampoDiario,
  dias: number,
  hasta: string,
): number | null {
  const desde = sumarDias(hasta, -(dias - 1));
  const valores = entradas
    .filter((e) => e.fecha >= desde && e.fecha <= hasta && e[campo] !== undefined)
    .map((e) => e[campo] as number);
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export interface TendenciaPeso {
  pesoActual: number;
  pesoAnterior: number;
  /** Redondeado a 1 decimal; negativo = bajó, positivo = subió. */
  deltaKg: number;
  fechaActual: string;
  fechaAnterior: string;
}

/**
 * Tendencia de peso sin juicio: compara el último registro de peso con el más
 * antiguo dentro de una ventana de `dias` (por defecto 30). Requiere al menos
 * 2 registros con peso; si no hay datos suficientes devuelve null.
 */
export function tendenciaPeso(entradas: EntradaDiario[], hasta: string, dias = 30): TendenciaPeso | null {
  const desde = sumarDias(hasta, -dias);
  const conPeso = entradas
    .filter((e) => e.pesoKg !== undefined && e.fecha >= desde && e.fecha <= hasta)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (conPeso.length < 2) return null;
  const anterior = conPeso[0]!;
  const actual = conPeso[conPeso.length - 1]!;
  return {
    pesoActual: actual.pesoKg!,
    pesoAnterior: anterior.pesoKg!,
    deltaKg: Math.round((actual.pesoKg! - anterior.pesoKg!) * 10) / 10,
    fechaActual: actual.fecha,
    fechaAnterior: anterior.fecha,
  };
}

export interface ResumenSemanal {
  /** Lunes de la semana (YYYY-MM-DD). */
  inicio: string;
  /** Días distintos con sesión de entrenamiento registrada. */
  diasActivos: number;
  promedioSueno: number | null;
  promedioEnergia: number | null;
  promedioVasos: number | null;
  /** Cantidad de registros diarios cargados esa semana. */
  registros: number;
}

/** Resúmenes de las últimas `semanas` semanas (lunes a domingo), incluye la semana en curso. */
export function resumenesSemanales(
  entradas: EntradaDiario[],
  fechasSesiones: string[],
  hasta: string,
  semanas: number,
): ResumenSemanal[] {
  const lunesActual = lunesDeSemana(hasta);
  const resultado: ResumenSemanal[] = [];
  for (let i = 0; i < semanas; i++) {
    const inicio = sumarDias(lunesActual, -7 * i);
    const fin = sumarDias(inicio, 6);
    const diasActivos = new Set(fechasSesiones.filter((f) => f >= inicio && f <= fin)).size;
    const deLaSemana = entradas.filter((e) => e.fecha >= inicio && e.fecha <= fin);
    const promedio = (campo: CampoDiario): number | null => {
      const valores = deLaSemana.filter((e) => e[campo] !== undefined).map((e) => e[campo] as number);
      return valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;
    };
    resultado.push({
      inicio,
      diasActivos,
      promedioSueno: promedio('horasSueno'),
      promedioEnergia: promedio('energiaNivel'),
      promedioVasos: promedio('vasosAgua'),
      registros: deLaSemana.length,
    });
  }
  return resultado;
}
