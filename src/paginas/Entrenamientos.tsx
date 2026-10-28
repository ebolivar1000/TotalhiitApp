import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Tarjeta } from '../componentes/ui';
import { ETIQUETAS_NIVEL_ACTIVIDAD, ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import {
  alternarFavorito,
  favoritosDe,
  sesionesDeUsuario,
} from '../lib/datos/repositorio';
import type { Favorito, WorkoutSession } from '../lib/datos/entidades';
import {
  CATALOGO_SESIONES,
  ETIQUETAS_CATEGORIA,
  ICONO_CATEGORIA,
  ETIQUETAS_NIVEL_SESION,
  obtenerSesion,
  type CategoriaSesion,
} from '../lib/entrenamiento/sesiones';
import { equipoDisponible, filtrarSesiones, ordenarPorObjetivo } from '../lib/entrenamiento/filtros';
import { usePerfil } from '../hooks/usePerfil';

const DURACIONES = [null, 15, 25, 35] as const;

export default function Entrenamientos() {
  const { cargando, perfil, objetivo } = usePerfil();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<CategoriaSesion | null>(null);
  const [duracionMax, setDuracionMax] = useState<number | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [historial, setHistorial] = useState<WorkoutSession[]>([]);

  const recargarDatos = async () => {
    if (!perfil) return;
    const [favs, sesiones] = await Promise.all([favoritosDe(perfil.id, 'sesion'), sesionesDeUsuario(perfil.id)]);
    setFavoritos(new Set(favs.map((f: Favorito) => f.refId)));
    setHistorial(sesiones);
  };

  useEffect(() => {
    void recargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.id]);

  const conEquipo = useMemo(
    () => CATALOGO_SESIONES.filter((s) => equipoDisponible(s, perfil?.equipamiento)),
    [perfil],
  );
  const filtradas = useMemo(
    () =>
      ordenarPorObjetivo(
        filtrarSesiones(conEquipo, { categoria, duracionMaxMin: duracionMax }),
        objetivo?.tipo ?? null,
      ),
    [conEquipo, categoria, duracionMax, objetivo],
  );
  const ocultasPorEquipo = CATALOGO_SESIONES.length - conEquipo.length;
  const conteo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of historial) mapa.set(s.workoutId, (mapa.get(s.workoutId) ?? 0) + 1);
    return mapa;
  }, [historial]);

  const alternarFav = async (id: string) => {
    if (!perfil) return;
    await alternarFavorito(perfil.id, 'sesion', id);
    await recargarDatos();
  };

  if (cargando || !perfil) return null;

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Entrenamientos</h1>
        <p className="text-sm text-zinc-500">
          {objetivo ? `Ordenadas para: ${ETIQUETAS_OBJETIVO[objetivo.tipo]}` : 'Elegí tu objetivo en el perfil para priorizarlas'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setCategoria(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === null ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
          >
            Todas
          </button>
          {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaSesion[]).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategoria(categoria === c ? null : c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === c ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
            >
              <span aria-hidden="true" className="mr-1">
                {ICONO_CATEGORIA[c]}
              </span>
              {ETIQUETAS_CATEGORIA[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {DURACIONES.map((d) => (
            <button
              type="button"
              key={String(d)}
              onClick={() => setDuracionMax(d)}
              className={`rounded-full border px-3 py-1.5 text-xs ${duracionMax === d ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
            >
              {d === null ? 'Cualquier duración' : `≤ ${d} min`}
            </button>
          ))}
        </div>
        {ocultasPorEquipo > 0 && (
          <p className="text-xs text-zinc-500">
            {ocultasPorEquipo} {ocultasPorEquipo === 1 ? 'clase oculta' : 'clases ocultas'} por equipamiento (
            <Link to="/perfil/editar" className="font-semibold text-marca-magenta">
              editar
            </Link>
            )
          </p>
        )}
      </div>

      <div className="space-y-3">
        {filtradas.map((s) => (
          <Tarjeta key={s.id} className="relative">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/entrenamientos/${s.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/entrenamientos/${s.id}`)}
              className="flex cursor-pointer items-start gap-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marca-crema to-white text-2xl">
                <span aria-hidden="true">{ICONO_CATEGORIA[s.categorias[0] ?? 'activacion']}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{s.titulo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">{s.duracionMin} min</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">{ETIQUETAS_NIVEL_SESION[s.nivel]}</span>
                  {objetivo && s.objetivosCompatibles.includes(objetivo.tipo) && (
                    <span className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">Para tu objetivo</span>
                  )}
                  {(conteo.get(s.id) ?? 0) > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                      ✓ Hecha {conteo.get(s.id)}×
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label={favoritos.has(s.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              onClick={() => void alternarFav(s.id)}
              className={`absolute right-3 top-3 text-xl transition-transform active:scale-90 ${favoritos.has(s.id) ? 'opacity-100' : 'opacity-30'}`}
            >
              {favoritos.has(s.id) ? '⭐' : '☆'}
            </button>
          </Tarjeta>
        ))}
        {filtradas.length === 0 && (
          <Tarjeta className="text-center">
            <p className="text-sm text-zinc-500">No hay clases con esos filtros. Probá quitando alguno.</p>
          </Tarjeta>
        )}
      </div>

      {historial.length > 0 && (
        <Tarjeta>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Tus últimas sesiones</h2>
          <ul className="space-y-2">
            {historial.slice(0, 3).map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-zinc-700">{obtenerSesion(h.workoutId)?.titulo ?? h.workoutId}</span>
                <span className="ml-2 shrink-0 text-xs text-zinc-500">
                  {new Date(h.fecha).toLocaleDateString('es-AR')} · {h.duracionRealMin ?? '?'} min
                </span>
              </li>
            ))}
          </ul>
          <Link to="/progreso" className="mt-3 inline-block text-xs font-semibold text-marca-magenta">
            Ver mi progreso →
          </Link>
        </Tarjeta>
      )}

      <p className="text-center text-xs text-zinc-400">
        Actividad física: {ETIQUETAS_NIVEL_ACTIVIDAD[perfil.nivelActividad]}. Ante dolor, para y consultá a un
        profesional.
      </p>
    </main>
  );
}
