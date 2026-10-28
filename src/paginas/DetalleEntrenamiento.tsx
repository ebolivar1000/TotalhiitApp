import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ReproductorVideo } from '../componentes/ReproductorVideo';
import { BotonPrimario, BotonSecundario, Tarjeta } from '../componentes/ui';
import { EQUIPAMIENTO_OPCIONES } from '../componentes/formulario/Secciones';
import { ETIQUETAS_OBJETIVO, type WorkoutSession } from '../lib/datos/entidades';
import { alternarFavorito, esFavorito, registrarSesion, sesionesDeWorkout } from '../lib/datos/repositorio';
import { ETIQUETAS_CATEGORIA, ETIQUETAS_NIVEL_SESION, obtenerSesion } from '../lib/entrenamiento/sesiones';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';

export default function DetalleEntrenamiento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cargando, perfil } = usePerfil();
  const [favorito, setFavorito] = useState(false);
  const [historial, setHistorial] = useState<WorkoutSession[]>([]);
  const [mensaje, setMensaje] = useState('');

  const sesion = id ? obtenerSesion(id) : undefined;

  useEffect(() => {
    if (!perfil || !sesion) return;
    void (async () => {
      const [fav, registros] = await Promise.all([
        esFavorito(perfil.id, 'sesion', sesion.id),
        sesionesDeWorkout(perfil.id, sesion.id),
      ]);
      setFavorito(fav);
      setHistorial(registros);
    })();
  }, [perfil, sesion]);

  if (cargando) return null;

  if (!sesion || !perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-32 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">No encontramos esa clase.</p>
          <Link to="/entrenamientos" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Volver a entrenamientos
          </Link>
        </Tarjeta>
      </main>
    );
  }

  const completar = async () => {
    await registrarSesion({
      userId: perfil.id,
      workoutId: sesion.id,
      fecha: fechaHoyIso(),
      duracionRealMin: sesion.duracionMin,
    });
    setHistorial(await sesionesDeWorkout(perfil.id, sesion.id));
    setMensaje('¡Sesión registrada! Buenísimo 💜');
  };

  const alternarFav = async () => {
    const resultado = await alternarFavorito(perfil.id, 'sesion', sesion.id);
    setFavorito(resultado);
  };

  const etiquetaEquipo = (valor: string) => EQUIPAMIENTO_OPCIONES.find((o) => o.valor === valor)?.etiqueta ?? valor;

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-32 pt-6">
      <button type="button" onClick={() => navigate('/entrenamientos')} className="text-sm font-semibold text-marca-magenta">
        ← Entrenamientos
      </button>

      <div>
        <h1 className="text-xl font-bold text-zinc-900">{sesion.titulo}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">{sesion.duracionMin} min</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">{ETIQUETAS_NIVEL_SESION[sesion.nivel]}</span>
          {sesion.categorias.map((c) => (
            <span key={c} className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
              {ETIQUETAS_CATEGORIA[c]}
            </span>
          ))}
        </div>
      </div>

      <ReproductorVideo youtubeId={sesion.youtubeId} titulo={sesion.titulo} />

      <Tarjeta>
        <p className="text-sm leading-relaxed text-zinc-600">{sesion.descripcion}</p>
        {sesion.precauciones && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            ⚠️ {sesion.precauciones}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {sesion.equipo.map((e) => (
            <span key={e} className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
              {etiquetaEquipo(e)}
            </span>
          ))}
        </div>
      </Tarjeta>

      <div className="flex gap-3">
        <BotonPrimario onClick={() => void completar()} className="flex-[2]">
          ✓ Completé esta clase
        </BotonPrimario>
        <BotonSecundario onClick={() => void alternarFav()} className="flex-1">
          {favorito ? '⭐ Favorita' : '☆ Favorita'}
        </BotonSecundario>
      </div>
      {mensaje && <p className="text-center text-sm font-semibold text-green-700">{mensaje}</p>}

      <Tarjeta>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-marca-magenta">Ideal para</h2>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {sesion.objetivosCompatibles.map((o) => (
            <span key={o} className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">
              {ETIQUETAS_OBJETIVO[o]}
            </span>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Tu historial en esta clase</h2>
        {historial.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no la registraste. Cuando la completes, va a aparecer acá.</p>
        ) : (
          <ul className="space-y-1.5">
            {historial.map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm text-zinc-700">
                <span>✓ {new Date(h.fecha).toLocaleDateString('es-AR')}</span>
                <span className="text-xs text-zinc-500">{h.duracionRealMin ?? '?'} min</span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <p className="text-center text-xs text-zinc-400">
        Aviso de salud: esta app es orientativa y no reemplaza el consejo de profesionales.
      </p>
    </main>
  );
}
