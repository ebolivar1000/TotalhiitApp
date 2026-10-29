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
import { episodiosSangrado, estimarCiclo, estadoDeHoy, type EstadoHoy } from '../lib/ciclo/estimaciones';
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

  // Métricas y conjuntos de fechas
  const episodios = useMemo(
    () => episodiosSangrado(registros.map((r) => r.fecha)),
    [registros],
  );
  const estimacion = useMemo(() => estimarCiclo(registros, fechaHoyIso()), [registros]);
  const estado = useMemo(() => estadoDeHoy(estimacion, fechaHoyIso()), [estimacion]);

  const fechasSangrado = useMemo(
    () => new Set(registros.filter((r) => r.datos.flujo !== 'manchado').map((r) => r.fecha)),
    [registros],
  );
  const fechasManchado = useMemo(
    () => new Set(registros.filter((r) => r.datos.flujo === 'manchado').map((r) => r.fecha)),
    [registros],
  );

  const regFechaSeleccionada = registros.find((r) => r.fecha === fechaSeleccionada);

  if (cargando || cargandoDatos || consentimiento === null) return null;

  if (!perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-48 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">Completa tu perfil primero.</p>
          <Link to="/onboarding" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Ir al onboarding
          </Link>
        </Tarjeta>
      </main>
    );
  }

  // Pantalla de consentimiento
  if (!consentimiento) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
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
    <main className="mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con imagen de Valentina */}
      <BannerSeccion
        etiqueta="Privacidad Estricta"
        titulo="Ciclo y Bienestar Hormonal"
        subtitulo="Registros 100% privados y cifrados exclusivamente en tu dispositivo."
        imagenSrc="/images/valentina/totalhiit_6.jpg"
        insignia="Cifrado Local"
      />

      {/* 1. CALENDARIO PRIMERO (Requerimiento de usuario) */}
      <Tarjeta>
        <h2 className="mb-2 font-bold text-zinc-900">Calendario del ciclo</h2>
        <CalendarioCiclo
          fechaSeleccionada={fechaSeleccionada}
          onSeleccionarFecha={setFechaSeleccionada}
          fechasSangrado={fechasSangrado}
          fechasManchado={fechasManchado}
          ventanaDesde={estimacion?.suficiente ? estimacion.ventanaDesde : undefined}
          ventanaHasta={estimacion?.suficiente ? estimacion.ventanaHasta : undefined}
        />
      </Tarjeta>

      {/* 2. REGISTRO FLEXIBLE: Por día o por rango de ciclo completo */}
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

      {/* 3. ESTIMACIÓN ORIENTATIVA */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Estimación (orientativa)</h2>
        {estimacion && estimacion.suficiente ? (
          <div className="mt-2 space-y-1 text-sm text-zinc-700">
            <p>
              Tu ciclo promedio: <strong>{estimacion.duracionPromedio} días</strong> (entre {estimacion.duracionMinima} y{' '}
              {estimacion.duracionMaxima} según tus últimos {estimacion.ciclosContados} ciclos).
            </p>
            <p>
              Próximo posible inicio: <strong>entre {fechaCorta(estimacion.ventanaDesde)} y {fechaCorta(estimacion.ventanaHasta)}</strong>{' '}
              (centro de la ventana: {fechaCorta(estimacion.proximoInicioEstimado)}).
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
            {estimacion && !estimacion.suficiente && estimacion.motivo === 'sin_registros'
              ? 'Registra tus días de sangrado para armar tu primer ciclo.'
              : 'Con un solo ciclo registrado todavía no hay patrón: sigue registrando y en el próximo aparecerán rangos.'}
          </p>
        )}
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          Estimación con incertidumbre, no una fecha exacta. No sirve para prevenir ni planificar embarazos y no reemplaza el consejo de profesionales de la salud.
        </p>
      </Tarjeta>

      {/* 4. HISTORIAL */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Historial de ciclos</h2>
        {episodios.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no hay episodios de sangrado registrados.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-zinc-600">
            {episodios.map((e, i) => (
              <li key={e.inicio} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
                <span>
                  <span className="font-semibold text-zinc-800">Ciclo #{episodios.length - i}</span> · inicio{' '}
                  {fechaCorta(e.inicio)}
                </span>
                <span className="text-xs text-zinc-400">
                  {e.diasSangrado} {e.diasSangrado === 1 ? 'día' : 'días'} de sangrado
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      {/* 5. CONTROL DEL MÓDULO */}
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
        Los registros se cifran con una clave que vive solo en este dispositivo y nunca viaja a internet.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
