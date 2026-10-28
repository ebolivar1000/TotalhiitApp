import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { GraficoBarras, GraficoLinea, type BarraSerie } from '../componentes/graficos';
import { BotonPrimario, BotonSecundario, Campo, EntradaTexto, Tarjeta } from '../componentes/ui';
import { ETIQUETAS_OBJETIVO, type EntradaDiario, type WorkoutSession } from '../lib/datos/entidades';
import {
  aplicarCambiosPerfil,
  entradasDiarias,
  guardarEntradaDiaria,
  sesionesDeUsuario,
} from '../lib/datos/repositorio';
import { CATALOGO_SESIONES } from '../lib/entrenamiento/sesiones';
import { filtrarSesiones, ordenarPorObjetivo as ordenarSesiones } from '../lib/entrenamiento/filtros';
import { CATALOGO_RECETAS } from '../lib/nutricion/recetas';
import { filtrarRecetas, ordenarPorObjetivo as ordenarRecetas } from '../lib/nutricion/motor';
import { calcularAguaDiaria } from '../lib/salud/hidratacion';
import {
  lunesDeSemana,
  promedioUltimosDias,
  rachaDiasActivos,
  resumenesSemanales,
  sumarDias,
  tendenciaPeso,
} from '../lib/progreso/metricas';
import { sugerenciasDashboard } from '../lib/progreso/recomendaciones';
import { fechaHoyIso, isoAFecha } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';

const formatoNumero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

interface FormularioDiario {
  peso: string;
  energia: string;
  animo: string;
  horasSueno: string;
  calidadSueno: string;
  vasos: string;
  notas: string;
  actualizarPerfil: boolean;
}

const FORM_VACIO: FormularioDiario = {
  peso: '',
  energia: '',
  animo: '',
  horasSueno: '',
  calidadSueno: '',
  vasos: '',
  notas: '',
  actualizarPerfil: true,
};

