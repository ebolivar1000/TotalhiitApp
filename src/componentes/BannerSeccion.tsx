import { useEffect, useRef, useState } from 'react';

interface BannerSeccionProps {
  titulo?: string;
  subtitulo?: string;
  etiqueta?: string;
  videoSrc?: string;
  imagenSrc?: string;
  insignia?: string;
  altura?: string;
  velocidad?: number;
}

export default function BannerSeccion({
  titulo,
  subtitulo,
  etiqueta,
  videoSrc,
  imagenSrc,
  insignia,
  altura = 'h-40',
  velocidad,
}: BannerSeccionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const tieneTexto = Boolean(titulo || subtitulo);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = velocidad ?? (videoSrc?.includes('presentacion') ? 1.0 : 0.85);
      videoRef.current.play().catch(() => {
        // En navegadores que restrinjan autoplay, se muestra la imagen de respaldo
        setVideoError(true);
      });
    }
  }, [videoSrc, velocidad]);

  return (
    <div
      className={`relative w-full ${altura} overflow-hidden rounded-3xl shadow-md border border-purple-900/20 bg-zinc-900 select-none`}
    >
      {/* Fondo de Video en Bucle */}
      {videoSrc && !videoError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={imagenSrc}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover object-center filter ${
            tieneTexto ? 'brightness-[0.75]' : 'brightness-[0.95]'
          }`}
          onError={() => setVideoError(true)}
        />
      ) : imagenSrc ? (
        <img
          src={imagenSrc}
          alt={titulo ?? 'Totalhiit'}
          className={`absolute inset-0 h-full w-full object-cover object-top filter transition-transform duration-1000 ease-out hover:scale-105 ${
            tieneTexto ? 'brightness-[0.75]' : 'brightness-[0.95]'
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-zinc-900 to-pink-950" />
      )}

      {/* Degradado sobre el video: más suave si no hay texto */}
      <div
        className={`absolute inset-0 ${
          tieneTexto
            ? 'bg-gradient-to-t from-black/85 via-black/45 to-black/20'
            : 'bg-gradient-to-t from-black/40 via-transparent to-black/20'
        }`}
      />

      {/* Decoración luminosa sutil */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-marca-magenta/30 blur-2xl" />

      {/* Contenido sobre el banner */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          {etiqueta ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
              {etiqueta}
            </span>
          ) : (
            <span />
          )}

          {insignia && (
            <span className="ml-auto rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md border border-white/20 shadow-sm">
              {insignia}
            </span>
          )}
        </div>

        {tieneTexto && (
          <div>
            {titulo && (
              <h2 className="text-lg font-black tracking-tight text-white drop-shadow-sm sm:text-xl">
                {titulo}
              </h2>
            )}
            {subtitulo && (
              <p className="mt-0.5 max-w-sm text-xs font-medium text-pink-100/90 line-clamp-2">
                {subtitulo}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
