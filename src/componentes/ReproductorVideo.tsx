import { useEffect, useState } from 'react';

type Estado = 'cargando' | 'listo' | 'error';

/** Reproductor de YouTube con portada visual de alta resolución, soporte de videos privados y enlace nativo a YouTube. */
export function ReproductorVideo({
  youtubeId,
  titulo,
  emailGoogle,
  imagenPortada,
  duracionMin,
}: {
  youtubeId: string;
  titulo: string;
  emailGoogle?: string;
  imagenPortada?: string;
  duracionMin?: number;
}) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [intentos, setIntentos] = useState(0);

  // Portada: usar la oficial asignada o fallback a la miniatura de YouTube
  const portadaSrc = imagenPortada || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

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
    if (!reproduciendo || estado !== 'cargando') return;
    const t = setTimeout(() => setEstado((e) => (e === 'cargando' ? 'error' : e)), 8000);
    return () => clearTimeout(t);
  }, [reproduciendo, estado, intentos]);

  const reintentar = () => {
    setEstado('cargando');
    setIntentos((i) => i + 1);
  };

  const iniciarReproduccion = () => {
    setEstado('cargando');
    setReproduciendo(true);
  };

  // Abrir en la app de YouTube nativa con fallback al navegador web
  const abrirEnAppYouTube = () => {
    const appUrl = `vnd.youtube:${youtubeId}`;
    const webUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

    const inicio = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      // Si a los 500ms no cambió el foco (no tiene app nativa o está en navegador de PC), abrir webUrl
      if (Date.now() - inicio < 1500) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 500);
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-md">
        {!reproduciendo ? (
          /* PORTADA OFICIAL CON BOTÓN DE PLAY */
          <div
            onClick={iniciarReproduccion}
            className="group relative h-full w-full cursor-pointer select-none overflow-hidden"
          >
            <img
              src={portadaSrc}
              alt={titulo}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

            {/* Badges superiores de la portada */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="rounded-full bg-marca-magenta/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow backdrop-blur">
                TOTAL+40
              </span>
              {duracionMin && (
                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                  ⏱️ {duracionMin} min
                </span>
              )}
            </div>

            {/* Botón central de Reproducción animado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-marca-magenta text-2xl text-white shadow-xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-110 active:scale-95">
                ▶
              </div>
              <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                Toca para ver el video
              </span>
            </div>

            {/* Título inferior en la portada */}
            <div className="absolute bottom-3 inset-x-3">
              <p className="line-clamp-1 text-xs font-semibold text-white/90 drop-shadow">
                {titulo}
              </p>
            </div>
          </div>
        ) : offline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p className="text-2xl" aria-hidden="true">
              📡
            </p>
            <p className="text-sm font-semibold text-white">Sin conexión: el video necesita internet</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reintentar}
                className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => setReproduciendo(false)}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Volver a la portada
              </button>
            </div>
          </div>
        ) : (
          <>
            <iframe
              key={intentos}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
              title={titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setEstado('listo')}
              onError={() => setEstado('error')}
            />
            {estado === 'cargando' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <span
                  className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-marca-magenta"
                  aria-hidden="true"
                />
              </div>
            )}
            {estado === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center bg-zinc-950">
                <p className="text-2xl" aria-hidden="true">
                  🔒
                </p>
                <p className="text-xs font-semibold text-white max-w-xs">
                  Por seguridad, los videos privados deben reproducirse en la app de YouTube con tu cuenta autorizada.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={abrirEnAppYouTube}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
                  >
                    ▶️ Abrir en YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setReproduciendo(false)}
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    Ver portada
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel de autorización y acceso a YouTube */}
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-700">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="font-bold text-zinc-900">🔒 Cuenta autorizada:</span>
          <span className="rounded-lg bg-zinc-200/80 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-800">
            {emailGoogle || 'Sin registrar'}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Los videos son privados y exclusivos para alumnas. Si en tu celular no reproduce aquí directamente, toca el botón para abrirlo en la app de YouTube con tu cuenta:
        </p>
        <button
          type="button"
          onClick={abrirEnAppYouTube}
          className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
        >
          ▶️ Abrir en la app de YouTube con Google
        </button>
      </div>
    </div>
  );
}
