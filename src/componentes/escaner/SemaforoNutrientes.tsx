import type { EquivalenciaCotidiana, NutrientesPor100 } from '../../lib/escaner/tipos';
import { Tarjeta } from '../ui';

interface SemaforoNutrientesProps {
  nutrientes: NutrientesPor100;
  equivalencias: EquivalenciaCotidiana;
  esLiquido?: boolean;
  datosIncompletos?: boolean;
  perfilInferido?: boolean;
}

interface ItemSemaforo {
  nombre: string;
  icono: string;
  cantidad: string;
  nivel: 'bajo' | 'medio' | 'alto';
  color: string;
  borde: string;
  fondo: string;
  equivalencia?: string;
}

export default function SemaforoNutrientes({
  nutrientes,
  equivalencias,
  esLiquido = false,
  datosIncompletos = false,
  perfilInferido = false,
}: SemaforoNutrientesProps) {
  const unidad = esLiquido ? 'ml' : 'g';

  // 1. Azúcares
  const azucares = nutrientes.azucaresG || 0;
  let nivelAzucar: 'bajo' | 'medio' | 'alto' = 'bajo';
  if (esLiquido) {
    if (azucares > 5) nivelAzucar = 'alto';
    else if (azucares > 2.5) nivelAzucar = 'medio';
  } else {
    if (azucares > 12) nivelAzucar = 'alto';
    else if (azucares > 5) nivelAzucar = 'medio';
  }

  // 2. Grasas Totales
  const grasasTot = nutrientes.grasasTotalesG || 0;
  let nivelGrasasTot: 'bajo' | 'medio' | 'alto' = 'bajo';
  if (grasasTot > 17.5) nivelGrasasTot = 'alto';
  else if (grasasTot > 3) nivelGrasasTot = 'medio';

  // 3. Grasas Saturadas
  const grasasSat = nutrientes.grasasSaturadasG || 0;
  let nivelGrasasSat: 'bajo' | 'medio' | 'alto' = 'bajo';
  if (grasasSat > 5) nivelGrasasSat = 'alto';
  else if (grasasSat > 1.5) nivelGrasasSat = 'medio';

  // 4. Sal / Sodio
  const sodio = nutrientes.sodioMg || 0;
  let nivelSodio: 'bajo' | 'medio' | 'alto' = 'bajo';
  if (sodio > 500) nivelSodio = 'alto';
  else if (sodio > 120) nivelSodio = 'medio';

  const coloresPorNivel = {
    bajo: {
      color: 'text-emerald-700',
      borde: 'border-emerald-200',
      fondo: 'bg-emerald-50',
    },
    medio: {
      color: 'text-amber-700',
      borde: 'border-amber-200',
      fondo: 'bg-amber-50',
    },
    alto: {
      color: 'text-red-700',
      borde: 'border-red-200',
      fondo: 'bg-red-50',
    },
  };

  const items: ItemSemaforo[] = [
    {
      nombre: 'Azúcares',
      icono: '🍬',
      cantidad: `${azucares.toFixed(1)} g`,
      nivel: nivelAzucar,
      ...coloresPorNivel[nivelAzucar],
      equivalencia:
        equivalencias.cucharaditasAzucar > 0.3
          ? `~${equivalencias.cucharaditasAzucar} cucharadita${equivalencias.cucharaditasAzucar === 1 ? '' : 's'}`
          : 'Poco azúcar',
    },
    {
      nombre: 'Sal / Sodio',
      icono: '🧂',
      cantidad: `${sodio} mg`,
      nivel: nivelSodio,
      ...coloresPorNivel[nivelSodio],
      equivalencia:
        equivalencias.gramosSal > 0.2 ? `~${equivalencias.gramosSal} g de sal` : 'Bajo en sal',
    },
    {
      nombre: 'Grasas Sat.',
      icono: '🧈',
      cantidad: `${grasasSat.toFixed(1)} g`,
      nivel: nivelGrasasSat,
      ...coloresPorNivel[nivelGrasasSat],
      equivalencia: nivelGrasasSat === 'bajo' ? 'Saludable' : 'Consumo moderado',
    },
    {
      nombre: 'Grasas Tot.',
      icono: '🥑',
      cantidad: `${grasasTot.toFixed(1)} g`,
      nivel: nivelGrasasTot,
      ...coloresPorNivel[nivelGrasasTot],
      equivalencia: nivelGrasasTot === 'alto' ? 'Elevado' : 'Equilibrado',
    },
  ];

  return (
    <Tarjeta>
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
          Semáforo Nutricional (por 100 {unidad})
        </h2>
        <span className="text-[11px] font-semibold text-zinc-500">
          🔥 {nutrientes.caloriasKcal} kcal
        </span>
      </div>

      {perfilInferido && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 border border-amber-200">
          💡 Valores estimados según categoría (Open Food Facts no tenía la tabla cargada).
        </div>
      )}

      {datosIncompletos && !perfilInferido && (
        <div className="mt-2 rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600 border border-zinc-200">
          ⚠️ Tabla no informada en el registro colaborativo (valores en 0).
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-xl border p-2.5 text-center ${item.fondo} ${item.borde}`}
          >
            <div>
              <span className="text-base" aria-hidden="true">
                {item.icono}
              </span>
              <p className="text-[11px] font-semibold text-zinc-600">{item.nombre}</p>
              <p className={`mt-0.5 text-sm font-black ${item.color}`}>{item.cantidad}</p>
            </div>
            {item.equivalencia && (
              <span className="mt-1.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 shadow-2xs">
                {item.equivalencia}
              </span>
            )}
          </div>
        ))}
      </div>
    </Tarjeta>
  );
}
