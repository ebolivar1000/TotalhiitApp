import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Tarjeta } from '../componentes/ui';
import { consultarActualizacion, VERSION_ACTUAL, type InfoVersion } from '../lib/version/actualizador';

const URL_DESCARGA_APK = 'https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk';

export default function DescargarApp() {
  const [infoVersion, setInfoVersion] = useState<InfoVersion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [descargaIniciada, setDescargaIniciada] = useState(false);
  const [esNavegadorInApp, setEsNavegadorInApp] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  // Detectar si está abierto dentro del visor de WhatsApp, Instagram, Facebook, etc.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = (navigator.userAgent || '').toLowerCase();
      const inApp =
        ua.includes('whatsapp') ||
        ua.includes('fban') ||
        ua.includes('fbav') ||
        ua.includes('instagram') ||
        ua.includes('telegram') ||
        ua.includes('line');
      setEsNavegadorInApp(inApp);
    }
  }, []);

  const comprobarServidor = async () => {
    setCargando(true);
    setMensajeEstado('');
    try {
      const res = await consultarActualizacion();
      if (res.versionRemota) {
        setInfoVersion(res.versionRemota);
      }
      setMensajeEstado('¡Estás viendo la última versión disponible en el servidor!');
    } catch {
      setMensajeEstado('Sin conexión temporal con el servidor de versiones.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void comprobarServidor();
  }, []);

  const versionMostrar = infoVersion?.version || VERSION_ACTUAL;
  const buildMostrar = infoVersion?.buildNumber || 11;
  const fechaMostrar = infoVersion?.releaseDate || '2026-11-12';

  const manejarClickDescarga = () => {
    setDescargaIniciada(true);
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      {/* Cabecera */}
      <div className="text-center">
        <Link to="/" className="inline-block">
          <p className="font-marca text-4xl text-marca-magenta tracking-wide">TOTALHIIT</p>
        </Link>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Descarga Oficial para Android
        </p>
      </div>

      {/* Alerta si está dentro de WhatsApp o visor in-app */}
      {esNavegadorInApp && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <span className="text-xl">⚠️</span>
            <span>Aviso para usuarios de WhatsApp / Instagram</span>
          </div>
          <p className="mt-1.5 leading-relaxed">
            Estás usando el visor interno de redes sociales, el cual <strong>bloquea las descargas directas de archivos APK</strong>.
          </p>
          <div className="mt-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200">
            <p className="font-bold text-amber-950">Para descargar sin problemas:</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-amber-900 font-medium">
              <li>Toca el menú de <strong>tres puntos (⋮)</strong> en la esquina superior derecha.</li>
              <li>Selecciona <strong>&quot;Abrir en Chrome&quot;</strong> (o en tu navegador).</li>
              <li>Presiona el botón de descarga aquí abajo.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Aclaración: Instalación completa e independiente (nueva o actualización) */}
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <span className="text-base">✨</span>
          <span>Instalador Completo e Independiente</span>
        </div>
        <p className="mt-1 leading-relaxed text-emerald-900">
          Este instalador contiene la app completa. <strong>NO necesitas tener ninguna versión previa instalada</strong>:
        </p>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 text-[11px]">
          <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-200">
            <p className="font-bold text-zinc-900">🆕 Celular nuevo o desde cero:</p>
            <p className="text-zinc-600 mt-0.5 leading-relaxed">
              Instala directamente. Todo el contenido, entrenamientos y menús quedan listos de inmediato.
            </p>
          </div>
          <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-200">
            <p className="font-bold text-zinc-900">🔄 Si ya tienes la app instalada:</p>
            <p className="text-zinc-600 mt-0.5 leading-relaxed">
              Se actualiza automáticamente sin perder tus progresos, datos ni configuraciones guardadas.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta Principal de Descarga */}
      <Tarjeta className="border-2 border-marca-magenta/30 bg-gradient-to-b from-white via-white to-pink-50/50 text-center shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-marca-magenta/10 px-3 py-1 text-xs font-black text-marca-magenta">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ÚLTIMA VERSIÓN DISPONIBLE: v{versionMostrar}</span>
        </div>

        <h1 className="mt-3 text-2xl font-black text-zinc-900">
          App TOTALHIIT para Android
        </h1>
        <p className="mt-1 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
          Instala la aplicación en tu celular para acceder a entrenamientos en video, menús semanales, PDF de recetas y seguimiento del ciclo femenino.
        </p>

        {/* Botón de Descarga Directa Nativa (Enlace HTML5 estándar) */}
        <div className="mt-5 space-y-2">
          <a
            href={URL_DESCARGA_APK}
            download="totalhiit.apk"
            onClick={manejarClickDescarga}
            className="group relative flex w-full min-h-[56px] items-center justify-center gap-2.5 rounded-2xl bg-marca-magenta px-5 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:bg-marca-magenta-oscuro hover:shadow-xl active:scale-95 text-center"
          >
            <span className="text-xl">📲</span>
            <span>Descargar e Instalar APK (v{versionMostrar})</span>
          </a>

          <p className="text-[11px] font-medium text-zinc-500">
            Archivo oficial APK (~24 MB) · Libre de virus · Actualizaciones automáticas
          </p>
        </div>

        {/* Mensaje tras pulsar descarga */}
        {descargaIniciada && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 text-left">
            <p className="font-bold flex items-center gap-1.5 text-emerald-950">
              <span>✅</span> ¡Descarga iniciada!
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
              Revisa la barra superior de notificaciones o tu carpeta de <strong>Descargas</strong>.
              Si tu navegador te pregunta <em>&quot;¿Descargar de todos modos?&quot;</em>, pulsa <strong>Descargar de todos modos</strong>.
            </p>
            <div className="mt-2 text-center">
              <a
                href={`${URL_DESCARGA_APK}?_t=${Date.now()}`}
                download="totalhiit.apk"
                className="text-[11px] font-bold text-marca-magenta underline hover:text-marca-magenta-oscuro"
              >
                ¿No inició? Pulsa aquí para reintentar la descarga directa →
              </a>
            </div>
          </div>
        )}

        {/* Novedades de la versión */}
        {infoVersion?.novedades && infoVersion.novedades.length > 0 && (
          <div className="mt-5 border-t border-zinc-100 pt-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Novedades de la versión v{versionMostrar}:
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-zinc-700">
              {infoVersion.novedades.map((novedad, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-marca-magenta font-bold">✓</span>
                  <span>{novedad}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón para verificar versión en vivo */}
        <div className="mt-4 border-t border-zinc-100 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-medium">
            Build #{buildMostrar} · {fechaMostrar}
          </span>
          <button
            type="button"
            onClick={() => void comprobarServidor()}
            disabled={cargando}
            className="text-xs font-bold text-marca-magenta hover:underline"
          >
            {cargando ? 'Comprobando…' : '🔄 Comprobar actualización'}
          </button>
        </div>

        {mensajeEstado && (
          <p className="mt-2 text-[11px] font-semibold text-zinc-600">{mensajeEstado}</p>
        )}
      </Tarjeta>

      {/* Guía Paso a Paso para Instalar */}
      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
          Guía de instalación en 3 pasos
        </h2>

        <div className="mt-3 space-y-3 text-xs text-zinc-700">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-magenta text-xs font-black text-white">
              1
            </div>
            <div>
              <p className="font-bold text-zinc-900">Descarga el archivo APK</p>
              <p className="text-zinc-600">
                Toca el botón magenta superior. El archivo se guardará en tu carpeta de <strong>Descargas</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-magenta text-xs font-black text-white">
              2
            </div>
            <div>
              <p className="font-bold text-zinc-900">Acepta la advertencia de Android</p>
              <p className="text-zinc-600">
                Si Chrome muestra <em>&quot;Este tipo de archivo puede ser dañino&quot;</em>, pulsa <strong>Descargar de todos modos</strong>. Es la advertencia estándar de Google para apps fuera de Google Play.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-magenta text-xs font-black text-white">
              3
            </div>
            <div>
              <p className="font-bold text-zinc-900">Abre el archivo e instala</p>
              <p className="text-zinc-600">
                Toca la notificación de descarga completada o búscala en tu app <strong>Descargas / Archivos</strong> y presiona <strong>Instalar</strong>.
              </p>
            </div>
          </div>
        </div>
      </Tarjeta>

      {/* Solución a dudas y avisos frecuentes de Android */}
      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
          Solución a dudas y avisos de Android
        </h2>

        <div className="mt-3 divide-y divide-zinc-100 text-xs">
          {/* Duda 1: Requiere versión anterior? */}
          <div className="pb-2.5">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="text-base">❓</span>
              <span>¿Necesito tener alguna versión anterior instalada?</span>
            </p>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              <strong>No.</strong> Este paquete es la aplicación completa e independiente. Puedes instalarla desde cero en cualquier celular Android (versión 7.0 o superior) sin ningún requisito previo.
            </p>
          </div>

          {/* Duda 2: Permisos de orígenes desconocidos */}
          <div className="py-2.5">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="text-base">⚙️</span>
              <span>¿Dice &quot;No tienes permiso para instalar aplicaciones de esta fuente&quot;?</span>
            </p>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              En celulares nuevos donde nunca se ha instalado un APK externo, Android solicita autorizar a tu navegador (Chrome o Samsung Internet). Solo sigue estos pasos una única vez:
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-zinc-700 font-medium">
              <li>Toca <strong>&quot;Ajustes&quot;</strong> o <strong>&quot;Configuración&quot;</strong> en el mensaje emergente.</li>
              <li>Activa el interruptor <strong>&quot;Permitir desde esta fuente&quot;</strong> o <strong>&quot;Confiar en esta fuente&quot;</strong>.</li>
              <li>Toca la flecha atrás y presiona <strong>&quot;Instalar&quot;</strong>.</li>
            </ol>
          </div>

          {/* Duda 3: Error de análisis de paquete */}
          <div className="pt-2.5">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="text-base">📦</span>
              <span>¿Dice &quot;Error al analizar el paquete&quot; o no abre?</span>
            </p>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Esto sucede si se intenta abrir el archivo antes de que termine de descargarse al 100% (el archivo pesa ~24 MB) o si la conexión a internet se interrumpió a la mitad. Asegúrate de que la descarga finalizó por completo y ábrelo desde la barra de notificaciones o la carpeta <strong>Descargas</strong>.
            </p>
          </div>
        </div>
      </Tarjeta>

      {/* Enlace alternativo a la versión web */}
      <div className="text-center pt-2">
        <Link to="/" className="inline-block text-xs font-bold text-zinc-600 hover:text-marca-magenta underline">
          ← O ingresa a la versión Web directamente en tu navegador
        </Link>
      </div>
    </main>
  );
}
