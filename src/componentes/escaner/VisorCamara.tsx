import { useEffect, useRef, useState } from 'react';
import { BotonPrimario, BotonSecundario, Tarjeta } from '../ui';

interface VisorCamaraProps {
  onCodigoDetectado: (codigo: string) => void;
  onIngresoManual: () => void;
  onFotoSubida: (file: File) => void;
}

export default function VisorCamara({
  onCodigoDetectado,
  onIngresoManual,
  onFotoSubida,
}: VisorCamaraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActivo, setStreamActivo] = useState<MediaStream | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [linternaDisponible, setLinternaDisponible] = useState(false);
  const [linternaEncendida, setLinternaEncendida] = useState(false);
  const [escaneando, setEscaneando] = useState(true);

  // Iniciar la cámara del dispositivo
  useEffect(() => {
    let cancelado = false;

    async function iniciarCamara() {
      setErrorCamara(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorCamara('Tu dispositivo o navegador no soporta acceso directo a la cámara.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStreamActivo(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Detectar si el track soporta linterna (torch)
        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const capabilities = track.getCapabilities() as { torch?: boolean };
          if (capabilities && 'torch' in capabilities) {
            setLinternaDisponible(true);
          }
        }
      } catch (err: unknown) {
        if (cancelado) return;
        const mensaje =
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Permite el acceso para escanear en tiempo real o ingresa el código manualmente.'
            : 'No se pudo acceder a la cámara. Puedes ingresar el código numérico manualmente.';
        setErrorCamara(mensaje);
      }
    }

    void iniciarCamara();

    return () => {
      cancelado = true;
      if (streamActivo) {
        streamActivo.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bucle de detección con BarcodeDetector nativo
  useEffect(() => {
    let detenido = false;
    let barcodeDetector: unknown = null;

    interface DetectorNativo {
      detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
    }

    const windowWithDetector = window as unknown as {
      BarcodeDetector?: new (options?: { formats: string[] }) => DetectorNativo;
    };

    if (windowWithDetector.BarcodeDetector) {
      try {
        barcodeDetector = new windowWithDetector.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });
      } catch {
        barcodeDetector = null;
      }
    }

    async function cicloEscaneo() {
      if (detenido || !escaneando) return;

      if (videoRef.current && videoRef.current.readyState >= 2 && barcodeDetector) {
        try {
          const codigos = await (barcodeDetector as DetectorNativo).detect(videoRef.current);
          const primer = codigos?.[0];
          if (primer && primer.rawValue) {
            const raw = primer.rawValue.trim();
            if (/^\d{6,14}$/.test(raw)) {
              // Vibración háptica de confirmación si está soportada
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(80);
              }
              setEscaneando(false);
              onCodigoDetectado(raw);
              return;
            }
          }
        } catch {
          // Errores temporales de frame
        }
      }

      requestAnimationFrame(() => {
        void cicloEscaneo();
      });
    }

    if (barcodeDetector && streamActivo) {
      void cicloEscaneo();
    }

    return () => {
      detenido = true;
    };
  }, [streamActivo, escaneando, onCodigoDetectado]);

  // Alternar linterna (Flash)
  const alternarLinterna = async () => {
    if (!streamActivo) return;
    const track = streamActivo.getVideoTracks()[0];
    if (!track) return;

    try {
      const nuevoEstado = !linternaEncendida;
      await (track as MediaStreamTrack & {
        applyConstraints: (c: unknown) => Promise<void>;
      }).applyConstraints({
        advanced: [{ torch: nuevoEstado }],
      });
      setLinternaEncendida(nuevoEstado);
    } catch {
      // Linterna no disponible en este dispositivo
    }
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFotoSubida(file);
    }
  };

  if (errorCamara) {
    return (
      <Tarjeta className="border-2 border-amber-300 bg-amber-50/60 p-5 text-center">
        <span className="text-4xl" aria-hidden="true">
          📷
        </span>
        <h2 className="mt-2 text-base font-bold text-zinc-900">Acceso a cámara no disponible</h2>
        <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{errorCamara}</p>

        <div className="mt-4 flex flex-col gap-2">
          <BotonPrimario onClick={onIngresoManual} className="w-full text-xs">
            ⌨️ Ingresar código de barras manualmente
          </BotonPrimario>
          <BotonSecundario
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs"
          >
            🖼️ Subir foto de la etiqueta
          </BotonSecundario>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleArchivoSeleccionado}
          />
        </div>
      </Tarjeta>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black shadow-xl">
      {/* Elemento de Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-80 w-full object-cover sm:h-96"
      />

      {/* Máscara y Visor con recuadro guía */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="relative h-48 w-64 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          {/* Esquinas destacadas en marca magenta */}
          <span className="absolute -left-1 -top-1 h-5 w-5 rounded-tl-lg border-l-4 border-t-4 border-marca-magenta" />
          <span className="absolute -right-1 -top-1 h-5 w-5 rounded-tr-lg border-r-4 border-t-4 border-marca-magenta" />
          <span className="absolute -bottom-1 -left-1 h-5 w-5 rounded-bl-lg border-b-4 border-l-4 border-marca-magenta" />
          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-br-lg border-b-4 border-r-4 border-marca-magenta" />

          {/* Línea roja láser animada */}
          <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
        </div>

        <p className="mt-4 rounded-full bg-black/60 px-3 py-1 text-center text-xs font-semibold text-white backdrop-blur">
          Apunta el código de barras en el centro
        </p>
      </div>

      {/* Barra de Controles Superpuesta */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-around px-4">
        {/* Linterna */}
        {linternaDisponible && (
          <button
            type="button"
            onClick={() => void alternarLinterna()}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-lg shadow-lg backdrop-blur transition-all active:scale-95 ${
              linternaEncendida ? 'bg-amber-400 text-zinc-950' : 'bg-black/60 text-white hover:bg-black/80'
            }`}
            title="Encender linterna"
            aria-label="Encender linterna"
          >
            {linternaEncendida ? '💡' : '🔦'}
          </button>
        )}

        {/* Ingreso manual */}
        <button
          type="button"
          onClick={onIngresoManual}
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-zinc-900 shadow-md backdrop-blur transition hover:bg-white active:scale-95"
        >
          <span>⌨️</span>
          <span>Código manual</span>
        </button>

        {/* Subir foto / OCR */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg text-white shadow-lg backdrop-blur hover:bg-black/80 active:scale-95"
          title="Subir foto de etiqueta"
          aria-label="Subir foto de etiqueta"
        >
          📷
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleArchivoSeleccionado}
        />
      </div>
    </div>
  );
}
