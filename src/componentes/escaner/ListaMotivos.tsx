import type { MotivoPuntaje } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface ListaMotivosProps {
  motivos: MotivoPuntaje[];
}

export default function ListaMotivos({ motivos }: ListaMotivosProps) {
  if (!motivos || motivos.length === 0) return null;

  return (
    <Tarjeta>
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
        <span className="text-base" aria-hidden="true">
          💡
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
          ¿Por qué tiene este puntaje? (Razones clave)
        </h2>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        {motivos.map((motivo, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-xl border p-2.5 ${
              motivo.tipo === 'positivo'
                ? 'border-emerald-200 bg-emerald-50/60'
                : motivo.tipo === 'negativo'
                  ? 'border-red-200 bg-red-50/60'
                  : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <span className="text-lg shrink-0" aria-hidden="true">
              {motivo.icono}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`font-bold ${
                  motivo.tipo === 'positivo'
                    ? 'text-emerald-950'
                    : motivo.tipo === 'negativo'
                      ? 'text-red-950'
                      : 'text-zinc-900'
                }`}
              >
                {motivo.titulo}
              </p>
              <p className="mt-0.5 text-zinc-600 leading-relaxed text-[11px]">
                {motivo.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
}
