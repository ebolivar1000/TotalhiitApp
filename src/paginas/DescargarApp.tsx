import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Tarjeta } from '../componentes/ui';
import { consultarActualizacion, VERSION_ACTUAL, type InfoVersion } from '../lib/version/actualizador';
import { detectarDispositivoIos } from '../lib/pwa/detectorIos';

const URL_DESCARGA_APK = 'https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk';

type PlataformaTab = 'ios' | 'android' | 'amazon';

export default function DescargarApp() {
  const [searchParams] = useSearchParams();
  const [tabActiva, setTabActiva] = useState<PlataformaTab>('android');
  const [infoVersion, setInfoVersion] = useState<InfoVersion | null>(null);
  const [descargaIniciada, setDescargaIniciada] = useState(false);
  const [esNavegadorInApp, setEsNavegadorInApp] = useState(false);

  // Detectar plataforma al inicio o por parámetro URL (?plataforma=ios)
  useEffect(() => {
    const param = searchParams.get('plataforma')?.toLowerCase();
    if (param === 'ios' || param === 'iphone' || param === 'apple') {
      setTabActiva('ios');
      return;
    }
    if (param === 'amazon' || param === 'fire') {
      setTabActiva('amazon');
      return;
    }

    const estadoIos = detectarDispositivoIos();
    if (estadoIos.esIos) {
      setTabActiva('ios');
      setEsNavegadorInApp(estadoIos.esNavegadorInApp);
    } else {
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
    }
  }, [searchParams]);

  const comprobarServidor = async () => {
    try {
      const res = await consultarActualizacion();
      if (res.versionRemota) {
        setInfoVersion(res.versionRemota);
      }
    } catch {
      // Sin conexión temporal
    }
  };

  useEffect(() => {
    void comprobarServidor();
  }, []);

  const versionMostrar = infoVersion?.version || VERSION_ACTUAL;

  const manejarClickDescarga = () => {
    setDescargaIniciada(true);
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      {/* Cabecera Principal */}
      <div className="text-center">
        <Link to="/" className="inline-block">
          <p className="font-marca text-4xl text-marca-magenta tracking-wide">TOTALHIIT</p>
        </Link>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Centro Oficial de Instalación Multiplataforma
        </p>
      </div>

      {/* Selector de Plataforma (Pestañas estilo Apple / Segmented Control) */}
      <div className="rounded-2xl bg-zinc-200/80 p-1.5 shadow-inner backdrop-blur">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setTabActiva('ios')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition-all ${
              tabActiva === 'ios'
                ? 'bg-white text-zinc-950 shadow-md scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('android')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition-all ${
              tabActiva === 'android'
                ? 'bg-white text-zinc-950 shadow-md scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>🤖</span>
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('amazon')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition-all ${
              tabActiva === 'amazon'
                ? 'bg-white text-zinc-950 shadow-md scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>📦</span>
            <span>Amazon</span>
          </button>
        </div>
      </div>

      {/* Alerta de Navegador In-App (WhatsApp / Instagram / Redes Sociales) */}
      {esNavegadorInApp && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <span className="text-xl">⚠️</span>
            <span>Aviso para usuarias de WhatsApp / Instagram</span>
          </div>
          <p className="mt-1.5 leading-relaxed">
            Estás usando el navegador interno de la red social, el cual bloquea las funciones de instalación directa y descargas.
          </p>
          <div className="mt-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200">
            <p className="font-bold text-amber-950">Cómo abrir en tu navegador nativo:</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-amber-900 font-medium">
              <li>Toca el menú de <strong>tres puntos (⋮ o ⋯)</strong> en la esquina superior o inferior.</li>
              <li>
                Selecciona <strong>{tabActiva === 'ios' ? '"Abrir en Safari"' : '"Abrir en Chrome o navegador"'}</strong>.
              </li>
              <li>Sigue los pasos que verás a continuación.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 1: iPHONE / iPAD (iOS PWA)                        */}
      {/* ========================================================= */}
      {tabActiva === 'ios' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Tarjeta className="border-2 border-blue-400/30 bg-gradient-to-b from-white via-white to-blue-50/40 p-5 text-center shadow-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600 border border-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>PWA OFICIAL PARA iOS (SIN APP STORE)</span>
            </div>

            <h1 className="mt-3 text-2xl font-black text-zinc-950">
              Instala TOTALHIIT en tu iPhone o iPad
            </h1>
            <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
              No necesitas cuenta de App Store ni pagar suscripciones de tienda. Disfruta de la app en pantalla completa, privada y rápida.
            </p>

            {/* Paso a paso ilustrado con estética Apple */}
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-zinc-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white text-xs shadow-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-xs text-zinc-900">
                    Abre esta página en <span className="text-blue-600 font-bold">Safari</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Es indispensable usar Safari para que aparezca la opción de instalación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-zinc-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white text-xs shadow-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-xs text-zinc-900">
                    Toca el botón <span className="text-blue-600 font-bold">Compartir ⎋</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Está en la barra inferior de Safari (el recuadro con la flecha hacia arriba).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-zinc-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white text-xs shadow-xs">
                  3
                </div>
                <div>
                  <p className="font-bold text-xs text-zinc-900">
                    Selecciona <span className="text-zinc-950 font-bold">&quot;Añadir a pantalla de inicio&quot; ➕</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Desplaza hacia abajo en las opciones de Safari y toca el signo (+).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-xs shadow-xs">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-xs text-emerald-950">
                    Toca &quot;Añadir&quot; en la esquina superior derecha
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    ¡Listo! El icono de TOTALHIIT se añadirá a tu pantalla. Ábrela y funcionará como una aplicación nativa.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón directo a la App */}
            <div className="mt-5 space-y-2">
              <Link
                to="/"
                className="flex w-full min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95"
              >
                <span>🚀</span>
                <span>Comenzar a Usar TOTALHIIT Ahora</span>
              </Link>
              <p className="text-[11px] text-zinc-500">
                Tus datos de salud y entrenamientos se guardarán en tu iPhone de forma privada.
              </p>
            </div>
          </Tarjeta>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: ANDROID (APK OFICIAL)                          */}
      {/* ========================================================= */}
      {tabActiva === 'android' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Tarjeta className="border-2 border-marca-magenta/30 bg-gradient-to-b from-white via-white to-pink-50/50 p-5 text-center shadow-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-marca-magenta/10 px-3 py-1 text-xs font-black text-marca-magenta">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ÚLTIMA VERSIÓN DISPONIBLE: v{versionMostrar}</span>
            </div>

            <h1 className="mt-3 text-2xl font-black text-zinc-900">
              App TOTALHIIT para Android
            </h1>
            <p className="mt-1 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
              Instala la aplicación en tu celular para acceder a entrenamientos en video, menús semanales, escáner con IA y seguimiento de hábitos.
            </p>

            {/* Botón de Descarga Directa Nativa */}
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
                Archivo oficial APK (~24 MB) · 100% Libre de virus · Actualización en 1 clic
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
              </div>
            )}
          </Tarjeta>

          {/* Guía Destacada: Cómo permitir fuentes desconocidas / desbloquear APK */}
          <div className="rounded-2xl border-2 border-emerald-400/40 bg-white p-5 shadow-sm text-xs text-zinc-700">
            <div className="flex items-center gap-2 font-black text-sm text-zinc-950">
              <span className="text-lg">🛡️</span>
              <span>Cómo instalar el APK si Android muestra una advertencia de seguridad</span>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-600 leading-relaxed">
              Como descargas la app directamente desde nuestro sitio oficial sin pasar por Google Play, los celulares Android muestran un aviso de protección preventivo. Es 100% normal y seguro. Sigue estos 4 pasos:
            </p>

            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  1
                </span>
                <div>
                  <p className="font-bold text-zinc-900 text-[11px]">Toca &quot;Descargar de todos modos&quot;</p>
                  <p className="text-[10px] text-zinc-500">Si Chrome advierte que el archivo puede ser dañino, confirma la descarga.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  2
                </span>
                <div>
                  <p className="font-bold text-zinc-900 text-[11px]">Abre el archivo descargado</p>
                  <p className="text-[10px] text-zinc-500">Toca la notificación de descarga finalizada o búscalo en la carpeta &quot;Descargas&quot; de tu celular.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  3
                </span>
                <div>
                  <p className="font-bold text-zinc-900 text-[11px]">Desactiva el bloqueo de fuentes desconocidas</p>
                  <p className="text-[10px] text-zinc-500">
                    Si te aparece <em>&quot;Por seguridad, tu teléfono no tiene permitido instalar apps desconocidas de esta fuente&quot;</em>, pulsa <strong>Ajustes / Configuración</strong> y activa la casilla <strong>&quot;Permitir desde esta fuente&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  4
                </span>
                <div>
                  <p className="font-bold text-emerald-950 text-[11px]">Vuelve atrás y pulsa &quot;Instalar&quot;</p>
                  <p className="text-[10px] text-emerald-800">¡Listo! La aplicación quedará instalada en tu teléfono y se actualizará automáticamente en el futuro.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: AMAZON FIRE TABLETS                            */}
      {/* ========================================================= */}
      {tabActiva === 'amazon' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Tarjeta className="border-2 border-amber-400/40 bg-gradient-to-b from-white via-white to-amber-50/40 p-5 text-center shadow-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 border border-amber-300">
              <span>TABLETS AMAZON FIRE (OS 7, 8 Y SUPERIORES)</span>
            </div>

            <h1 className="mt-3 text-2xl font-black text-zinc-950">
              TOTALHIIT en Amazon Appstore
            </h1>
            <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
              Optimizado para pantallas Fire 7, Fire HD 8, Fire HD 10 y Fire Max 11.
            </p>

            <div className="mt-5 space-y-3 text-left text-xs text-zinc-700">
              <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs">
                <p className="font-bold text-zinc-900">1. Desde la tienda Amazon Appstore:</p>
                <p className="mt-1 text-[11px] text-zinc-600 leading-relaxed">
                  Busca <strong>TOTALHIIT</strong> directamente en la tienda oficial de aplicaciones de tu Tablet Fire para instalar en un toque.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs">
                <p className="font-bold text-zinc-900">2. Instalación directa por APK:</p>
                <p className="mt-1 text-[11px] text-zinc-600 leading-relaxed">
                  También puedes descargar el archivo APK directamente en tu tablet Fire usando el navegador Silk.
                </p>
                <div className="mt-3">
                  <a
                    href={URL_DESCARGA_APK}
                    download="totalhiit.apk"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-md hover:bg-amber-400 active:scale-95 transition"
                  >
                    <span>📥</span>
                    <span>Descargar APK para Tablet Fire</span>
                  </a>
                </div>
              </div>
            </div>
          </Tarjeta>
        </div>
      )}
    </main>
  );
}
