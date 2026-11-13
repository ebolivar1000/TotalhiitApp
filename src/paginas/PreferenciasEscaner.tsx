import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BotonPrimario, ChipsMulti, Tarjeta } from '../componentes/ui';
import { usePerfil } from '../hooks/usePerfil';
import { LISTA_PAISES_DISPONIBLES } from '../lib/escaner/paises';
import { guardarPreferenciasEscaner, obtenerPreferenciasEscaner } from '../lib/escaner/repositorio';
import type { PreferenciasEscaner } from '../lib/escaner/tipos';

const OPCIONES_ALERGENOS = [
  { valor: 'gluten', etiqueta: 'Gluten / TACC' },
  { valor: 'lactosa', etiqueta: 'Lactosa / Lácteos' },
  { valor: 'frutos secos', etiqueta: 'Frutos Secos (Maní/Nueces)' },
  { valor: 'soja', etiqueta: 'Soja y derivados' },
  { valor: 'huevo', etiqueta: 'Huevo' },
  { valor: 'mariscos', etiqueta: 'Pescados y Mariscos' },
  { valor: 'sulfitos', etiqueta: 'Sulfitos' },
];

const OPCIONES_DIETAS = [
  { valor: 'omnivora', etiqueta: 'Omnívora (Estándar)' },
  { valor: 'vegetariana', etiqueta: 'Vegetariana' },
  { valor: 'vegana', etiqueta: 'Vegana' },
  { valor: 'sin_gluten', etiqueta: 'Sin TACC / Celíaca' },
];

const OPCIONES_METAS_ESCANER = [
  { valor: 'bajar_azucar', etiqueta: 'Limitar Azúcares Añadidos' },
  { valor: 'bajar_sodio', etiqueta: 'Cuidar Presión / Bajo Sodio' },
  { valor: 'alta_proteina', etiqueta: 'Priorizar Alimentos Proteicos' },
  { valor: 'evitar_ultraprocesados', etiqueta: 'Evitar Ultraprocesados (NOVA 4)' },
  { valor: 'sin_edulcorantes', etiqueta: 'Evitar Edulcorantes Artificiales' },
];

export default function PreferenciasEscaner() {
  const { perfil } = usePerfil();
  const navigate = useNavigate();
  const userId = perfil?.id || 'usuario_local';

  const [alergenos, setAlergenos] = useState<string[]>([]);
  const [dietas, setDietas] = useState<string[]>([]);
  const [objetivosSalud, setObjetivosSalud] = useState<string[]>([]);
  const [paisNormativa, setPaisNormativa] = useState<string>('auto');
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    async function cargar() {
      const p = await obtenerPreferenciasEscaner(userId);
      if (p) {
        setAlergenos(p.alergenos || []);
        setDietas(p.dietas || []);
        setObjetivosSalud(p.objetivosSalud || []);
        setPaisNormativa(p.paisNormativa || 'auto');
      }
    }
    void cargar();
  }, [userId]);

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefs: PreferenciasEscaner = {
      userId,
      alergenos,
      dietas,
      objetivosSalud,
      paisNormativa,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await guardarPreferenciasEscaner(prefs);
    setGuardado(true);
    setTimeout(() => {
      navigate('/escaner');
    }, 800);
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <Link
          to="/escaner"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black uppercase tracking-wide text-zinc-900">
            Preferencias de Escaneo
          </h1>
          <p className="text-[11px] font-semibold text-zinc-500">
            Alertas de salud personalizadas
          </p>
        </div>
        <div className="h-10 w-10" />
      </div>

      <form onSubmit={manejarGuardar} className="space-y-4">
        {/* 1. Alergias e Intolerancias */}
        <Tarjeta>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Alergias e Intolerancias Críticas
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
            Se mostrará una advertencia roja prioritaria si el producto escaneado contiene o puede contener estos ingredientes:
          </p>
          <div className="mt-3">
            <ChipsMulti
              opciones={OPCIONES_ALERGENOS}
              valor={alergenos}
              onChange={setAlergenos}
            />
          </div>
        </Tarjeta>

        {/* 2. Dieta o Filosofía */}
        <Tarjeta>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Tipo de Dieta
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
            Te alertaremos si el producto incluye derivados cárnicos o de origen animal:
          </p>
          <div className="mt-3">
            <ChipsMulti
              opciones={OPCIONES_DIETAS}
              valor={dietas}
              onChange={setDietas}
            />
          </div>
        </Tarjeta>

        {/* 3. Metas de Supermercado */}
        <Tarjeta>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Prioridades de Salud al Comprar
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
            Personaliza el análisis según lo que más te interesa cuidar en tu alimentación:
          </p>
          <div className="mt-3">
            <ChipsMulti
              opciones={OPCIONES_METAS_ESCANER}
              valor={objetivosSalud}
              onChange={setObjetivosSalud}
            />
          </div>
        </Tarjeta>

        {/* 4. País de Referencia / Normativa de Sellos */}
        <Tarjeta>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌎</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              País y Normativa de Etiquetado
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
            Adapta los sellos de advertencia a la legislación de tu país o déjalo en automático para detectarlo por el código de barras:
          </p>
          <div className="mt-3">
            <select
              value={paisNormativa}
              onChange={(e) => setPaisNormativa(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs font-semibold text-zinc-800 outline-none focus:border-marca-magenta"
            >
              {LISTA_PAISES_DISPONIBLES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.bandera} {p.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </Tarjeta>

        {guardado && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-center text-xs font-bold text-emerald-900">
            ✅ ¡Preferencias guardadas con éxito! Redirigiendo…
          </div>
        )}

        <BotonPrimario type="submit" className="w-full">
          Guardar Preferencias de Escaneo
        </BotonPrimario>
      </form>
    </main>
  );
}