/** Escala 1–5 como chips redondos (energía, ánimo, calidad de sueño). */
function EscalaChips({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5" role="group">
      {[1, 2, 3, 4, 5].map((n) => {
        const activo = valor === String(n);
        return (
          <button
            key={n}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(activo ? '' : String(n))}
            className={`h-9 w-9 rounded-full border text-sm transition-colors ${
              activo
                ? 'border-marca-magenta bg-marca-crema font-bold text-marca-magenta-oscuro'
                : 'border-zinc-300 bg-white text-zinc-600'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/** Calendario del mes en curso: entrenamientos (relleno magenta), registros (borde verde). */
function CalendarioMes({
  hoyIso,
  fechasEntrenamiento,
  fechasRegistro,
}: {
  hoyIso: string;
  fechasEntrenamiento: Set<string>;
  fechasRegistro: Set<string>;
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
          const entreno = fechasEntrenamiento.has(iso);
          const registro = fechasRegistro.has(iso);
          const esHoy = iso === hoyIso;
          return (
            <span
              key={iso}
              title={`${iso}${entreno ? ' · entrenamiento' : ''}${registro ? ' · registro diario' : ''}`}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${
                entreno
                  ? 'bg-marca-magenta font-bold text-white'
                  : registro
                    ? 'border border-green-500 text-zinc-700'
                    : 'bg-zinc-50 text-zinc-400'
              } ${esHoy ? 'ring-2 ring-marca-magenta/50' : ''}`}
            >
              {dia}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        <span className="font-semibold text-marca-magenta">●</span> entrenamiento ·{' '}
        <span className="font-semibold text-green-600">▢</span> registro diario · anillo: hoy
      </p>
    </div>
  );
}

export default function Progreso() {
  const { cargando, perfil, preferencias, objetivo } = usePerfil();
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [sesiones, setSesiones] = useState<WorkoutSession[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [form, setForm] = useState<FormularioDiario>(FORM_VACIO);
  const [formCargado, setFormCargado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!perfil) {
      setCargandoDatos(false);
      return;
    }
    void (async () => {
      const [misEntradas, misSesiones] = await Promise.all([
        entradasDiarias(perfil.id),
        sesionesDeUsuario(perfil.id),
      ]);
      setEntradas(misEntradas);
      setSesiones(misSesiones);
      setCargandoDatos(false);
    })();
  }, [perfil]);

  // Precarga el registro de hoy si ya existe (todo editable).
  useEffect(() => {
    if (!perfil || cargandoDatos || formCargado) return;
    const hoy = fechaHoyIso();
    const deHoy = entradas.find((e) => e.fecha === hoy);
    setForm({
      peso: deHoy?.pesoKg !== undefined ? String(deHoy.pesoKg) : '',
      energia: deHoy?.energiaNivel !== undefined ? String(deHoy.energiaNivel) : '',
      animo: deHoy?.animoNivel !== undefined ? String(deHoy.animoNivel) : '',
      horasSueno: deHoy?.horasSueno !== undefined ? String(deHoy.horasSueno) : '',
      calidadSueno: deHoy?.calidadSueno !== undefined ? String(deHoy.calidadSueno) : '',
      vasos: deHoy?.vasosAgua !== undefined ? String(deHoy.vasosAgua) : '',
      notas: deHoy?.notas ?? '',
      actualizarPerfil: true,
    });
    setFormCargado(true);
  }, [perfil, cargandoDatos, entradas, formCargado]);

  const vista = useMemo(() => {
    if (!perfil) return null;
    const hoy = fechaHoyIso();
    const fechasSesiones = sesiones.map((s) => s.fecha);
    const fechasRegistro = entradas.map((e) => e.fecha);
    const deHoy = entradas.find((e) => e.fecha === hoy);

    const racha = rachaDiasActivos([...fechasSesiones, ...fechasRegistro], hoy);
    const energiaProm = promedioUltimosDias(entradas, 'energiaNivel', 7, hoy);
    const suenoProm = promedioUltimosDias(entradas, 'horasSueno', 7, hoy);
    const vasosHoy = deHoy?.vasosAgua;
    const litrosDia = calcularAguaDiaria(perfil.pesoKg) ?? 2;
    const metaVasos = Math.ceil((litrosDia * 1000) / 250);

    const conPeso = entradas
      .filter((e) => e.pesoKg !== undefined)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const pesoActual = conPeso[conPeso.length - 1]?.pesoKg ?? perfil.pesoKg;
    const fechaUltimoPeso = conPeso[conPeso.length - 1]?.fecha;
    const tendencia = tendenciaPeso(entradas, hoy, 30);

    const seriePeso = conPeso
      .filter((e) => e.fecha >= sumarDias(hoy, -30))
      .map((e) => ({ etiqueta: e.fecha.slice(5).split('-').reverse().join('/'), valor: e.pesoKg! }));

    const serieDias = (campo: 'horasSueno' | 'energiaNivel'): BarraSerie[] =>
      Array.from({ length: 7 }, (_, i) => {
        const iso = sumarDias(hoy, -(6 - i));
        const entrada = entradas.find((e) => e.fecha === iso);
        const valor = entrada?.[campo];
        return {
          etiqueta: String(isoAFecha(iso).getDate()),
          valor: valor ?? 0,
          vacio: valor === undefined,
        };
      });

    const sesionesUltimos7 = fechasSesiones.filter((f) => f >= sumarDias(hoy, -6)).length;
    const sesionesSemanaPasada = fechasSesiones.filter(
      (f) => f >= sumarDias(hoy, -13) && f <= sumarDias(hoy, -7),
    ).length;

    const sesionSugerida = ordenarSesiones(
      filtrarSesiones(CATALOGO_SESIONES, { equipamiento: perfil.equipamiento }),
      objetivo?.tipo,
    )[0];
    const recetasFiltradas = ordenarRecetas(
      filtrarRecetas(CATALOGO_RECETAS, {
        alergenos: preferencias?.alergenos,
        exclusiones: preferencias?.exclusiones,
        presupuesto: preferencias?.presupuesto,
      }),
      objetivo?.tipo,
    );
    const recetaSugerida = recetasFiltradas[0];

    const sugerencias = sugerenciasDashboard({
      hoy,
      entradas,
      sesionesUltimos7Dias: sesionesUltimos7,
      sesionesSemanaPasada: sesionesSemanaPasada,
      vasosHoy: vasosHoy,
      metaVasos,
      ultimaFechaPeso: fechaUltimoPeso,
      sugerenciaEntrenamiento: sesionSugerida?.titulo ?? 'una clase del catálogo',
      sugerenciaReceta: recetaSugerida?.nombre ?? 'una receta del catálogo',
    });

    return {
      hoy,
      racha,
      energiaProm,
      suenoProm,
      vasosHoy,
      metaVasos,
      pesoActual,
      fechaUltimoPeso,
      tendencia,
      seriePeso,
      serieSueno: serieDias('horasSueno'),
      serieEnergia: serieDias('energiaNivel'),
      semanas: resumenesSemanales(entradas, fechasSesiones, hoy, 4),
      sugerencias,
      fechasEntrenamiento: new Set(fechasSesiones),
      fechasRegistro: new Set(fechasRegistro),
      lunesActual: lunesDeSemana(hoy),
    };
  }, [perfil, entradas, sesiones, preferencias, objetivo]);

  if (cargando || cargandoDatos) return null;

  if (!perfil || !vista) {
    return (
      <main className="safe-area-inferior mx-auto max-w-md px-4 pb-24 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">Primero completá tu perfil para ver tu progreso.</p>
          <Link to="/onboarding" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Completar onboarding
          </Link>
        </Tarjeta>
      </main>
    );
  }

  const setear = (campo: keyof FormularioDiario, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const guardar = async () => {
    setError('');
    const numero = (s: string): number | undefined => (s.trim() === '' ? undefined : Number(s));
    const pesoKg = numero(form.peso);
    const horasSueno = numero(form.horasSueno);
    if (pesoKg !== undefined && (Number.isNaN(pesoKg) || pesoKg < 25 || pesoKg > 400)) {
      setError('El peso debe estar entre 25 y 400 kg.');
      return;
    }
    if (horasSueno !== undefined && (Number.isNaN(horasSueno) || horasSueno < 0 || horasSueno > 16)) {
      setError('Las horas de sueño deben estar entre 0 y 16.');
      return;
    }
    await guardarEntradaDiaria(perfil.id, vista.hoy, {
      pesoKg: pesoKg,
      energiaNivel: numero(form.energia),
      animoNivel: numero(form.animo),
      horasSueno: horasSueno,
      calidadSueno: numero(form.calidadSueno),
      vasosAgua: numero(form.vasos),
      notas: form.notas.trim() === '' ? undefined : form.notas.trim(),
    });
    if (form.actualizarPerfil && pesoKg !== undefined) {
      await aplicarCambiosPerfil(perfil.id, { pesoKg: pesoKg });
    }
    setEntradas(await entradasDiarias(perfil.id));
    setMensaje('Registro de hoy guardado 💜');
  };

  const etiquetaSemana = (inicio: string) =>
    `Semana del ${inicio.slice(5).split('-').reverse().join('/')}`;

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Progreso y hábitos</h1>
        <p className="text-sm text-zinc-500">
          Sin puntuaciones ni culpas: acá se ve lo que venís construyendo, día a día.
        </p>
      </div>

      {/* Racha */}
      <Tarjeta className="bg-gradient-to-br from-marca-magenta to-marca-magenta-oscuro text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">
              {vista.racha} {vista.racha === 1 ? 'día' : 'días'}
            </p>
            <p className="text-sm opacity-90">de actividad seguida (entreno o registro)</p>
          </div>
          <span aria-hidden="true" className="text-4xl">
            🔥
          </span>
        </div>
      </Tarjeta>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Tarjeta>
          <p className="text-xs font-semibold uppercase text-zinc-500">Energía (7 días)</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {vista.energiaProm !== null ? `${formatoNumero.format(vista.energiaProm)}/5` : '—'}
          </p>
        </Tarjeta>
        <Tarjeta>
          <p className="text-xs font-semibold uppercase text-zinc-500">Sueño (7 días)</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {vista.suenoProm !== null ? `${formatoNumero.format(vista.suenoProm)} h` : '—'}
          </p>
        </Tarjeta>
        <Tarjeta>
          <p className="text-xs font-semibold uppercase text-zinc-500">Agua de hoy</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {vista.vasosHoy !== undefined ? `${vista.vasosHoy}/${vista.metaVasos}` : '—'}
          </p>
          <p className="text-xs text-zinc-500">vasos de 250 ml</p>
        </Tarjeta>
        <Tarjeta>
          <p className="text-xs font-semibold uppercase text-zinc-500">Peso actual</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {formatoNumero.format(vista.pesoActual)} kg
          </p>
          {vista.tendencia ? (
            <p className="text-xs text-zinc-500">
              {vista.tendencia.deltaKg === 0
                ? 'estable'
                : `${vista.tendencia.deltaKg > 0 ? '+' : ''}${formatoNumero.format(vista.tendencia.deltaKg)} kg vs mes previo`}
            </p>
          ) : (
            <p className="text-xs text-zinc-500">tendencia con 2+ registros</p>
          )}
        </Tarjeta>
      </div>

      {/* Registro de hoy */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Registro de hoy</h2>
        <p className="text-xs text-zinc-500">Todo opcional. Guardás y editás las veces que quieras.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Campo etiqueta="Peso (kg)" htmlFor="peso">
            <EntradaTexto
              id="peso"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="25"
              max="400"
              value={form.peso}
              onChange={(e) => setear('peso', e.target.value)}
              placeholder="ej. 68,5"
            />
          </Campo>
          <Campo etiqueta="Vasos de agua" htmlFor="vasos">
            <EntradaTexto
              id="vasos"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="24"
              value={form.vasos}
              onChange={(e) => setear('vasos', e.target.value)}
              placeholder={`meta ~${vista.metaVasos}`}
            />
          </Campo>
          <Campo etiqueta="Horas de sueño" htmlFor="sueno">
            <EntradaTexto
              id="sueno"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="16"
              value={form.horasSueno}
              onChange={(e) => setear('horasSueno', e.target.value)}
              placeholder="ej. 7,5"
            />
          </Campo>
          <Campo etiqueta="Calidad del sueño (1–5)" htmlFor="calidad">
            <EscalaChips valor={form.calidadSueno} onChange={(v) => setear('calidadSueno', v)} />
          </Campo>
          <Campo etiqueta="Energía de hoy (1–5)">
            <EscalaChips valor={form.energia} onChange={(v) => setear('energia', v)} />
          </Campo>
          <Campo etiqueta="Ánimo (1–5)">
            <EscalaChips valor={form.animo} onChange={(v) => setear('animo', v)} />
          </Campo>
        </div>
        <div className="mt-3">
          <Campo etiqueta="Notas (opcional)" htmlFor="notas">
            <textarea
              id="notas"
              rows={2}
              maxLength={500}
              value={form.notas}
              onChange={(e) => setear('notas', e.target.value)}
              placeholder="¿Cómo te sentiste hoy?"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-marca-magenta focus:ring-2 focus:ring-marca-magenta/20"
            />
          </Campo>
        </div>
        {form.peso.trim() !== '' && (
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={form.actualizarPerfil}
              onChange={(e) => setear('actualizarPerfil', e.target.checked)}
              className="h-4 w-4 accent-[#b00050]"
            />
            Actualizar también mi perfil (para las calculadoras de salud)
          </label>
        )}
        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
        {mensaje && <p className="mt-2 text-xs font-semibold text-green-700">{mensaje}</p>}
        <BotonPrimario onClick={() => void guardar()} className="mt-4 w-full">
          Guardar registro
        </BotonPrimario>
      </Tarjeta>

      {/* Gráficos de tendencia */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Tendencia de peso (30 días)</h2>
        <div className="mt-2">
          <GraficoLinea puntos={vista.seriePeso} formato={(v) => `${formatoNumero.format(v)} kg`} />
        </div>
      </Tarjeta>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Tarjeta>
          <h2 className="text-sm font-bold text-zinc-900">Sueño (últimos 7 días)</h2>
          <div className="mt-2">
            <GraficoBarras barras={vista.serieSueno} maximo={10} formato={(v) => `${v}h`} />
          </div>
        </Tarjeta>
        <Tarjeta>
          <h2 className="text-sm font-bold text-zinc-900">Energía (últimos 7 días)</h2>
          <div className="mt-2">
            <GraficoBarras barras={vista.serieEnergia} maximo={5} formato={(v) => `${v}`} />
          </div>
        </Tarjeta>
      </div>

      {/* Calendario de actividad */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Calendario de actividad</h2>
        <div className="mt-3">
          <CalendarioMes
            hoyIso={vista.hoy}
            fechasEntrenamiento={vista.fechasEntrenamiento}
            fechasRegistro={vista.fechasRegistro}
          />
        </div>
      </Tarjeta>

      {/* Resúmenes semanales */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Últimas 4 semanas</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {vista.semanas.map((s) => (
            <li key={s.inicio} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
              <span>
                <span className="font-semibold text-zinc-800">{etiquetaSemana(s.inicio)}</span>
                <br />
                {s.diasActivos > 0
                  ? `${s.diasActivos} ${s.diasActivos === 1 ? 'día activo' : 'días activos'}`
                  : 'sin entrenos registrados'}
                {s.promedioSueno !== null && ` · sueño ~${formatoNumero.format(s.promedioSueno)} h`}
                {s.promedioEnergia !== null && ` · energía ${formatoNumero.format(s.promedioEnergia)}/5`}
              </span>
              <span className="text-xs text-zinc-400">
                {s.registros > 0 ? `${s.registros} reg.` : '—'}
              </span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      {/* Sugerencias del motor (sin IA) */}
      <Tarjeta>
        <h2 className="font-bold text-zinc-900">Sugerencias para vos</h2>
        {objetivo && (
          <p className="text-xs text-zinc-500">
            Basadas en tu objetivo: {ETIQUETAS_OBJETIVO[objetivo.tipo]}.
          </p>
        )}
        <ul className="mt-3 space-y-3">
          {vista.sugerencias.map((s) => (
            <li key={s.id} className="flex gap-3 rounded-xl bg-marca-crema/60 p-3">
              <span aria-hidden="true" className="text-xl">
                {s.icono}
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-900">{s.titulo}</span>
                <span className="block text-xs text-zinc-600">{s.detalle}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Link to="/entrenamientos" className="flex-1">
            <BotonPrimario className="w-full">Ver entrenamientos</BotonPrimario>
          </Link>
          <Link to="/nutricion" className="flex-1">
            <BotonSecundario className="w-full">Ver recetas</BotonSecundario>
          </Link>
        </div>
      </Tarjeta>

      <p className="text-center text-[11px] text-zinc-400">
        Tus registros viven solo en este dispositivo. Nada de esto es un diagnóstico.
      </p>
      <Link to="/ciclo" className="block">
        <Tarjeta className="text-center">
          <p className="text-sm font-semibold text-zinc-800">🌸 Ciclo menstrual</p>
          <p className="mt-1 text-xs text-zinc-500">Calendario privado y cifrado en este dispositivo. Se activa solo si lo querés.</p>
        </Tarjeta>
      </Link>
    </main>
  );
}
