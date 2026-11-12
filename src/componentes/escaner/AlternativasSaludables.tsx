import { Link } from 'react-router';
import type { AlternativaSaludable } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface AlternativasSaludablesProps {
  alternativas: AlternativaSaludable[];
  categoriaNombre?: string;
}

const BADGES_NIVEL = {
  excelente: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  bueno: 'bg-lime-100 text-lime-800 border-lime-300',
  mediocre: 'bg-amber-100 text-amber-800 border-amber-300',
  malo: 'bg-red-100 text-red-800 border-red-300',
};

export default function AlternativasSaludables({
  alternativas,
  categoriaNombre,
}: AlternativasSaludablesProps) {
  if (!alternativas || alternativas.length === 0) return null;

  return (
    <Tarjeta className="border-2 border-emerald-300/80 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            🌱
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wide text-emerald-950">
            Alternativas Más Saludables
          </h2>
        </div>
        {categoriaNombre && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            {categoriaNombre}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-zinc-600">
        Opciones de la misma categoría con mejor perfil nutricional y menos aditivos:
      </p>

      <div className="mt-3 space-y-2">
        {alternativas.map((alt) => (
          <Link
            key={alt.codigoBarras}
            to={`/escaner/producto/${alt.codigoBarras}`}
            className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-2.5 shadow-2xs transition hover:border-emerald-400 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {alt.imagenUrl ? (
                <img
                  src={alt.imagenUrl}
                  alt={alt.nombre}
                  className="h-12 w-12 shrink-0 rounded-lg object-contain bg-zinc-50 border border-zinc-100 p-0.5"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-lg">
                  🥗
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-marca-magenta">
                  {alt.nombre}
                </p>
                {alt.marca && (
                  <p className="text-[10px] text-zinc-500 font-medium truncate">{alt.marca}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-black border ${
                    BADGES_NIVEL[alt.nivel] || BADGES_NIVEL.bueno
                  }`}
                >
                  {alt.puntaje}/100
                </span>
              </div>
              <span className="text-zinc-400 group-hover:text-zinc-600 text-xs">→</span>
            </div>
          </Link>
        ))}
      </div>
    </Tarjeta>
  );
}
