import { BotonPrimario, Tarjeta } from '../ui';

interface GuiaPasoAPasoIosProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function GuiaPasoAPasoIos({ abierto, onCerrar }: GuiaPasoAPasoIosProps) {
  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-ios"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl">
        {/* Encabezado con estética Apple */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-marca-magenta to-pink-600 p-2 text-white shadow-md">
              <span className="font-marca text-2xl font-black">TH</span>
            </div>
            <div>
              <h2 id="titulo-modal-ios" className="text-lg font-black text-zinc-950">
                Instalar en iPhone / iPad
              </h2>
              <p className="text-xs font-medium text-zinc-500">
                Aplicación web progresiva (PWA oficial)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-500 hover:bg-zinc-200"
            aria-label="Cerrar guía"
          >
            ✕
          </button>
        </div>

        {/* Pasos visuales estilo iOS */}
        <div className="mt-5 space-y-3.5 text-xs text-zinc-700">
          {/* Paso 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-xs">
              1
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900">
                Abre esta página en <span className="text-blue-600 font-semibold">Safari</span>
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">
                Si estás dentro del visor de WhatsApp o Instagram, pulsa el menú superior y elige &quot;Abrir en Safari&quot;.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-xs">
              2
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900">
                Toca el botón <span className="inline-flex items-center gap-1 font-bold text-blue-600">Compartir</span>
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">
                Está en la barra inferior de Safari: el icono de un cuadro con una flecha hacia arriba (<span className="font-mono font-bold text-sm text-blue-600">⎋</span> / <span className="font-bold text-blue-600">⬆</span>).
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-xs">
              3
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900">
                Selecciona <span className="text-zinc-950 font-semibold">&quot;Añadir a pantalla de inicio&quot;</span>
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">
                Desplaza hacia abajo en las opciones y toca el icono de cuadrado con signo más (<strong>➕</strong>).
              </p>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-xs">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-950">Toca &quot;Añadir&quot; arriba a la derecha</p>
              <p className="mt-0.5 text-[11px] text-emerald-800 leading-relaxed">
                ¡Listo! El icono de TOTALHIIT aparecerá en tu iPhone. Se abrirá a pantalla completa sin barras de navegador ni App Store.
              </p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <Tarjeta className="mt-4 border-zinc-200 bg-zinc-50/60 p-3 text-[11px] text-zinc-600">
          <p className="font-bold text-zinc-800">✨ Ventajas en tu iPhone:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-zinc-600">
            <li>Funciona a pantalla completa como una app descargada.</li>
            <li>Guarda tu progreso de forma privada y segura en tu dispositivo.</li>
            <li>Acceso instantáneo con un toque sin ocupar espacio excesivo.</li>
          </ul>
        </Tarjeta>

        {/* Botón de cierre */}
        <div className="mt-5">
          <BotonPrimario onClick={onCerrar} className="w-full text-xs py-3 rounded-2xl font-bold">
            Entendido, lo haré ahora
          </BotonPrimario>
        </div>
      </div>
    </div>
  );
}
