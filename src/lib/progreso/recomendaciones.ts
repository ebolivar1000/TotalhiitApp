/**
 * FASE 7 — Sugerencias del dashboard (criterio 3 de FASE 7).
 * Reglas deterministas (sin IA), tono positivo, sin puntuaciones ni
 * culpabilización (criterio 4). Máximo 3, en orden fijo.
 */

import type { EntradaDiario } from '../datos/entidades';
import { promedioUltimosDias, diasEntre } from './metricas';

export interface ContextoSugerencias {
  hoy: string;
  entradas: EntradaDiario[];
  sesionesUltimos7Dias: number;
  sesionesSemanaPasada: number;
  vasosHoy: number | undefined;
  /** Meta estimada con la fórmula de hidratación (35 ml/kg → vasos de 250 ml). */
  metaVasos: number;
  ultimaFechaPeso: string | undefined;
  /** Nombre de la sesión sugerida por el orden por objetivo (motor de entrenamiento). */
  sugerenciaEntrenamiento: string;
  /** Nombre de la receta sugerida por el motor de nutrición. */
  sugerenciaReceta: string;
}

export interface Sugerencia {
  id: 'entrenamiento' | 'hidratacion' | 'sueno' | 'peso' | 'receta';
  icono: string;
  titulo: string;
  detalle: string;
}

export function sugerenciasDashboard(ctx: ContextoSugerencias): Sugerencia[] {
  const lista: Sugerencia[] = [];

  // 1) Entrenamiento — comparar contra la semana pasada, sin culpa.
  if (ctx.sesionesUltimos7Dias === 0) {
    lista.push({
      id: 'entrenamiento',
      icono: '🏃‍♀️',
      titulo: `Empezá de nuevo con: ${ctx.sugerenciaEntrenamiento}`,
      detalle: 'Un día (o varios) sin entrenar no borra tu progreso. Retomá con una sesión corta de hoy.',
    });
  } else if (ctx.sesionesUltimos7Dias < ctx.sesionesSemanaPasada) {
    lista.push({
      id: 'entrenamiento',
      icono: '📅',
      titulo: 'Sumá una sesión más esta semana',
      detalle: `Vas ${ctx.sesionesUltimos7Dias} en los últimos 7 días vs ${ctx.sesionesSemanaPasada} la semana anterior.`,
    });
  }

  // 2) Hidratación — solo si registró vasos y quedó debajo de la meta.
  if (ctx.vasosHoy !== undefined && ctx.vasosHoy < ctx.metaVasos) {
    lista.push({
      id: 'hidratacion',
      icono: '💧',
      titulo: `Vas ${ctx.vasosHoy} de ~${ctx.metaVasos} vasos de agua`,
      detalle: `Te faltan ${ctx.metaVasos - ctx.vasosHoy} vasos (250 ml) para la meta estimada según tu peso.`,
    });
  }

  // 3) Sueño — promedio de los últimos 7 días con datos.
  const promedioSueno = promedioUltimosDias(ctx.entradas, 'horasSueno', 7, ctx.hoy);
  if (promedioSueno !== null && promedioSueno < 7) {
    lista.push({
      id: 'sueno',
      icono: '🌙',
      titulo: `Dormís ~${promedioSueno.toFixed(1)} h por noche`,
      detalle:
        'Con menos de 7 h el cuerpo recupera peor las sesiones. Adelantar 20 minutos la hora de dormir ya se nota.',
    });
  }

  // 4) Peso — invitar a registrar si pasaron más de 14 días (o nunca se registró).
  if (ctx.ultimaFechaPeso === undefined || diasEntre(ctx.ultimaFechaPeso, ctx.hoy) > 14) {
    lista.push({
      id: 'peso',
      icono: '⚖️',
      titulo: 'Registrá tu peso de esta semana',
      detalle: 'Con 2 o más registros aparece la tendencia (comparada con el mes anterior, sin juicios).',
    });
  }

  // 5) Receta sugerida por el motor de nutrición (siempre disponible como cierre).
  lista.push({
    id: 'receta',
    icono: '🥗',
    titulo: `Cociná algo alineado a tu objetivo: ${ctx.sugerenciaReceta}`,
    detalle: 'Sugerida por tu objetivo y preferencias (alérgenos y presupuesto aplicados).',
  });

  return lista.slice(0, 3);
}
