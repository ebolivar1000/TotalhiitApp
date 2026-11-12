import type { LeyendaPrecautoria, OctogonoArgentina } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface OctogonosArgentinaProps {
  octogonos: OctogonoArgentina[];
  leyendas: LeyendaPrecautoria[];
}

export default function OctogonosArgentina({ octogonos, leyendas }: OctogonosArgentinaProps) {
  const tieneSellos = octogonos.length > 0 || leyendas.length > 0;

  if (!tieneSellos) {
    return (
      <Tarjeta className="border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <span className="text-base">✅</span>
          <span>Sin sellos negros de advertencia (Ley 27.642)</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
          Este producto no supera los límites críticos de azúcares libres, grasas totales, grasas saturadas, sodio ni calorías según el modelo oficial de etiquetado frontal.
        </p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="border-2 border-zinc-900 bg-zinc-950 p-4 text-white shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🛑</span>
          <p className="text-xs font-black uppercase tracking-wider text-white">
            Sellos de Advertencia (Ley 27.642)
          </p>
        </div>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
          Argentina
        </span>
      </div>

      {/* Cuadrícula de Octógonos Negros */}
      {octogonos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {octogonos.map((oct) => (
            <div
              key={oct.tipo}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-white bg-black p-2.5 text-center shadow transition hover:scale-105"
            >
              {/* Formato clásico de octógono */}
              <p className="text-[11px] font-black uppercase leading-tight tracking-tight text-white">
                {oct.titulo}
              </p>
              <span className="mt-1 text-[8px] font-semibold uppercase text-zinc-400">
                Ministerio de Salud
              </span>

              {/* Tooltip con el umbral superado */}
              <div className="mt-1 text-[9px] text-zinc-300 opacity-80">
                {oct.umbralSuperado}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leyendas Precautorias Rectangulares (Edulcorantes y Cafeína) */}
      {leyendas.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {leyendas.map((ley, idx) => (
            <div
              key={idx}
              className="rounded-lg border-2 border-white bg-black px-3 py-1.5 text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-white">
                {ley.texto}
              </p>
              <span className="text-[8px] text-zinc-400">Ministerio de Salud</span>
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}
