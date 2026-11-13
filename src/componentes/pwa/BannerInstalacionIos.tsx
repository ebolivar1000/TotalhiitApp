import { useEffect, useState } from 'react';
import {
  debeMostrarBannerIos,
  detectarDispositivoIos,
  marcarBannerIosDescartado,
} from '../../lib/pwa/detectorIos';
import GuiaPasoAPasoIos from './GuiaPasoAPasoIos';

export default function BannerInstalacionIos() {
  const [mostrar, setMostrar] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    // Verificar si es un dispositivo iOS que aún no tiene la PWA instalada
    setMostrar(debeMostrarBannerIos());
  }, []);

  if (!mostrar) return null;

  const estado = detectarDispositivoIos();

  const manejarDescarte = () => {
    marcarBannerIosDescartado();
    setMostrar(false);
  };

  const manejarAbrirGuia = () => {
    setModalAbierto(true);
  };

  return (
    <>
      {/* Barra flotante inferior estilo iOS Glassmorphism */}
      <aside
        aria-label="Instalar app en iPhone"
        className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300 sm:bottom-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-zinc-950/85 p-3.5 shadow-2xl backdrop-blur-xl text-white">
          <div className="flex items-center gap-3">
            {/* Ícono de la App */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-marca-magenta to-pink-500 shadow-md">
              <span className="font-marca text-xl font-black text-white">TH</span>
            </div>

            {/* Texto informativo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🍎</span>
                <p className="text-xs font-bold text-white truncate">
                  Instala TOTALHIIT en tu {estado.esIpad ? 'iPad' : 'iPhone'}
                </p>
              </div>
              <p className="text-[11px] text-zinc-300 leading-tight mt-0.5">
                Toca <span className="font-semibold text-blue-400">Compartir ⎋</span> y luego{' '}
                <span className="font-semibold text-white">&quot;Añadir a inicio ➕&quot;</span>
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={manejarAbrirGuia}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-zinc-100 active:scale-95 transition"
              >
                Ver cómo
              </button>
              <button
                type="button"
                onClick={manejarDescarte}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition"
                title="Cerrar aviso"
                aria-label="Cerrar aviso de instalación"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal con instrucciones completas */}
      <GuiaPasoAPasoIos
        abierto={modalAbierto}
        onCerrar={() => {
          setModalAbierto(false);
          manejarDescarte();
        }}
      />
    </>
  );
}
