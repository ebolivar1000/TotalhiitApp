import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EntradaTexto, Tarjeta } from '../componentes/ui';
import type { Favorito, RecipePreparation } from '../lib/datos/entidades';
import { ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { alternarFavorito, favoritosDe, preparacionesDe } from '../lib/datos/repositorio';
import {
  CATALOGO_RECETAS,
  ETIQUETAS_CATEGORIA_RECETA,
  ICONO_CATEGORIA_RECETA,
  type CategoriaReceta,
} from '../lib/nutricion/recetas';
import { filtrarRecetas, ordenarPorObjetivo } from '../lib/nutricion/motor';
import { usePerfil } from '../hooks/usePerfil';

export default function Nutricion() {
  const { cargando, perfil, preferencias, objetivo } = usePerfil();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<CategoriaReceta | null>(null);
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [preparadas, setPreparadas] = useState<RecipePreparation[]>([]);

  const recargar = async () => {
    if (!perfil) return;
    const [favs, preps] = await Promise.all([favoritosDe(perfil.id, 'receta'), preparacionesDe(perfil.id)]);
    setFavoritas(new Set(favs.map((f: Favorito) => f.refId)));
    setPreparadas(preps);
  };

  useEffect(() => {
    void recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.id]);

  const conMotor = useMemo(
    () =>
      filtrarRecetas(CATALOGO_RECETAS, {
        alergenos: preferencias?.alergenos ?? [],
        exclusiones: preferencias?.exclusiones ?? [],
        tiempoMaxMin: preferencias?.tiempoCocinaMaxMin ?? null,
        presupuesto: preferencias?.presupuesto ?? null,
      }),
    [preferencias],
  );
  const filtradas = useMemo(() => {
    let lista = ordenarPorObjetivo(
      filtrarRecetas(conMotor, { categoria, ingrediente: busqueda.trim() || null }),
      objetivo?.tipo ?? null,
    );
    if (soloFavoritas) lista = lista.filter((r) => favoritas.has(r.id));
    return lista;
  }, [conMotor, categoria, busqueda, objetivo, soloFavoritas, favoritas]);

  const ocultasPorMotor = CATALOGO_RECETAS.length - conMotor.length;
  const conteoPreparadas = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of preparadas) mapa.set(p.recetaId, (mapa.get(p.recetaId) ?? 0) + 1);
    return mapa;
  }, [preparadas]);

  const alternarFav = async (id: string) => {
    if (!perfil) return;
    await alternarFavorito(perfil.id, 'receta', id);
    await recargar();
  };

  if (cargando || !perfil) return null;

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Nutrición</h1>
          <p className="text-sm text-zinc-500">
            {objetivo ? `Ordenadas para: ${ETIQUETAS_OBJETIVO[objetivo.tipo]}` : 'Elegí tu objetivo para priorizarlas'}
          </p>
        </div>
        <Link to="/perfil/editar" className="shrink-0 text-xs font-semibold text-marca-magenta">
          Mis preferencias
        </Link>
      </div>

      {(preferencias?.alergenos.length ?? 0) > 0 && (
        <Tarjeta className="border-green-200 bg-green-50">
          <p className="text-xs leading-relaxed text-green-800">
            🛡️ El motor <strong>nunca</strong> sugiere recetas con tus alérgenos ({preferencias?.alergenos.join(', ')}) ni
            tus exclusiones. {ocultasPorMotor} receta{ocultasPorMotor === 1 ? ' oculta' : 's ocultas'} por tus preferencias.
          </p>
        </Tarjeta>
      )}

      <EntradaTexto
        placeholder="¿Qué tenés en casa? Ej: espinaca"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar por ingrediente"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setCategoria(null)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === null ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
        >
          Todas
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA_RECETA) as CategoriaReceta[]).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCategoria(categoria === c ? null : c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === c ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
          >
            <span aria-hidden="true" className="mr-1">
              {ICONO_CATEGORIA_RECETA[c]}
            </span>
            {ETIQUETAS_CATEGORIA_RECETA[c]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSoloFavoritas(!soloFavoritas)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${soloFavoritas ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
        >
          ⭐ Favoritas
        </button>
      </div>

      <div className="space-y-3">
        {filtradas.map((r) => (
          <Tarjeta key={r.id} className="relative">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/nutricion/${r.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/nutricion/${r.id}`)}
              className="flex cursor-pointer items-start gap-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marca-crema to-white text-2xl">
                <span aria-hidden="true">{ICONO_CATEGORIA_RECETA[r.categoria]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{r.nombre}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{r.descripcion}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">
                    {r.macrosPorPorcion.kcal} kcal
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                    {r.macrosPorPorcion.proteinaG} g prot.
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">{r.tiempoMin} min</span>
                  {objetivo && r.objetivosCompatibles.includes(objetivo.tipo) && (
                    <span className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">
                      Para tu objetivo
                    </span>
                  )}
                  {(conteoPreparadas.get(r.id) ?? 0) > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                      ✓ Preparada {conteoPreparadas.get(r.id)}×
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label={favoritas.has(r.id) ? 'Quitar de favoritas' : 'Agregar a favoritas'}
              onClick={() => void alternarFav(r.id)}
              className={`absolute right-3 top-3 text-xl transition-transform active:scale-90 ${favoritas.has(r.id) ? 'opacity-100' : 'opacity-30'}`}
            >
              {favoritas.has(r.id) ? '⭐' : '☆'}
            </button>
          </Tarjeta>
        ))}
        {filtradas.length === 0 && (
          <Tarjeta className="text-center">
            <p className="text-sm text-zinc-500">No hay recetas con esos filtros. Probá quitando alguno.</p>
          </Tarjeta>
        )}
      </div>

      <p className="text-center text-xs text-zinc-400">
        Valores nutricionales aproximados (elaborados con tablas de dominio público USDA FoodData Central).
        No constituyen indicación clínica.
      </p>
    </main>
  );
}
