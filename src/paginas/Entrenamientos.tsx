import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Tarjeta } from '../componentes/ui';
import { ETIQUETAS_NIVEL_ACTIVIDAD } from '../lib/datos/entidades';
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
  type Workout,
} from '../lib/entrenamiento/sesiones';
import { equipoDisponible } from '../lib/entrenamiento/filtros';
import { usePerfil } from '../hooks/usePerfil';
import { useSuscripcion } from '../hooks/useSuscripcion';
import BannerSeccion from '../componentes/BannerSeccion';

const DURACIONES = [null, 15, 25, 35] as const;

type FiltroSemana = 'todas' | '1' | '2' | '3' | '4' | 'estiramientos';

const PESTANAS_SEMANA: { id: FiltroSemana; etiqueta: string }[] = [
  { id: 'todas', etiqueta: 'Todas las clases' },
  { id: '1', etiqueta: 'Semana 1' },
  { id: '2', etiqueta: 'Semana 2' },
  { id: '3', etiqueta: 'Semana 3' },
  { id: '4', etiqueta: 'Semana 4' },
  { id: 'estiramientos', etiqueta: 'Estiramientos' },
];

export default function Entrenamientos() {
  const { cargando, perfil, objetivo } = usePerfil();
  const { esSuscriptor } = useSuscripcion();
  const navigate = useNavigate();
  const [semanaFiltro, setSemanaFiltro] = useState<FiltroSemana>('todas');
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

  // Lista ordenada naturalmente por semana y número de clase
  const todasOrdenadas = useMemo(() => {
    return [...CATALOGO_SESIONES].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }, []);

  // Filtrado por pestaña de semana, categoría y duración
  const filtradas = useMemo(() => {
    return todasOrdenadas.filter((s) => {
      // Filtro de semana
      if (semanaFiltro === '1' && s.semana !== 1) return false;
      if (semanaFiltro === '2' && s.semana !== 2) return false;
      if (semanaFiltro === '3' && s.semana !== 3) return false;
      if (semanaFiltro === '4' && s.semana !== 4) return false;
      if (semanaFiltro === 'estiramientos' && s.semana !== 5) return false;

      // Filtro de categoría
      if (categoria && !s.categorias.includes(categoria)) return false;

      // Filtro de duración
      if (duracionMax !== null && s.duracionMin > duracionMax) return false;

      return true;
    });
  }, [todasOrdenadas, semanaFiltro, categoria, duracionMax]);

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

  // Agrupamiento por semana cuando se muestran todas
  const renderItemSesion = (s: Workout) => {
    const tieneEquipo = equipoDisponible(s, perfil?.equipamiento);
    const esDemo = s.orden === 0 || s.orden === 1;
    const bloqueada = !esSuscriptor && !esDemo;

    return (
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
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900">{s.titulo}</p>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{s.descripcion}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              {esDemo && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                  ⭐ Demo Gratis
                </span>
              )}
              {bloqueada && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 font-bold text-marca-magenta">
                  🔒 Suscriptoras
                </span>
              )}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">
                {s.duracionMin} min
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                {ETIQUETAS_NIVEL_SESION[s.nivel]}
              </span>
              {!tieneEquipo && s.equipo.includes('mancuernas') && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                  🏋️ Requiere mancuernas
                </span>
              )}
              {objetivo && s.objetivosCompatibles.includes(objetivo.tipo) && (
                <span className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">
                  Para tu objetivo
                </span>
              )}
              {(conteo.get(s.id) ?? 0) > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                  ✓ Realizada {conteo.get(s.id)}×
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
    );
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con video de entrenamiento de Valentina */}
      <BannerSeccion
        etiqueta="Programa TOTAL+40"
        titulo="Entrenamientos en Video"
        subtitulo="12 clases progresivas + 2 de estiramiento adaptadas a tu cuerpo y articulaciones."
        videoSrc="/videos/entrenamiento.mp4"
        imagenSrc="/images/valentina/totalhiit_3.jpg"
        insignia="Coach Valentina"
      />

      {/* Aviso de Modo Demostración si la cuenta no es suscriptora activa */}
      {!esSuscriptor && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
          <p className="font-bold flex items-center gap-1.5">
            <span>🔒 Modo Demostración</span>
            <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px]">Acceso Básico</span>
          </p>
          <p className="mt-1 text-amber-800 leading-relaxed">
            Tienes acceso libre a las clases Demo. Si ya adquiriste tu plan, registra tu correo de Google (@gmail.com) en tu perfil para desbloquear las 14 clases completas.
          </p>
          <Link
            to="/perfil/editar"
            className="mt-2 inline-block font-bold text-marca-magenta underline text-xs"
          >
            Registrar mi correo @gmail.com →
          </Link>
        </div>
      )}

      {/* Pestañas de semana */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {PESTANAS_SEMANA.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => setSemanaFiltro(p.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              semanaFiltro === p.id
                ? 'border-marca-magenta bg-marca-magenta text-white shadow-sm'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {/* Filtros de categoría y duración */}
      <div className="space-y-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setCategoria(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${categoria === null ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
          >
            Todas las categorías
          </button>
          {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaSesion[]).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategoria(categoria === c ? null : c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${categoria === c ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
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
              className={`rounded-full border px-3 py-1 text-xs ${duracionMax === d ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
            >
              {d === null ? 'Cualquier duración' : `≤ ${d} min`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de clases ordenadas por semana */}
      <div className="space-y-3">
        {semanaFiltro === 'todas' && !categoria && duracionMax === null ? (
          <>
            {/* Introducción */}
            {filtradas.filter((s) => s.semana === 0).length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Introducción</h2>
                {filtradas.filter((s) => s.semana === 0).map(renderItemSesion)}
              </div>
            )}

            {/* Semana 1 */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
                📅 Semana 1 · Adaptación y Fundamentos
              </h2>
              {filtradas.filter((s) => s.semana === 1).map(renderItemSesion)}
            </div>

            {/* Semana 2 */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
                📅 Semana 2 · Fuerza y Resistencia
              </h2>
              {filtradas.filter((s) => s.semana === 2).map(renderItemSesion)}
            </div>

            {/* Semana 3 */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
                📅 Semana 3 · Tonificación y Control
              </h2>
              {filtradas.filter((s) => s.semana === 3).map(renderItemSesion)}
            </div>

            {/* Semana 4 */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
                📅 Semana 4 · Máxima Intensidad y Cierre
              </h2>
              {filtradas.filter((s) => s.semana === 4).map(renderItemSesion)}
            </div>

            {/* Estiramientos */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-700">
                🧘‍♀️ Estiramientos y Movilidad
              </h2>
              {filtradas.filter((s) => s.semana === 5).map(renderItemSesion)}
            </div>
          </>
        ) : (
          filtradas.map(renderItemSesion)
        )}

        {filtradas.length === 0 && (
          <Tarjeta className="text-center">
            <p className="text-sm text-zinc-500">No hay clases con esos filtros. Prueba seleccionando otra opción.</p>
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
                  {new Date(h.fecha).toLocaleDateString()} · {h.duracionRealMin ?? '—'} min
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
        Actividad física adaptada para {ETIQUETAS_NIVEL_ACTIVIDAD[perfil.nivelActividad]}. Ante cualquier molestia, detén el ejercicio y consulta a un profesional.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
