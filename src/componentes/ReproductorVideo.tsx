import { useEffect, useState } from 'react';
import { Link } from 'react-router';

type Estado = 'cargando' | 'listo' | 'error';

/** Reproductor de YouTube con soporte para videos privados, enlace nativo a la app y verificación de cuenta Google. */
export function ReproductorVideo({
  youtubeId,
  titulo,
  emailGoogle,
}: {
  youtubeId: string;
  titulo: string;
  emailGoogle?: string;
}) {
  const [estado, setEstado] = useState<Estado>('cargando');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    const actualizar = () => setOffline(!navigator.onLine);
    actualizar();
    window.addEventListener('online', actualizar);
    window.addEventListener('offline', actualizar);
    return () => {
      window.removeEventListener('online', actualizar);
      window.removeEventListener('offline', actualizar);
    };
  }, []);

  useEffect(() => {
    if (estado !== 'cargando') return;
    const t = setTimeout(() => setEstado((e) => (e === 'cargando' ? 'error' : e)), 8000);
    return () => clearTimeout(t);
  }, [estado, intentos]);

  const reintentar = () => {
    setEstado('cargando');
    setIntentos((i) => i + 1);
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-sm">
        {offline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p className="text-2xl" aria-hidden="true">
              📡
            </p>
            <p className="text-sm font-semibold text-white">Sin conexión: el video necesita internet</p>
            <button
              type="button"
              onClick={reintentar}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <iframe
              key={intentos}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setEstado('listo')}
              onError={() => setEstado('error')}
            />
            {estado === 'cargando' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                  className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              </div>
            )}
            {estado === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <p className="text-2xl" aria-hidden="true">
                  ⚠️
                </p>
                <p className="text-sm font-semibold text-white">No pudimos cargar el video aquí</p>
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Ver en YouTube
                </a>
                <button
                  type="button"
                  onClick={reintentar}
                  className="text-xs font-semibold text-white/70 underline"
                >
                  Reintentar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel de autorización de videos privados con Google */}
      {emailGoogle ? (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-700">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="font-bold text-zinc-900">🔒 Acceso exclusivo con tu cuenta:</span>
            <span className="rounded bg-zinc-200/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-800">
              {emailGoogle}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            Al ser un video privado, si el reproductor pide iniciar sesión, pulsa el botón para abrirlo directamente en la app de YouTube con tu cuenta:
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            ▶️ Abrir en la app de YouTube con Google
          </a>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <p className="font-bold">🔒 Video privado de acceso exclusivo</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
            Los videos son privados y requieren tu cuenta de Google (@gmail.com) para autorizar la reproducción.
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <Link to="/perfil/editar" className="font-bold text-marca-magenta hover:underline">
              Configurar mi correo @gmail.com →
            </Link>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
            >
              Abrir en YouTube ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
