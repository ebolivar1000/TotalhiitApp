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

type RegistroLegible = CicloRegistro & { datos: DatosCiclo };

const fechaCorta = (iso: string) => iso.slice(5).split('-').reverse().join('/');

const ETIQUETAS_ESTADO: Record<EstadoHoy, string> = {
  en_ventana: 'Estamos dentro de la ventana estimada.',
  antes_de_ventana: 'La ventana estimada todavía no empieza.',
  despues_de_ventana: 'La ventana estimada ya pasó: si hubo sangrado, registralo para recalibrar.',
  sin_estimacion: '',
};

/** Calendario del mes: sangrado (magenta), manchado (claro), ventana estimada (crema). */
function CalendarioCiclo({
  hoyIso,
  fechasSangrado,
  fechasManchado,
  ventanaDesde,
  ventanaHasta,
}: {
  hoyIso: string;
  fechasSangrado: Set<string>;
  fechasManchado: Set<string>;
  ventanaDesde?: string;
  ventanaHasta?: string;
}) {
  const fecha = isoAFecha(hoyIso);
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const prefijo = `${anio}-${String(mes + 1).padStart(2, '0')}-`;
  const nombreMes = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  return (
    <div>
      <p className="text-center text-sm font-semibold capitalize text-zinc-700">{nombreMes}</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400">
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
          const enVentana = ventanaDesde !== undefined && ventanaHasta !== undefined && iso >= ventanaDesde && iso <= ventanaHasta;
          const sangrado = fechasSangrado.has(iso);
          const manchado = fechasManchado.has(iso);
          const clases = sangrado
            ? 'bg-marca-magenta font-bold text-white'
            : manchado
              ? 'bg-marca-magenta/50 font-semibold text-white'
              : enVentana
                ? 'border border-dashed border-marca-magenta/60 bg-marca-crema/70 text-zinc-700'
                : 'bg-zinc-50 text-zinc-400';
          return (
            <span
              key={iso}
              title={`${iso}${sangrado ? ' · sangrado' : manchado ? ' · manchado' : enVentana ? ' · ventana estimada' : ''}`}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${clases} ${
                iso === hoyIso ? 'ring-2 ring-zinc-800/50' : ''
              }`}
            >
              {dia}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        <span className="font-semibold text-marca-magenta">●</span> sangrado ·{' '}
        <span className="text-marca-magenta/70">●</span> manchado · recuadro punteado: ventana estimada · anillo: hoy
      </p>
    </div>
  );
}

export default function Ciclo() {
  const { cargando, perfil } = usePerfil();
  const [consentimiento, setConsentimiento] = useState<boolean | null>(null);
  const [registros, setRegistros] = useState<RegistroLegible[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [flujo, setFlujo] = useState<FlujoCiclo | ''>('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [notas, setNotas] = useState('');
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

  // Precarga el registro de hoy si existe.
  useEffect(() => {
    if (consentimiento !== true || cargandoDatos) return;
    const hoy = fechaHoyIso();
    const deHoy = registros.find((r) => r.fecha === hoy);
    setFlujo(deHoy?.datos.flujo ?? '');
    setSintomas(deHoy?.datos.sintomas ?? []);
    setNotas(deHoy?.datos.notas ?? '');
  }, [consentimiento, cargandoDatos, registros]);

  const activar = async () => {
    if (!perfil) return;
    await otorgarConsentimiento(perfil.id, 'menstrual');
    setConsentimiento(true);
  };

  const estimacion = useMemo(() => {
    if (consentimiento !== true) return null;
    return estimarCiclo(registros, fechaHoyIso());
  }, [registros, consentimiento]);

  if (cargando || cargandoDatos || consentimiento === null) return null;

  if (!perfil) {
    return (
      <main className="safe-area-inferior mx-auto max-w-md px-4 pb-24 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">Completá tu perfil primero.</p>
          <Link to="/onboarding" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Ir al onboarding
          </Link>
        </Tarjeta>
      </main>
    );
  }

  // PUERTA DE CONSENTIMIENTO: sin consentimiento explícito no se ve ni se carga nada del módulo.
  if (!consentimiento) {
    return (
      <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
        <Tarjeta>
          <h1 className="text-xl font-bold text-zinc-900">Ciclo menstrual</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Este módulo es opcional y privado. Antes de entrar, lo que necesitás saber:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>🔐 Tus registros (día de sangrado, síntomas, notas) se <strong>cifran en este dispositivo</strong> antes de guardarse.</li>
            <li>📵 Nada de esto viaja a internet, ni aparece en exportaciones en claro ni en ningún registro de actividad.</li>
            <li>🗑️ Podés borrar todo cuando quieras; también desde Ajustes con el borrado total.</li>
            <li>📊 Las estimaciones son orientativas, con rangos e incertidumbre visibles. <strong>No sirven para prevenir ni planificar embarazos</strong> ni reemplazan una consulta médica.</li>
          </ul>
          <div className="mt-5 flex flex-col gap-2">
            <BotonPrimario onClick={() => void activar()}>Entiendo y activo el módulo</BotonPrimario>
            <Link to="/">
              <BotonSecundario className="w-full">No, gracias</BotonSecundario>
            </Link>
          </div>
        </Tarjeta>
      </main>
    );
  }

  const hoy = fechaHoyIso();
  const deHoy = registros.find((r) => r.fecha === hoy);
  const episodios = episodiosSangrado(registros.map((r) => r.fecha)).reverse();
  const fechasSangrado = new Set(
    registros.filter((r) => r.datos.flujo !== 'manchado').map((r) => r.fecha),
  );
  const fechasManchado = new Set(registros.filter((r) => r.datos.flujo === 'manchado').map((r) => r.fecha));
  const estado = estadoDeHoy(estimacion ?? { suficiente: false, motivo: 'sin_registros' }, hoy);

  const guardar = async () => {
    setError('');
    setMensaje('');
    if (!flujo) {
      setError('Elegí la intensidad del flujo.');
      return;
    }
    await guardarRegistroCiclo(perfil.id, hoy, {
      flujo: flujo as FlujoCiclo,
      sintomas: sintomas,
      notas: notas.trim() === '' ? undefined : notas.trim(),
    });
    await cargarRegistros(perfil.id);
    setMensaje('Registro de hoy guardado 🔐');
  };

  const borrarHoy = async () => {
    await borrarRegistroCiclo(perfil.id, hoy);
    await cargarRegistros(perfil.id);
    setMensaje('Registro de hoy eliminado.');
  };

  const desactivar = async () => {
    if (confirmandoBorrado === 0) {
      setConfirmandoBorrado(1);
      return;
    }
    await revocarConsentimiento(perfil.id, 'menstrual');
    await borrarTodosRegistrosCiclo(perfil.id);
    setConfirmandoBorrado(0);
    setConsentimiento(false);
    setRegistros([]);
  };

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Ciclo menstrual</h1>
          <p className="text-sm text-zinc-500">Privado: cifrado en este dispositivo 🔐</p>
        </div>
      </div>

      {/* Estimación con incertidumbre visible */}
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
                  ? 'Tus últimas duraciones quedaron fuera del rango típico (21–35 días): la ventana es más amplia. Es normal; si te preocupa, conversalo con tu médica.'
                  : 'Tus ciclos varían bastante entre sí: por eso la ventana es más amplia. Es normal; si te preocupa, conversalo con tu médica.'}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">
            {estimacion && !estimacion.suficiente && estimacion.motivo === 'sin_registros'
              ? 'Registrá tus días de sangrado para armar tu primer ciclo.'
              : 'Con un solo ciclo registrado todavía no hay patrón: seguí registrando y en el próximo aparecen rangos.'}
          </p>
        )}
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          Estimación con incertidumbre, no una fecha exacta. No sirve para prevenir ni planificar embarazos y no reemplaza el consejo de profesionales de la salud.
        </p>
      </Tarjeta>

      {/* Registro de hoy */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Registro de hoy</h2>
        {deHoy && (
          <p className="text-xs text-zinc-500">Ya registraste hoy: podés editarlo o borrarlo.</p>
        )}
        <div className="mt-3 space-y-4">
          <Campo etiqueta="Flujo de hoy" error={error}>
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
        </div>
        {mensaje && <p className="mt-2 text-xs font-semibold text-green-700">{mensaje}</p>}
        <div className="mt-4 flex gap-2">
          <BotonPrimario onClick={() => void guardar()} className="flex-1">
            {deHoy ? 'Actualizar registro' : 'Guardar registro'}
          </BotonPrimario>
          {deHoy && (
            <BotonSecundario onClick={() => void borrarHoy()}>Borrar hoy</BotonSecundario>
          )}
        </div>
      </Tarjeta>

      {/* Calendario */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Calendario del mes</h2>
        <div className="mt-3">
          <CalendarioCiclo
            hoyIso={hoy}
            fechasSangrado={fechasSangrado}
            fechasManchado={fechasManchado}
            ventanaDesde={estimacion?.suficiente ? estimacion.ventanaDesde : undefined}
            ventanaHasta={estimacion?.suficiente ? estimacion.ventanaHasta : undefined}
          />
        </div>
      </Tarjeta>

      {/* Historial */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Historial</h2>
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
                <span className="text-xs text-zinc-400">{e.diasSangrado} {e.diasSangrado === 1 ? 'día' : 'días'} de sangrado</span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      {/* Control del módulo */}
      <Tarjeta>
        <h2 className="text-sm font-bold text-zinc-900">Desactivar el módulo</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Borra <strong>todos</strong> tus registros de ciclo de este dispositivo y desactiva el módulo.
        </p>
        {confirmandoBorrado > 0 && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            Esto no se puede deshacer. Tocá de nuevo para confirmar.
          </p>
        )}
        <BotonSecundario onClick={() => void desactivar()} className="mt-3 w-full">
          {confirmandoBorrado > 0 ? 'Sí, borrar todo y desactivar' : 'Desactivar y borrar mis datos de ciclo'}
        </BotonSecundario>
      </Tarjeta>

      <p className="text-center text-[11px] text-zinc-400">
        Los registros se cifran con una clave que vive solo en este dispositivo y nunca viaja a internet.
      </p>
    </main>
  );
}
