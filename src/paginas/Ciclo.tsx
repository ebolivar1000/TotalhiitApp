import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BotonPrimario, BotonSecundario, Campo, Tarjeta, ChipsMulti, ChipInput, EntradaTexto } from '../componentes/ui';
import {
  ETIQUETAS_FLUJO,
  FLUJOS_CICLO,
  SINTOMAS_CICLO,
  type CicloRegistro,
  type DatosCiclo,
  type FlujoCiclo,
} from '../lib/datos/entidades';
import {
  borrarRegistroCiclo,
  borrarTodosRegistrosCiclo,
  guardarRegistroCiclo,
  otorgarConsentimiento,
  registrosCicloLegibles,
  revocarConsentimiento,
  tieneConsentimiento,
} from '../lib/datos/repositorio';
import {
  episodiosSangrado,
  estimarCiclo,
  estadoDeHoy,
  calcularSemanaCiclo,
  construirHistorialMesAMes,
  type EstadoHoy,
} from '../lib/ciclo/estimaciones';
import { diasEntre, sumarDias } from '../lib/progreso/metricas';
import { fechaHoyIso, isoAFecha } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';
import BannerSeccion from '../componentes/BannerSeccion';

type RegistroLegible = CicloRegistro & { datos: DatosCiclo };

const fechaCorta = (iso: string) => iso.slice(5).split('-').reverse().join('/');

const ETIQUETAS_ESTADO: Record<EstadoHoy, string> = {
  en_ventana: 'Estamos dentro de la ventana estimada.',
  antes_de_ventana: 'La ventana estimada todavía no empieza.',
  despues_de_ventana: 'La ventana estimada ya pasó: si hubo sangrado, regístralo para recalibrar.',
  sin_estimacion: '',
};

