import { Link } from 'react-router';
import { BotonPrimario, Tarjeta } from '../componentes/ui';
import BannerSeccion from '../componentes/BannerSeccion';
import { ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { usePerfil } from '../hooks/usePerfil';
import { useSuscripcion } from '../hooks/useSuscripcion';

export default function Inicio() {
  const { cargando, perfil, objetivo } = usePerfil();
  const { anuncio } = useSuscripcion();

  const esAppInstalada =
    typeof window !== 'undefined' &&
    (Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) ||
      window.matchMedia('(display-mode: standalone)').matches);

  if (cargando) return null;

  if (!perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-32 pt-6">
        <div className="text-center">
          <p className="font-marca text-4xl text-marca-magenta">TOTALHIIT</p>
          <p className="mt-2 text-sm text-zinc-500">Entrenamiento y nutrición para mujeres +40</p>
        </div>
        <Tarjeta className="mt-6 text-center">
          <p className="text-2xl" aria-hidden="true">
            💜
          </p>
          <h1 className="mt-2 text-lg font-bold text-zinc-900">Empecemos</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Configura tu perfil para recibir entrenamientos y recetas pensadas para ti.
          </p>
          <Link to="/onboarding" className="mt-4 inline-block">
            <BotonPrimario>Completar mi perfil</BotonPrimario>
          </Link>
        </Tarjeta>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500">Bienvenida,</p>
          <h1 className="text-2xl font-bold text-zinc-900">{perfil.alias} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            title="Panel de Administración"
            className="rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-sm hover:bg-zinc-50"
          >
            👑
          </Link>
          <Link
            to="/ajustes"
            title="Ajustes"
            className="rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-sm hover:bg-zinc-50"
          >
            ⚙️
          </Link>
        </div>
      </div>

      {/* Banner hero animado de TOTALHIIT */}
      <BannerSeccion
        etiqueta="TOTAL+40"
        titulo="Tu bienestar cada día"
        subtitulo="Entrenamiento HIIT adaptado, nutrición antiinflamatoria y salud integral guiada por Valentina."
        videoSrc="/videos/intro-totalhiit.mp4"
        imagenSrc="/images/valentina/totalhiit_1.jpg"
        insignia="Coach Valentina"
        altura="h-44"
      />

      {/* Aviso o Promoción del Administrador si está activo */}
      {anuncio && (
        <div
          className={`rounded-2xl p-4 text-xs shadow-sm border ${
            anuncio.tipo === 'promocion'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : anuncio.tipo === 'update'
                ? 'border-purple-200 bg-purple-50 text-purple-900'
                : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">
              {anuncio.tipo === 'promocion' ? '🎉' : anuncio.tipo === 'update' ? '📲' : 'ℹ️'}
            </span>
            <p className="font-bold">{anuncio.titulo}</p>
          </div>
          <p className="mt-1 leading-relaxed text-zinc-700">{anuncio.mensaje}</p>
          {anuncio.enlace && (
            <a
              href={anuncio.enlace}
              className="mt-2 inline-block font-bold text-marca-magenta underline"
            >
              Ver más detalles →
            </a>
          )}
        </div>
      )}

      {/* Banner de instalación APK SOLO en navegador web cuando NO está instalada */}
      {!esAppInstalada && (
        <Tarjeta className="border border-purple-200 bg-purple-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">App para Android</p>
              <p className="mt-1 text-sm font-semibold text-zinc-800">
                Instala TOTALHIIT directamente en tu celular como app nativa.
              </p>
            </div>
            <span className="text-2xl">📱</span>
          </div>
          <a
            href="/totalhiit.apk"
            download="totalhiit.apk"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-marca-magenta px-4 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-marca-magenta-oscuro"
          >
            Descargar APK para Android
          </a>
        </Tarjeta>
      )}

      {objetivo && (
        <Tarjeta className="bg-marca-crema">
          <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta-oscuro">Tu objetivo</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{ETIQUETAS_OBJETIVO[objetivo.tipo]}</p>
          <p className="mt-1 text-xs text-zinc-600">Se adapta a lo que haces en Nutrición y Entrenamientos.</p>
        </Tarjeta>
      )}

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Salud</p>
        <p className="mt-1 text-sm text-zinc-600">
          IMC, metabolismo, gasto diario, agua y proteína calculados con tus datos.
        </p>
        <Link to="/salud" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
          Ver mis cálculos →
        </Link>
      </Tarjeta>

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Entrenamiento</p>
        <p className="mt-1 text-sm text-zinc-600">
          Clases de tu programa TOTAL+40 en video, filtradas por tu equipo y tu objetivo.
        </p>
        <Link to="/entrenamientos" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
          Ver rutinas →
        </Link>
      </Tarjeta>

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Nutrición</p>
        <p className="mt-1 text-sm text-zinc-600">
          Recetas filtradas por tus alérgenos, tu tiempo de cocina y tu presupuesto.
        </p>
        <div className="mt-3 flex gap-4 text-sm font-semibold">
          <Link to="/nutricion" className="text-marca-magenta">
            Ver recetas →
          </Link>
          <Link to="/plan" className="text-marca-magenta">
            Plan semanal →
          </Link>
        </div>
      </Tarjeta>

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Progreso y ciclo</p>
        <p className="mt-1 text-sm text-zinc-600">
          Tus rachas, energía, sueño y —si lo activas— un calendario de ciclo privado y cifrado.
        </p>
        <div className="mt-3 flex gap-3 text-sm font-semibold">
          <Link to="/progreso" className="text-marca-magenta">
            Ver progreso →
          </Link>
          <Link to="/ciclo" className="text-zinc-500">
            Ciclo (privado) →
          </Link>
        </div>
      </Tarjeta>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
