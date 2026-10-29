import { useEffect, useState } from 'react';

const LLAVE_SESION_INTRO = 'totalhiit_intro_vista';

export default function PortadaTransicion({ onTerminado }: { onTerminado?: () => void }) {
  const [mostrar, setMostrar] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem(LLAVE_SESION_INTRO);
  });
  const [desvaneciendo, setDesvaneciendo] = useState(false);

  useEffect(() => {
    if (!mostrar) return;

    // Iniciar desvanecimiento a los 2.0 segundos
    const timerDesvanecer = setTimeout(() => {
      setDesvaneciendo(true);
    }, 2000);

    // Ocultar por completo y remover a los 2.5 segundos
    const timerFin = setTimeout(() => {
      sessionStorage.setItem(LLAVE_SESION_INTRO, '1');
      setMostrar(false);
      onTerminado?.();
    }, 2500);

    return () => {
      clearTimeout(timerDesvanecer);
      clearTimeout(timerFin);
    };
  }, [mostrar, onTerminado]);

  const saltar = () => {
    setDesvaneciendo(true);
    setTimeout(() => {
      sessionStorage.setItem(LLAVE_SESION_INTRO, '1');
      setMostrar(false);
      onTerminado?.();
    }, 300);
  };

  if (!mostrar) return null;

  return (
    <div
      onClick={saltar}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-[#1c0326] via-[#2f083d] to-[#0d0114] px-6 py-12 text-white transition-opacity duration-500 ease-out select-none cursor-pointer ${
        desvaneciendo ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Pantalla de bienvenida TOTALHIIT"
    >
      {/* Luz ambiental de fondo */}
      <div className="absolute top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-marca-magenta/30 blur-3xl filter animate-pulse" />

      {/* Cabecera sutil */}
      <div className="relative z-10 text-center">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-200 backdrop-blur-md">
          Bienvenida
        </span>
      </div>

      {/* Centro: Logo animado y lema */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
          {/* Anillos concéntricos animados */}
          <div className="absolute inset-0 rounded-full border border-pink-400/30 animate-ping opacity-40" />
          <div className="absolute -inset-2 rounded-full border border-purple-400/20 animate-spin" style={{ animationDuration: '8s' }} />

          {/* Logo oficial */}
          <img
            src="/images/logo.png"
            alt="TOTALHIIT Logo"
            className="relative h-28 w-28 rounded-2xl object-contain drop-shadow-[0_10px_25px_rgba(186,18,103,0.5)] transition-transform duration-700 ease-out scale-105"
          />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md sm:text-4xl">
          TOTAL<span className="text-marca-magenta">HIIT</span>
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-wider text-pink-300">
          Programa TOTAL+40
        </p>
        <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-zinc-300">
          Entrenamiento adaptado, nutrición antiinflamatoria y bienestar integral para mujeres de +40.
        </p>
      </div>

      {/* Barra de progreso inferior y aviso para saltar */}
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-marca-magenta to-pink-400 transition-all duration-[2200ms] ease-out w-full"
            style={{ animation: 'cargaBarra 2.2s ease-out forwards' }}
          />
        </div>
        <p className="text-[10px] text-zinc-400">
          Iniciando tu sesión... <span className="opacity-60">(Toca para continuar)</span>
        </p>
      </div>

      <style>{`
        @keyframes cargaBarra {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