/** Calendario interactivo del mes con soporte para selección de fecha y cambio de mes */
function CalendarioCiclo({
  fechaSeleccionada,
  onSeleccionarFecha,
  fechasSangrado,
  fechasManchado,
  ventanaDesde,
  ventanaHasta,
}: {
  fechaSeleccionada: string;
  onSeleccionarFecha: (iso: string) => void;
  fechasSangrado: Set<string>;
  fechasManchado: Set<string>;
  ventanaDesde?: string;
  ventanaHasta?: string;
}) {
  const hoyIso = fechaHoyIso();
  const [mesOffset, setMesOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = isoAFecha(hoyIso);
    return new Date(d.getFullYear(), d.getMonth() + mesOffset, 1);
  }, [hoyIso, mesOffset]);

  const anio = baseDate.getFullYear();
  const mes = baseDate.getMonth();
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const prefijo = `${anio}-${String(mes + 1).padStart(2, '0')}-`;
  const nombreMes = baseDate.toLocaleDateString('es', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMesOffset((m) => m - 1)}
          className="rounded-lg p-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
          aria-label="Mes anterior"
        >
          ← Anterior
        </button>
        <p className="text-sm font-bold capitalize text-zinc-800">{nombreMes}</p>
        <button
          type="button"
          onClick={() => setMesOffset((m) => m + 1)}
          className="rounded-lg p-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
          aria-label="Mes siguiente"
        >
          Siguiente →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`vacio-${i}`} />
        ))}
        {Array.from({ length: diasMes }, (_, i) => i + 1).map((dia) => {
          const iso = `${prefijo}${String(dia).padStart(2, '0')}`;
          const enVentana =
            ventanaDesde !== undefined && ventanaHasta !== undefined && iso >= ventanaDesde && iso <= ventanaHasta;
          const sangrado = fechasSangrado.has(iso);
          const manchado = fechasManchado.has(iso);
          const esSeleccionado = iso === fechaSeleccionada;
          const esHoy = iso === hoyIso;

          let colorFondo = 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100';
          if (sangrado) {
            colorFondo = 'bg-marca-magenta font-bold text-white shadow-sm';
          } else if (manchado) {
            colorFondo = 'bg-marca-rosa/70 font-semibold text-white';
          } else if (enVentana) {
            colorFondo = 'border border-dashed border-marca-magenta/60 bg-marca-crema text-zinc-800';
          }

          return (
            <button
              type="button"
              key={iso}
              onClick={() => onSeleccionarFecha(iso)}
              title={`${iso}${sangrado ? ' · Sangrado' : manchado ? ' · Manchado' : enVentana ? ' · Ventana estimada' : ''}`}
              className={`flex h-9 items-center justify-center rounded-xl text-xs transition-transform active:scale-95 ${colorFondo} ${
                esSeleccionado ? 'ring-2 ring-marca-magenta ring-offset-2 font-bold' : ''
              } ${esHoy && !esSeleccionado ? 'border-2 border-zinc-400 font-semibold' : ''}`}
            >
              {dia}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-marca-magenta" /> Sangrado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-marca-rosa/70" /> Manchado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded border border-dashed border-marca-magenta/60 bg-marca-crema" />{' '}
          Ventana estimada
        </span>
      </div>
      <p className="mt-1 text-center text-[10px] text-zinc-400">
        Toca cualquier día del calendario para ver o registrar datos.
      </p>
    </div>
  );
}

export default function Ciclo() {
  const { cargando, perfil } = usePerfil();
  const [consentimiento, setConsentimiento] = useState<boolean | null>(null);
  const [registros, setRegistros] = useState<RegistroLegible[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Fecha seleccionada para registro individual
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => fechaHoyIso());
  const [modoRegistro, setModoRegistro] = useState<'dia' | 'rango'>('dia');

  // Formulario día individual
  const [flujo, setFlujo] = useState<FlujoCiclo | ''>('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [notas, setNotas] = useState('');

  // Formulario de rango completo (inicio y fin)
  const [rangoInicio, setRangoInicio] = useState<string>(() => fechaHoyIso());
  const [rangoFin, setRangoFin] = useState<string>(() => fechaHoyIso());
  const [flujoRango, setFlujoRango] = useState<FlujoCiclo>('medio');

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(0);

  const cargarRegistros = async (userId: string) => {
    setRegistros(await registrosCicloLegibles(userId));
  };

  useEffect(() => {
    if (!perfil) {
      setCargandoDatos(false);
      return;
    }
    void (async () => {
      setConsentimiento(await tieneConsentimiento(perfil.id, 'menstrual'));
      setCargandoDatos(false);
    })();
  }, [perfil]);

  // Al cambiar la fecha seleccionada, precarga los datos de esa fecha si ya existen
  useEffect(() => {
    if (consentimiento !== true || cargandoDatos) return;
    const reg = registros.find((r) => r.fecha === fechaSeleccionada);
    setFlujo(reg?.datos.flujo ?? '');
    setSintomas(reg?.datos.sintomas ?? []);
    setNotas(reg?.datos.notas ?? '');
    setMensaje('');
    setError('');
  }, [consentimiento, cargandoDatos, registros, fechaSeleccionada]);

  const activar = async () => {
    if (!perfil) return;
    await otorgarConsentimiento(perfil.id, 'menstrual');
    setConsentimiento(true);
    await cargarRegistros(perfil.id);
  };

  useEffect(() => {
    if (consentimiento === true && perfil) {
      void cargarRegistros(perfil.id);
    }
  }, [consentimiento, perfil]);

  // Guardar registro individual de fecha seleccionada
  const guardarDia = async () => {
    if (!perfil) return;
    setError('');
    setMensaje('');
    if (!flujo) {
      setError('Elige la intensidad del flujo para guardar el registro.');
      return;
    }
    await guardarRegistroCiclo(perfil.id, fechaSeleccionada, {
      flujo,
      sintomas,
      notas: notas.trim() === '' ? undefined : notas.trim(),
    });
    await cargarRegistros(perfil.id);
    setMensaje(`¡Registro guardado para el ${fechaCorta(fechaSeleccionada)}! 💜`);
  };

  // Borrar registro de la fecha seleccionada
  const borrarDia = async () => {
    if (!perfil) return;
    const reg = registros.find((r) => r.fecha === fechaSeleccionada);
    if (!reg) return;
    await borrarRegistroCiclo(perfil.id, fechaSeleccionada);
    await cargarRegistros(perfil.id);
    setFlujo('');
    setSintomas([]);
    setNotas('');
    setMensaje(`Registro del ${fechaCorta(fechaSeleccionada)} eliminado.`);
  };

  // Guardar período completo (rango inicio y fin)
  const guardarRango = async () => {
    if (!perfil) return;
    setError('');
    setMensaje('');
    if (!rangoInicio || !rangoFin) {
      setError('Selecciona las fechas de inicio y fin del ciclo.');
      return;
    }
    if (rangoInicio > rangoFin) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    const cur = new Date(rangoInicio + 'T00:00:00');
    const end = new Date(rangoFin + 'T00:00:00');
    let diasGuardados = 0;

    while (cur <= end) {
      const iso = cur.toISOString().slice(0, 10);
      await guardarRegistroCiclo(perfil.id, iso, {
        flujo: flujoRango,
        sintomas: [],
      });
      diasGuardados++;
      cur.setDate(cur.getDate() + 1);
    }

    await cargarRegistros(perfil.id);
    setMensaje(`¡Período registrado con éxito (${diasGuardados} días del ${fechaCorta(rangoInicio)} al ${fechaCorta(rangoFin)})! 💜`);
  };

  // Desactivar y borrar todos los datos del módulo
  const desactivar = async () => {
    if (!perfil) return;
    if (confirmandoBorrado === 0) {
      setConfirmandoBorrado(1);
      return;
    }
    await borrarTodosRegistrosCiclo(perfil.id);
    await revocarConsentimiento(perfil.id, 'menstrual');
    setConsentimiento(false);
    setRegistros([]);
    setConfirmandoBorrado(0);
  };

  const hoy = useMemo(() => fechaHoyIso(), []);

  // Métricas y conjuntos de fechas
  const episodios = useMemo(
    () => episodiosSangrado(registros.map((r) => r.fecha)),
    [registros],
  );
  const estimacion = useMemo(() => estimarCiclo(registros, hoy), [registros, hoy]);
  const estado = useMemo(() => estadoDeHoy(estimacion, hoy), [estimacion, hoy]);

  // Episodio más reciente y cálculo de la semana actual
  const ultimoEpisodio = episodios.length > 0 ? episodios[episodios.length - 1] : undefined;
  const ultimoInicio = ultimoEpisodio?.inicio;

  const infoSemana = useMemo(() => {
    if (!ultimoInicio) return null;
    return calcularSemanaCiclo(ultimoInicio, hoy);
  }, [ultimoInicio, hoy]);

  // Historial estructurado mes a mes
  const historialMeses = useMemo(() => construirHistorialMesAMes(episodios), [episodios]);

  // Estimaciones clave para panel rápido
  const proximoInicio = useMemo(() => {
    if (estimacion.suficiente) return estimacion.proximoInicioEstimado;
    if (ultimoInicio) return sumarDias(ultimoInicio, 28);
    return null;
  }, [estimacion, ultimoInicio]);

  const cuentaRegresivaTexto = useMemo(() => {
    if (!proximoInicio) return 'Sin registros';
    const diff = diasEntre(hoy, proximoInicio);
    if (diff > 1) return `Faltan ${diff} días`;
    if (diff === 1) return 'Mañana es el día previsto';
    if (diff === 0) return 'Hoy es el día previsto';
    return `${Math.abs(diff)} días de retraso`;
  }, [hoy, proximoInicio]);

  const duracionPromedioDias = useMemo(() => {
    if (estimacion.suficiente) return estimacion.duracionPromedio;
    return 28;
  }, [estimacion]);

  const variacionPromedioDias = useMemo(() => {
    if (estimacion.suficiente) return estimacion.variacionPromedio;
    return 2;
  }, [estimacion]);

  const diasSangradoPromedio = useMemo(() => {
    if (episodios.length === 0) return 5;
    const total = episodios.reduce((acc, ep) => acc + ep.diasSangrado, 0);
    return Math.round((total / episodios.length) * 10) / 10;
  }, [episodios]);

  const fechasSangrado = useMemo(
    () => new Set(registros.filter((r) => r.datos.flujo !== 'manchado').map((r) => r.fecha)),
    [registros],
  );
  const fechasManchado = useMemo(
    () => new Set(registros.filter((r) => r.datos.flujo === 'manchado').map((r) => r.fecha)),
    [registros],
  );

  const regFechaSeleccionada = registros.find((r) => r.fecha === fechaSeleccionada);

  if (cargando || cargandoDatos || consentimiento === null) {
    return (
      <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-marca-magenta border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-700">Cargando ciclo menstrual…</p>
        </div>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="safe-area-superior mx-auto max-w-md px-4 pb-48 pt-6 text-center">
        <Tarjeta>
          <p className="text-3xl mb-2">🌸</p>
          <h2 className="font-bold text-zinc-900 mb-1">Completa tu perfil</h2>
          <p className="text-sm text-zinc-600">Completa tu perfil primero para activar el seguimiento de tu ciclo.</p>
          <Link to="/onboarding" className="mt-4 inline-block rounded-xl bg-marca-magenta px-4 py-2.5 text-sm font-bold text-white shadow">
            Ir al onboarding
          </Link>
        </Tarjeta>
      </main>
    );
  }

  // Pantalla de consentimiento
  if (!consentimiento) {
    return (
      <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
        <Tarjeta>
          <h1 className="text-xl font-bold text-zinc-900">Ciclo menstrual</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Este módulo es opcional y privado. Antes de entrar, lo que necesitas saber:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>🔐 Tus registros (días de sangrado, síntomas, notas) se <strong>cifran en este dispositivo</strong> antes de guardarse.</li>
            <li>🗑️ Puedes borrar todo cuando quieras; también desde Ajustes con el borrado total.</li>
            <li>📊 Las estimaciones muestran rangos e incertidumbre: no son fechas exactas y no reemplazan la consulta con profesionales de la salud.</li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Al activarlo otorgas tu consentimiento para el tratamiento local de estos datos con fines de seguimiento orientativo.
          </p>
          <BotonPrimario onClick={() => void activar()} className="mt-4 w-full">
            Activar módulo de ciclo (privado)
          </BotonPrimario>
        </Tarjeta>
      </main>
    );
  }

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con imagen de Valentina */}
      <BannerSeccion
        etiqueta="Privacidad Estricta"
        titulo="Ciclo y Bienestar Hormonal"
        subtitulo="Registros 100% privados y cifrados exclusivamente en tu dispositivo."
        imagenSrc="/images/banner-ciclo.jpg"
        insignia="Cifrado Local"
      />

      {/* 1. TARJETA PRINCIPAL ESTILO FLO / CLUE: "¿EN QUÉ SEMANA ESTÁS HOY?" */}
      {infoSemana ? (
        <div className={`relative overflow-hidden rounded-3xl border ${infoSemana.colorBorde} ${infoSemana.colorBg} p-5 shadow-sm`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold shadow-xs backdrop-blur">
                <span>{infoSemana.icono}</span>
                <span className={infoSemana.colorClase}>Día {infoSemana.diaCiclo} de tu ciclo</span>
              </span>
              <h2 className="mt-2 text-2xl font-black text-zinc-900 tracking-tight">
                {infoSemana.nombreFase}
              </h2>
              <p className="mt-1 text-xs font-medium text-zinc-600 max-w-xs">
                {infoSemana.descripcionFase}
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                Semana {infoSemana.semana}
              </span>
              <span className="mt-1 text-[10px] text-zinc-400 font-semibold uppercase">del ciclo</span>
            </div>
          </div>

          {/* Barra de progreso de las 4 fases */}
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((s) => {
              const esActiva = s === infoSemana.semana;
              const esPasada = s < infoSemana.semana;
              return (
                <div key={s} className="flex flex-col gap-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      esActiva
                        ? 'bg-marca-magenta ring-2 ring-marca-magenta/30'
                        : esPasada
                        ? 'bg-zinc-400/80'
                        : 'bg-zinc-200'
                    }`}
                  />
                  <span className={`text-[10px] text-center font-bold ${esActiva ? 'text-marca-magenta font-black' : 'text-zinc-400'}`}>
                    Sem {s}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tarjeta de recomendación de Totalhiit y botón directo a los videos de la semana */}
          <div className="mt-4 rounded-2xl bg-white/95 p-4 shadow-xs backdrop-blur border border-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-sm">
                🏋️‍♀️
              </span>
              <div>
                <p className="text-xs font-bold text-zinc-900">Tu entrenamiento recomendado para hoy</p>
                <p className="text-[11px] text-zinc-600">{infoSemana.recomendacionTotalhiit}</p>
              </div>
            </div>

            <Link
              to={`/entrenamientos?semana=${infoSemana.semanaVideo}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-98"
            >
              <span>▶️ Ir a videos de la Semana {infoSemana.semanaVideo}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-pink-200 bg-pink-50/60 p-5 shadow-sm text-center">
          <p className="text-3xl">🌸</p>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">¿En qué semana de tu ciclo estás?</h2>
          <p className="mt-1 text-xs text-zinc-600 max-w-sm mx-auto">
            Registra la fecha de tu último período abajo para saber en qué semana y fase hormonal te encuentras hoy, y adaptar tus entrenamientos de Totalhiit.
          </p>
          <button
            type="button"
            onClick={() => setModoRegistro('rango')}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-marca-magenta px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-marca-magenta-oscuro"
          >
            + Registrar último período
          </button>
        </div>
      )}

      {/* 2. PANEL DE MÉTRICAS RÁPIDAS Y ESTIMACIONES (Flo / Clue style) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Próximo período */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Próximo ciclo</span>
          <p className="mt-1 text-base font-extrabold text-zinc-900">
            {proximoInicio ? fechaCorta(proximoInicio) : 'Sin datos'}
          </p>
          <p className="text-[11px] font-semibold text-marca-magenta">
            {cuentaRegresivaTexto}
          </p>
        </div>

        {/* Duración promedio */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Duración promedio</span>
          <p className="mt-1 text-base font-extrabold text-zinc-900">
            {duracionPromedioDias} días
          </p>
          <p className="text-[11px] text-zinc-500">
            {episodios.length > 1 ? `En ${episodios.length} ciclos` : 'Referencia inicial'}
          </p>
        </div>

        {/* Variación promedio */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Variación promedio</span>
          <p className="mt-1 text-base font-extrabold text-zinc-900">
            ± {variacionPromedioDias} días
          </p>
          <p className="text-[11px] text-zinc-500">
            {estimacion.suficiente && estimacion.irregular ? 'Variación alta' : 'Rango regular'}
          </p>
        </div>

        {/* Días de sangrado habitual */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sangrado habitual</span>
          <p className="mt-1 text-base font-extrabold text-zinc-900">
            {diasSangradoPromedio} días
          </p>
          <p className="text-[11px] text-zinc-500">
            Duración media
          </p>
        </div>
      </div>

      {/* 3. CALENDARIO INTERACTIVO */}
      <Tarjeta>
        <h2 className="mb-2 font-bold text-zinc-900">Calendario del ciclo</h2>
        <CalendarioCiclo
          fechaSeleccionada={fechaSeleccionada}
          onSeleccionarFecha={setFechaSeleccionada}
          fechasSangrado={fechasSangrado}
          fechasManchado={fechasManchado}
          ventanaDesde={estimacion?.suficiente ? estimacion.ventanaDesde : proximoInicio ? sumarDias(proximoInicio, -2) : undefined}
          ventanaHasta={estimacion?.suficiente ? estimacion.ventanaHasta : proximoInicio ? sumarDias(proximoInicio, 2) : undefined}
        />
      </Tarjeta>

      {/* 4. REGISTRO FLEXIBLE: Por día o por rango de ciclo completo */}
      <Tarjeta>
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="font-bold text-zinc-900">Registrar ciclo</h2>
          <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setModoRegistro('dia')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                modoRegistro === 'dia' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
              }`}
            >
              Por día
            </button>
            <button
              type="button"
              onClick={() => setModoRegistro('rango')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                modoRegistro === 'rango' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
              }`}
            >
              Período completo
            </button>
          </div>
        </div>

        {modoRegistro === 'dia' ? (
          /* MODO DÍA INDIVIDUAL */
          <div className="mt-3 space-y-4">
            <Campo etiqueta="Fecha a registrar">
              <div className="flex gap-2">
                <EntradaTexto
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="flex-1"
                />
                {fechaSeleccionada !== fechaHoyIso() && (
                  <BotonSecundario
                    type="button"
                    onClick={() => setFechaSeleccionada(fechaHoyIso())}
                    className="shrink-0 px-3 py-1.5 text-xs"
                  >
                    Hoy
                  </BotonSecundario>
                )}
              </div>
            </Campo>

            {regFechaSeleccionada && (
              <p className="rounded-lg bg-pink-50 p-2 text-xs font-semibold text-marca-magenta">
                ✓ Ya tienes un registro para el {fechaCorta(fechaSeleccionada)}. Puedes modificarlo o borrarlo abajo.
              </p>
            )}

            <Campo etiqueta="Intensidad del flujo" error={error}>
              <div className="flex flex-wrap gap-2">
                {FLUJOS_CICLO.map((f) => {
                  const activo = flujo === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => setFlujo(activo ? '' : f)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        activo
                          ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro'
                          : 'border-zinc-300 bg-white text-zinc-600'
                      }`}
                    >
                      {ETIQUETAS_FLUJO[f]}
                    </button>
                  );
                })}
              </div>
            </Campo>

            <Campo etiqueta="Síntomas (opcional)">
              <ChipsMulti
                opciones={SINTOMAS_CICLO.map((s) => ({ valor: s, etiqueta: s }))}
                valor={sintomas}
                onChange={setSintomas}
              />
              <div className="mt-2">
                <ChipInput opcionesSugeridas={[]} valor={sintomas} onChange={setSintomas} placeholder="Otro síntoma…" />
              </div>
            </Campo>

            <Campo etiqueta="Notas (opcional)" htmlFor="notas-ciclo">
              <EntradaTexto
                id="notas-ciclo"
                value={notas}
                maxLength={500}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Solo lo que quieras anotar (se guarda cifrado)"
              />
            </Campo>

            {mensaje && <p className="text-xs font-semibold text-green-700">{mensaje}</p>}

            <div className="flex gap-2">
              <BotonPrimario type="button" onClick={() => void guardarDia()} className="flex-1">
                {regFechaSeleccionada ? 'Actualizar registro' : 'Guardar registro'}
              </BotonPrimario>
              {regFechaSeleccionada && (
                <BotonSecundario type="button" onClick={() => void borrarDia()}>
                  Borrar este día
                </BotonSecundario>
              )}
            </div>
          </div>
        ) : (
          /* MODO RANGO (FECHA INICIO Y FIN DEL ÚLTIMO CICLO) */
          <div className="mt-3 space-y-4">
            <p className="text-xs text-zinc-600">
              Personaliza el rango exacto de fechas de inicio y fin de tu último sangrado para registrarlo de una sola vez:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Fecha de inicio" htmlFor="rango-inicio">
                <EntradaTexto
                  id="rango-inicio"
                  type="date"
                  value={rangoInicio}
                  onChange={(e) => setRangoInicio(e.target.value)}
                />
              </Campo>

              <Campo etiqueta="Fecha de fin" htmlFor="rango-fin">
                <EntradaTexto
                  id="rango-fin"
                  type="date"
                  value={rangoFin}
                  onChange={(e) => setRangoFin(e.target.value)}
                />
              </Campo>
            </div>

            <Campo etiqueta="Flujo predominante">
              <div className="flex flex-wrap gap-2">
                {FLUJOS_CICLO.filter((f) => f !== 'manchado').map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlujoRango(f)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      flujoRango === f
                        ? 'border-marca-magenta bg-marca-crema text-marca-magenta-oscuro'
                        : 'border-zinc-300 bg-white text-zinc-600'
                    }`}
                  >
                    {ETIQUETAS_FLUJO[f]}
                  </button>
                ))}
              </div>
            </Campo>

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            {mensaje && <p className="text-xs font-semibold text-green-700">{mensaje}</p>}

            <BotonPrimario type="button" onClick={() => void guardarRango()} className="w-full">
              Guardar período completo
            </BotonPrimario>
          </div>
        )}
      </Tarjeta>

      {/* 5. SEGUIMIENTO MES A MES (Flo / Clue style history) */}
      <Tarjeta>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">Seguimiento mes a mes</h2>
          <span className="text-xs font-semibold text-zinc-400">
            {historialMeses.length} {historialMeses.length === 1 ? 'ciclo registrado' : 'ciclos registrados'}
          </span>
        </div>

        {historialMeses.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no hay períodos registrados para mostrar el historial mes a mes.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {historialMeses.map((h, i) => (
              <div
                key={`${h.inicio}-${i}`}
                className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 transition hover:bg-zinc-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-sm">
                    {h.mesNombre} {h.anio}
                  </span>
                  {h.duracionCicloDias !== null ? (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                      Ciclo: {h.duracionCicloDias} días
                    </span>
                  ) : (
                    <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-700">
                      Ciclo en curso
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    🩸 Sangrado: <strong>{fechaCorta(h.inicio)}</strong> al <strong>{fechaCorta(h.fin)}</strong> ({h.diasSangrado} {h.diasSangrado === 1 ? 'día' : 'días'})
                  </span>
                  <span className={`text-[11px] font-semibold ${h.esRegular ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {h.esRegular ? '✓ Regular' : 'Variación alta'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>

      {/* 6. ESTIMACIÓN ORIENTATIVA DETALLADA */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Estimación y diagnóstico orientativo</h2>
        {estimacion && estimacion.suficiente ? (
          <div className="mt-2 space-y-1 text-sm text-zinc-700">
            <p>
              Tu ciclo promedio es de <strong>{estimacion.duracionPromedio} días</strong> (duraciones registradas entre {estimacion.duracionMinima} y{' '}
              {estimacion.duracionMaxima} días según tus últimos {estimacion.ciclosContados} ciclos).
            </p>
            <p>
              Próximo posible inicio: <strong>entre {fechaCorta(estimacion.ventanaDesde)} y {fechaCorta(estimacion.ventanaHasta)}</strong>{' '}
              (fecha central proyectada: {fechaCorta(estimacion.proximoInicioEstimado)}).
            </p>
            <p className="text-xs text-zinc-500">{ETIQUETAS_ESTADO[estado]}</p>
            {estimacion.irregular && (
              <p className="rounded-lg bg-marca-crema/70 px-3 py-2 text-xs text-zinc-700">
                {estimacion.motivoIrregularidad === 'fuera_de_rango'
                  ? 'Tus últimas duraciones quedaron fuera del rango típico (21–35 días): la ventana es más amplia. Es normal; si te preocupa, consúltalo con tu médica.'
                  : 'Tus ciclos varían bastante entre sí: por eso la ventana es más amplia. Es normal; si te preocupa, consúltalo con tu médica.'}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">
            {episodios.length === 0
              ? 'Registra tus días de sangrado para armar tu primer ciclo.'
              : 'Con un solo ciclo registrado usamos una estimación inicial de 28 días. Conforme registres tus próximos meses, se adaptará exactamente a tu ritmo biológico.'}
          </p>
        )}
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          Estimación con incertidumbre, no una fecha clínica exacta. No sirve para prevenir ni planificar embarazos y no reemplaza el consejo de profesionales de la salud.
        </p>
      </Tarjeta>

      {/* 7. CONTROL DEL MÓDULO Y PRIVACIDAD */}
      <Tarjeta>
        <h2 className="text-sm font-bold text-zinc-900">Desactivar el módulo</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Borra <strong>todos</strong> tus registros de ciclo de este dispositivo y desactiva el módulo.
        </p>
        {confirmandoBorrado > 0 && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            Esto no se puede deshacer. Toca de nuevo para confirmar.
          </p>
        )}
        <BotonSecundario type="button" onClick={() => void desactivar()} className="mt-3 w-full">
          {confirmandoBorrado > 0 ? 'Sí, borrar todo y desactivar' : 'Desactivar y borrar mis datos de ciclo'}
        </BotonSecundario>
      </Tarjeta>

      <p className="text-center text-[11px] text-zinc-400">
        Los registros se cifran con una clave AES-GCM que vive solo en este dispositivo y nunca viaja a internet.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
