import type { NivelPuntaje, PuntajeSalud } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface TarjetaPuntajeProps {
  puntaje: PuntajeSalud;
  nutriScore?: 'a' | 'b' | 'c' | 'd' | 'e';
  novaGroup?: 1 | 2 | 3 | 4;
  ecoScore?: 'a' | 'b' | 'c' | 'd' | 'e';
}

const ETIQUETAS_NIVEL: Record<NivelPuntaje, string> = {
  excelente: 'Excelente',
  bueno: 'Bueno',
  mediocre: 'Mediocre',
  malo: 'Malo',
};

const COLOR_CIRCULO: Record<NivelPuntaje, { borde: string; texto: string; fondo: string }> = {
  excelente: {
    borde: 'border-emerald-500',
    texto: 'text-emerald-700',
    fondo: 'bg-emerald-50',
  },
  bueno: {
    borde: 'border-lime-500',
    texto: 'text-lime-700',
    fondo: 'bg-lime-50',
  },
  mediocre: {
    borde: 'border-amber-500',
    texto: 'text-amber-700',
    fondo: 'bg-amber-50',
  },
  malo: {
    borde: 'border-red-500',
    texto: 'text-red-700',
    fondo: 'bg-red-50',
  },
};

const COLORES_NUTRISCORE: Record<string, string> = {
  a: 'bg-emerald-600',
  b: 'bg-lime-500',
  c: 'bg-amber-400 text-zinc-900',
  d: 'bg-orange-500',
  e: 'bg-red-600',
};

const ETIQUETAS_NOVA: Record<number, { etiqueta: string; color: string; desc: string }> = {
  1: {
    etiqueta: 'NOVA 1',
    color: 'bg-emerald-600 text-white',
    desc: 'Sin procesar o mínimamente procesado',
  },
  2: {
    etiqueta: 'NOVA 2',
    color: 'bg-lime-600 text-white',
    desc: 'Ingrediente culinario procesado',
  },
  3: {
    etiqueta: 'NOVA 3',
    color: 'bg-amber-500 text-zinc-950',
    desc: 'Alimento procesado tradicional',
  },
  4: {
    etiqueta: 'NOVA 4',
    color: 'bg-red-600 text-white',
    desc: 'Alimento ultraprocesado industrial',
  },
};

export default function TarjetaPuntaje({
  puntaje,
  nutriScore,
  novaGroup,
  ecoScore,
}: TarjetaPuntajeProps) {
  const estilo = COLOR_CIRCULO[puntaje.nivel];

  return (
    <Tarjeta className="border-2 border-zinc-200/80 bg-white shadow-md">
      {/* Cabecera con Círculo de Nota y Resumen */}
      <div className="flex items-center gap-4">
        {/* Círculo Principal de Calificación (0 a 100) */}
        <div
          className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 ${estilo.borde} ${estilo.fondo} shadow-inner`}
        >
          <span className={`text-2xl font-black ${estilo.texto}`}>{puntaje.puntos}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            /100
          </span>
        </div>

        {/* Nivel y Frase resumen */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wide ${estilo.fondo} ${estilo.texto} border ${estilo.borde}`}
            >
              {ETIQUETAS_NIVEL[puntaje.nivel]}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-zinc-900 leading-snug">
            {puntaje.fraseResumen}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Ponderación: Nutrientes (60%) · NOVA (25%) · Aditivos (15%)
          </p>
        </div>
      </div>

      {/* Badges Oficiales: Nutri-Score, NOVA y Eco-Score */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
        {/* Nutri-Score */}
        {nutriScore && (
          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-[11px] shadow-2xs">
            <span className="px-1.5 font-bold text-zinc-600">Nutri-Score:</span>
            <span
              className={`rounded px-1.5 py-0.5 font-black uppercase text-white ${
                COLORES_NUTRISCORE[nutriScore] || 'bg-zinc-500'
              }`}
            >
              {nutriScore.toUpperCase()}
            </span>
          </div>
        )}

        {/* Grupo NOVA */}
        {novaGroup && ETIQUETAS_NOVA[novaGroup] && (
          <div
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-[11px] shadow-2xs"
            title={ETIQUETAS_NOVA[novaGroup].desc}
          >
            <span
              className={`rounded px-1.5 py-0.5 font-black ${ETIQUETAS_NOVA[novaGroup].color}`}
            >
              {ETIQUETAS_NOVA[novaGroup].etiqueta}
            </span>
            <span className="pr-1 text-xs text-zinc-700 font-medium">
              {novaGroup === 4 ? 'Ultraprocesado' : 'Alimento real'}
            </span>
          </div>
        )}

        {/* Eco-Score */}
        {ecoScore && (
          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-[11px] shadow-2xs">
            <span className="px-1.5 font-bold text-zinc-600">Eco-Score:</span>
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-black uppercase text-white">
              {ecoScore.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Desglose de Puntos en Barras Sencillas */}
      <div className="mt-3.5 space-y-2 rounded-xl bg-zinc-50 p-2.5 text-[11px]">
        {/* Nutricional */}
        <div>
          <div className="flex justify-between font-medium text-zinc-700">
            <span>Calidad Nutricional</span>
            <span className="font-bold text-zinc-900">{puntaje.desglose.nutricional} / 60 pts</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(puntaje.desglose.nutricional / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Grado NOVA */}
        <div>
          <div className="flex justify-between font-medium text-zinc-700">
            <span>Nivel de Procesamiento (NOVA)</span>
            <span className="font-bold text-zinc-900">{puntaje.desglose.procesamientoNova} / 25 pts</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${(puntaje.desglose.procesamientoNova / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Aditivos */}
        <div>
          <div className="flex justify-between font-medium text-zinc-700">
            <span>Seguridad de Aditivos</span>
            <span className="font-bold text-zinc-900">{puntaje.desglose.aditivos} / 15 pts</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${(puntaje.desglose.aditivos / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Tarjeta>
  );
}
