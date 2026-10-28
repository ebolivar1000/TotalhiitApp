import { useEffect, useState } from 'react';

type Estado = 'cargando' | 'listo' | 'error';

/** Reproductor de YouTube en modo privado (nocookie) con estados de carga, error y offline. */
export function ReproductorVideo({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
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
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900">
        {offline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p className="text-2xl" aria-hidden="true">
              📡
            </p>
            <p className="text-sm font-semibold text-white">Sin conexión: el video necesita internet</p>
            <button type="button" onClick={reintentar} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <iframe
              key={intentos}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
              title={titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setEstado('listo')}
              onError={() => setEstado('error')}
            />
            {estado === 'cargando' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
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
                <button type="button" onClick={reintentar} className="text-xs font-semibold text-white/70 underline">
                  Reintentar
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <a
        href={`https://www.youtube.com/watch?v=${youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs font-semibold text-zinc-500 hover:text-marca-magenta"
      >
        Abrir en YouTube ↗
      </a>
    </div>
  );
}
