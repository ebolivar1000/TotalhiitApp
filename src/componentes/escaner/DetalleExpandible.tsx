import { useState } from 'react';
import type { AditivoAnalizado, NutrientesPor100 } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface DetalleExpandibleProps {
  nutrientes: NutrientesPor100;
  ingredientesTexto?: string;
  aditivos: AditivoAnalizado[];
  esLiquido?: boolean;
}

export default function DetalleExpandible({
  nutrientes,
  ingredientesTexto,
  aditivos,
  esLiquido = false,
}: DetalleExpandibleProps) {
  const [abierto, setAbierto] = useState(false);
  const unidad = esLiquido ? 'ml' : 'g';

  const BADGE_RIESGO = {
    sin_riesgo: {
      fondo: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icono: '🟢',
      etiqueta: 'Sin riesgo comprobado',
    },
    precaucion: {
      fondo: 'bg-amber-100 text-amber-800 border-amber-300',
      icono: '🟡',
      etiqueta: 'Consumir con precaución',
    },
    evitar: {
      fondo: 'bg-red-100 text-red-800 border-red-300',
      icono: '🔴',
      etiqueta: 'Recomendable evitar',
    },
  };

  return (
    <Tarjeta className="overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center justify-between text-left text-xs font-bold text-zinc-900 transition hover:text-marca-magenta"
      >
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            🔬
          </span>
          <span className="uppercase tracking-wide">
            Detalle Técnico y Científico (Expandible)
          </span>
        </div>
        <span className="text-lg font-mono">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="mt-4 space-y-5 border-t border-zinc-100 pt-4 text-xs">
          {/* 1. TABLA NUTRICIONAL DETALLADA */}
          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span>📊</span>
              <span>Tabla Nutricional Completa</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Valores medios por 100 {unidad}</p>

            <div className="mt-2 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/50">
              <div className="flex justify-between px-3 py-2 text-zinc-700 font-semibold">
                <span>Valor Energético (Calorías)</span>
                <span className="font-bold text-zinc-900">{nutrientes.caloriasKcal} kcal</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-700">
                <span>Grasas Totales</span>
                <span>{nutrientes.grasasTotalesG} g</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-600 pl-6 text-[11px]">
                <span>de las cuales saturadas</span>
                <span>{nutrientes.grasasSaturadasG} g</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-700">
                <span>Azúcares</span>
                <span>{nutrientes.azucaresG} g</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-700">
                <span>Proteínas</span>
                <span>{nutrientes.proteinasG || 0} g</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-700">
                <span>Fibra alimentaria</span>
                <span>{nutrientes.fibraG || 0} g</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-zinc-700">
                <span>Sodio</span>
                <span>{nutrientes.sodioMg} mg</span>
              </div>
              {nutrientes.salG !== undefined && (
                <div className="flex justify-between px-3 py-2 text-zinc-600 pl-6 text-[11px]">
                  <span>Sal equivalente</span>
                  <span>{nutrientes.salG.toFixed(2)} g</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. LISTA DE INGREDIENTES */}
          {ingredientesTexto && (
            <div>
              <h3 className="font-bold text-zinc-900 flex items-center gap-1.5">
                <span>📜</span>
                <span>Lista Completa de Ingredientes</span>
              </h3>
              <p className="mt-1.5 rounded-xl border border-zinc-200 bg-white p-3 text-[11px] leading-relaxed text-zinc-700">
                {ingredientesTexto}
              </p>
            </div>
          )}

          {/* 3. EVALUACIÓN CIENTÍFICA DE ADITIVOS */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-1.5">
                <span>🧪</span>
                <span>Aditivos Detectados ({aditivos.length})</span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Evaluación pedagógica basada en EFSA/OMS (evitando alarmismo injustificado).
            </p>

            {aditivos.length === 0 ? (
              <p className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-900">
                ✅ No se detectaron aditivos artificiales en la fórmula de este producto.
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {aditivos.map((aditivo, idx) => {
                  const riesgo = BADGE_RIESGO[aditivo.nivelRiesgo] || BADGE_RIESGO.sin_riesgo;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-zinc-900 text-xs">
                            {aditivo.codigo}
                          </span>
                          <span className="text-[11px] text-zinc-600 font-medium">
                            · {aditivo.nombre}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${riesgo.fondo}`}
                        >
                          {riesgo.icono} {riesgo.etiqueta}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-700 leading-relaxed">
                        {aditivo.explicacion}
                      </p>

                      {aditivo.consensoCientifico && (
                        <p className="text-[10px] text-zinc-500 italic">
                          Consenso: {aditivo.consensoCientifico}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Tarjeta>
  );
}
