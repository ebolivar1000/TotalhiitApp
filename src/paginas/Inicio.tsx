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
      <main className="safe-area-superior mx-auto max-w-md px-4 pb-32 pt-6">
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
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs font-semibold text-zinc-500">Bienvenida,</p>
          <h1 className="text-2xl font-bold text-zinc-900">{perfil.alias} 👋</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            title="Panel de Administración"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-lg shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            👑
          </Link>
          <Link
            to="/ajustes"
            title="Ajustes"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-lg shadow-sm transition hover:bg-zinc-50 active:scale-95"
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
            href={`/totalhiit.apk?_v=${Date.now()}`}
            download="totalhiit.apk"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-marca-magenta px-4 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-marca-magenta-oscuro"
          >
            Descargar APK para Android (v1.0.3)
          </a>
        </Tarjeta>
      )}

      {/* 1. Tu Objetivo / Plan */}
      {objetivo && (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
          <img
            src="/images/banner-objetivo.jpg"
            alt="Tu objetivo"
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="relative z-10 p-4 sm:p-5">
            <span className="inline-block rounded-full bg-marca-magenta/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              Tu Objetivo Principal
            </span>
            <p className="mt-1 text-xl font-bold text-white">{ETIQUETAS_OBJETIVO[objetivo.tipo]}</p>
            <p className="mt-1 text-xs text-zinc-300">
              Personalizado para tu ritmo y adaptado a lo que haces en Nutrición y Entrenamientos.
            </p>
            <Link
              to="/plan"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
            >
              Ver mi plan semanal →
            </Link>
          </div>
        </div>
      )}

      {/* 2. Salud */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
        <img
          src="/images/banner-salud.jpg"
          alt="Salud y Métricas"
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <span className="inline-block rounded-full bg-purple-600/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            ❤️ Calculadoras de Salud
          </span>
          <p className="mt-1 text-xl font-bold text-white">Salud y Composición Corporal</p>
          <p className="mt-1 text-xs text-zinc-300">
            IMC, metabolismo basal, gasto calórico diario, agua recomendada y proteína óptima para +40.
          </p>
          <Link
            to="/salud"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            Ver mis cálculos de salud →
          </Link>
        </div>
      </div>

      {/* 3. Entrenamiento */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
        <img
          src="/images/banner-entrenamiento.jpg"
          alt="Entrenamientos TOTAL+40"
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <span className="inline-block rounded-full bg-marca-magenta/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            🔥 Programa TOTAL+40
          </span>
          <p className="mt-1 text-xl font-bold text-white">Entrenamiento y Fuerza</p>
          <p className="mt-1 text-xs text-zinc-300">
            Clases en video organizadas semana a semana, adaptadas a tus articulaciones y tu equipamiento.
          </p>
          <Link
            to="/entrenamientos"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            Explorar mis rutinas →
          </Link>
        </div>
      </div>

      {/* 4. Nutrición */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
        <img
          src="/images/banner-nutricion.jpg"
          alt="Nutrición Antiinflamatoria"
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <span className="inline-block rounded-full bg-emerald-600/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            🥗 Nutrición Inteligente
          </span>
          <p className="mt-1 text-xl font-bold text-white">Alimentación y Recetas</p>
          <p className="mt-1 text-xs text-zinc-300">
            Comidas saludables y balanceadas filtradas por tus alérgenos, tiempo de cocina y presupuesto.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/nutricion"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
            >
              Ver recetas →
            </Link>
            <Link
              to="/plan"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/30 active:scale-95"
            >
              Plan semanal y compras →
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Progreso */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
        <img
          src="/images/banner-progreso.jpg"
          alt="Progreso y Hábitos"
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <span className="inline-block rounded-full bg-amber-500/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            📊 Seguimiento Diario
          </span>
          <p className="mt-1 text-xl font-bold text-white">Progreso y Hábitos</p>
          <p className="mt-1 text-xs text-zinc-300">
            Rachas de actividad, energía, horas de sueño, hidratación y gráficos de constancia.
          </p>
          <Link
            to="/progreso"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            Ver mi progreso →
          </Link>
        </div>
      </div>

      {/* 6. Ciclo Menstrual */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm">
        <img
          src="/images/banner-ciclo.jpg"
          alt="Ciclo Menstrual y Bienestar"
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <span className="inline-block rounded-full bg-pink-500/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            🌸 Bienestar Femenino
          </span>
          <p className="mt-1 text-xl font-bold text-white">Ciclo Menstrual</p>
          <p className="mt-1 text-xs text-zinc-300">
            Calendario flexible con fechas personalizables, fases hormonales y privacidad estricta.
          </p>
          <Link
            to="/ciclo"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            Abrir calendario de ciclo →
          </Link>
        </div>
      </div>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
