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
import { useSuscripcion } from '../hooks/useSuscripcion';

export default function DetalleEntrenamiento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cargando, perfil } = usePerfil();
  const { esSuscriptor } = useSuscripcion();
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
    setMensaje('¡Sesión registrada! Excelente trabajo 💜');
  };

  const alternarFav = async () => {
    const resultado = await alternarFavorito(perfil.id, 'sesion', sesion.id);
    setFavorito(resultado);
  };

  const etiquetaEquipo = (valor: string) => EQUIPAMIENTO_OPCIONES.find((o) => o.valor === valor)?.etiqueta ?? valor;

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/entrenamientos')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
        >
          ← Volver a Entrenamientos
        </button>
      </div>

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

      {/* Si la clase está bloqueada por suscripción, muestra el aviso de desbloqueo */}
      {!esSuscriptor && (sesion.orden ?? 0) > 1 ? (
        <Tarjeta className="border-purple-200 bg-purple-50 text-center py-8">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-3 text-lg font-bold text-zinc-900">Clase Exclusiva para Suscriptoras</h2>
          <p className="mt-2 text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed">
            Esta clase es parte del programa completo TOTAL+40. Para acceder, debes tener tu correo de Google (@gmail.com) registrado en tu perfil con suscripción activa.
          </p>
          <div className="mt-4 flex flex-col gap-2 max-w-xs mx-auto">
            <Link
              to="/perfil/editar"
              className="rounded-xl bg-marca-magenta px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-marca-magenta-oscuro"
            >
              Configurar mi correo @gmail.com
            </Link>
            <Link
              to="/entrenamientos"
              className="text-xs font-semibold text-zinc-600 hover:text-marca-magenta"
            >
              ← Ver clases de demostración
            </Link>
          </div>
        </Tarjeta>
      ) : (
        <ReproductorVideo
          youtubeId={sesion.youtubeId}
          titulo={sesion.titulo}
          emailGoogle={perfil.emailGoogle}
          imagenPortada={sesion.imagen}
          duracionMin={sesion.duracionMin}
        />
      )}

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
          <p className="text-sm text-zinc-500">Todavía no la has registrado. Cuando la completes, aparecerá aquí.</p>
        ) : (
          <ul className="space-y-1.5">
            {historial.map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm text-zinc-700">
                <span>✓ {new Date(h.fecha).toLocaleDateString()}</span>
                <span className="text-xs text-zinc-500">{h.duracionRealMin ?? '—'} min</span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <p className="text-center text-xs text-zinc-400">
        Aviso de salud: esta app es orientativa y no reemplaza el consejo de profesionales.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
